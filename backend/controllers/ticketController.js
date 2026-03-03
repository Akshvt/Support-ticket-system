/**
 * Ticket controllers — request handling and response logic.
 */
const Ticket = require('../models/Ticket');
const { classifyTicket } = require('../services/llmService');

/**
 * GET /tickets/ — List all tickets with optional filters.
 */
async function listTickets(req, res, next) {
    try {
        const { category, priority, status, search } = req.query;
        const tickets = await Ticket.findAll({ category, priority, status, search });
        res.json(tickets);
    } catch (err) {
        next(err);
    }
}

/**
 * POST /tickets/ — Create a new ticket.
 */
async function createTicket(req, res, next) {
    try {
        const { title, description, category, priority } = req.body;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'title is required' });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ error: 'description is required' });
        }
        if (!Ticket.VALID_CATEGORIES.includes(category)) {
            return res.status(400).json({ error: `category must be one of: ${Ticket.VALID_CATEGORIES.join(', ')}` });
        }
        if (!Ticket.VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({ error: `priority must be one of: ${Ticket.VALID_PRIORITIES.join(', ')}` });
        }

        const ticket = await Ticket.create({
            title: title.trim(),
            description: description.trim(),
            category,
            priority,
        });

        res.status(201).json(ticket);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /tickets/:id/ — Get a single ticket.
 */
async function getTicket(req, res, next) {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json(ticket);
    } catch (err) {
        next(err);
    }
}

/**
 * PATCH /tickets/:id/ — Update a ticket.
 */
async function updateTicket(req, res, next) {
    try {
        const existing = await Ticket.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Validate provided fields
        const { category, priority, status } = req.body;
        if (category && !Ticket.VALID_CATEGORIES.includes(category)) {
            return res.status(400).json({ error: `category must be one of: ${Ticket.VALID_CATEGORIES.join(', ')}` });
        }
        if (priority && !Ticket.VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({ error: `priority must be one of: ${Ticket.VALID_PRIORITIES.join(', ')}` });
        }
        if (status && !Ticket.VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: `status must be one of: ${Ticket.VALID_STATUSES.join(', ')}` });
        }

        const updated = await Ticket.update(req.params.id, req.body);
        res.json(updated);
    } catch (err) {
        next(err);
    }
}

/**
 * GET /tickets/stats/ — Aggregated statistics.
 */
async function getStats(req, res, next) {
    try {
        const stats = await Ticket.getStats();
        res.json(stats);
    } catch (err) {
        next(err);
    }
}

/**
 * POST /tickets/classify/ — AI classification.
 */
async function classify(req, res, next) {
    try {
        const { description } = req.body;
        if (!description || !description.trim()) {
            return res.status(400).json({ error: 'description is required' });
        }

        const result = await classifyTicket(description.trim());

        if (!result) {
            return res.json({
                suggested_category: null,
                suggested_priority: null,
                error: 'LLM classification unavailable. Please select manually.',
            });
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listTickets,
    createTicket,
    getTicket,
    updateTicket,
    getStats,
    classify,
};
