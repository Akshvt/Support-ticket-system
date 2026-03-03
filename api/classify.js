/**
 * Standalone Vercel serverless function for AI ticket classification.
 * No Express, no DB — just OpenAI. Fast cold start.
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
    const model = process.env.LLM_MODEL || 'gpt-3.5-turbo';

    if (!apiKey) {
        return res.json({
            suggested_category: null,
            suggested_priority: null,
            error: 'LLM_API_KEY not configured.',
        });
    }

    try {
        const client = new OpenAI({ apiKey });
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
