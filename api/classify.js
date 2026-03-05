/**
 * Standalone Vercel serverless function for AI ticket classification.
 * Uses Google Gemini (free tier). No Express, no DB — fast cold start.
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

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { description } = req.body || {};
    if (!description || !description.trim()) {
        return res.status(400).json({ error: 'description is required' });
    }

    const apiKey = process.env.LLM_API_KEY || '';
    const modelName = process.env.LLM_MODEL || 'gemini-2.0-flash';

    if (!apiKey) {
        return res.json({
            suggested_category: null,
            suggested_priority: null,
            error: 'LLM_API_KEY not configured.',
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
            { text: CLASSIFICATION_PROMPT },
            { text: `Ticket description:\n${description}` },
        ]);

        const responseText = result.response.text().trim();
        const jsonStr = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(jsonStr);

        const category = (parsed.suggested_category || '').toLowerCase();
        const priority = (parsed.suggested_priority || '').toLowerCase();

        if (!VALID_CATEGORIES.includes(category) || !VALID_PRIORITIES.includes(priority)) {
            return res.json({
                suggested_category: null,
                suggested_priority: null,
                error: 'LLM returned invalid classification.',
            });
        }

        return res.json({ suggested_category: category, suggested_priority: priority });
    } catch (err) {
        return res.json({
            suggested_category: null,
            suggested_priority: null,
            error: `Classification failed: ${err.message}`,
        });
    }
};
