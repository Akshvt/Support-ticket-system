/**
 * LLM integration service for auto-classifying support tickets.
 * Uses OpenAI-compatible API to suggest category and priority.
 */
const OpenAI = require('openai');

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
 * Classify a ticket description using OpenAI.
 * Returns { suggested_category, suggested_priority } or null on failure.
 */
async function classifyTicket(description) {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
        console.warn('LLM_API_KEY not configured — skipping classification');
        return null;
    }

    try {
        const client = new OpenAI({ apiKey });
        const model = process.env.LLM_MODEL || 'gpt-3.5-turbo';

        const response = await client.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: CLASSIFICATION_PROMPT },
                { role: 'user', content: `Ticket description:\n${description}` },
            ],
            temperature: 0.1,
            max_tokens: 100,
        });

        const content = response.choices[0].message.content.trim();
        const result = JSON.parse(content);

        const category = (result.suggested_category || '').toLowerCase();
        const priority = (result.suggested_priority || '').toLowerCase();

        if (!VALID_CATEGORIES.includes(category) || !VALID_PRIORITIES.includes(priority)) {
            console.warn('LLM returned invalid classification:', result);
            return null;
        }

        return { suggested_category: category, suggested_priority: priority };
    } catch (err) {
        console.error('LLM classification failed:', err.message);
        return null;
    }
}

module.exports = { classifyTicket };
