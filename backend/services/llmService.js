/**
 * LLM integration service for auto-classifying support tickets.
 * Uses Google Gemini (free tier) to suggest category and priority.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const CLASSIFICATION_PROMPT = `You are a support ticket classifier. Given a support ticket description, you must classify it into exactly one category and one priority level.

Categories (pick exactly one):
- billing: Payment issues, invoices, refunds, subscription changes, pricing questions
- technical: Bugs, errors, crashes, performance issues, feature not working, API problems
- account: Login issues, password resets, profile changes, account deletion, permissions
- general: General questions, feedback, feature requests, documentation, anything else

Priority levels (pick exactly one):
- low: Minor issues, general questions, feature requests, no urgency
- medium: Moderate impact, workarounds available, not time-sensitive
- high: Significant impact, blocking work, needs attention soon
- critical: Service down, data loss, security issues, affects many users

Respond ONLY with a valid JSON object in this exact format:
{"suggested_category": "<category>", "suggested_priority": "<priority>"}

Do not include any other text, explanation, or markdown. Just the JSON object.`;

const VALID_CATEGORIES = ['billing', 'technical', 'account', 'general'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

/**
 * Classify a ticket description using Google Gemini.
 * Returns { suggested_category, suggested_priority } or null on failure.
 */
async function classifyTicket(description) {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
        console.warn('LLM_API_KEY not configured — skipping classification');
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: process.env.LLM_MODEL || 'gemini-2.0-flash',
        });

        const result = await model.generateContent([
            { text: CLASSIFICATION_PROMPT },
            { text: `Ticket description:\n${description}` },
        ]);

        const responseText = result.response.text().trim();
        // Strip markdown code fences if present
        const jsonStr = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(jsonStr);

        const category = (parsed.suggested_category || '').toLowerCase();
        const priority = (parsed.suggested_priority || '').toLowerCase();

        if (!VALID_CATEGORIES.includes(category) || !VALID_PRIORITIES.includes(priority)) {
            console.warn('LLM returned invalid classification:', parsed);
            return null;
        }

        return { suggested_category: category, suggested_priority: priority };
    } catch (err) {
        console.error('LLM classification failed:', err.message);
        return null;
    }
}

module.exports = { classifyTicket };
