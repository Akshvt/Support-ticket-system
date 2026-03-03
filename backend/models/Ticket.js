/**
 * Ticket model — wraps SQL queries in clean async functions.
 */
const { query } = require('../config/db');

const VALID_CATEGORIES = ['billing', 'technical', 'account', 'general'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

/**
 * Fetch all tickets with optional filters, ordered by newest first.
 */
async function findAll({ category, priority, status, search } = {}) {
    let sql = 'SELECT * FROM tickets WHERE 1=1';
    const params = [];
    let idx = 1;

    if (category) {
        sql += ` AND category = $${idx++}`;
        params.push(category);
    }
    if (priority) {
        sql += ` AND priority = $${idx++}`;
        params.push(priority);
    }
    if (status) {
        sql += ` AND status = $${idx++}`;
        params.push(status);
    }
    if (search) {
        sql += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return result.rows;
}

/**
 * Find a single ticket by ID.
 */
async function findById(id) {
    const result = await query('SELECT * FROM tickets WHERE id = $1', [id]);
    return result.rows[0] || null;
}

/**
 * Create a new ticket. Returns the created ticket.
 */
async function create({ title, description, category, priority }) {
    const result = await query(
        `INSERT INTO tickets (title, description, category, priority)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [title, description, category, priority]
    );
    return result.rows[0];
}

/**
 * Update a ticket by ID. Only updates provided fields. Returns the updated ticket.
 */
async function update(id, data) {
    const allowedFields = ['title', 'description', 'category', 'priority', 'status'];
    const setClauses = [];
    const params = [];
    let idx = 1;

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            setClauses.push(`${field} = $${idx++}`);
            params.push(data[field]);
        }
    }

    if (setClauses.length === 0) {
        return findById(id);
    }

    params.push(id);
    const sql = `UPDATE tickets SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, params);
    return result.rows[0] || null;
}

/**
 * Get aggregated statistics.
 */
async function getStats() {
    const [totalRes, openRes, priorityRes, categoryRes, dailyRes] = await Promise.all([
        query('SELECT COUNT(*) AS count FROM tickets'),
        query("SELECT COUNT(*) AS count FROM tickets WHERE status = 'open'"),
        query('SELECT priority, COUNT(*) AS count FROM tickets GROUP BY priority'),
        query('SELECT category, COUNT(*) AS count FROM tickets GROUP BY category'),
        query('SELECT created_at::date AS date, COUNT(*) AS count FROM tickets GROUP BY created_at::date'),
    ]);

    const totalTickets = parseInt(totalRes.rows[0].count, 10);
    const openTickets = parseInt(openRes.rows[0].count, 10);

    const priorityBreakdown = {};
    for (const row of priorityRes.rows) {
        priorityBreakdown[row.priority] = parseInt(row.count, 10);
    }

    const categoryBreakdown = {};
    for (const row of categoryRes.rows) {
        categoryBreakdown[row.category] = parseInt(row.count, 10);
    }

    const totalDays = dailyRes.rows.length;
    const avgPerDay = totalDays > 0 ? Math.round((totalTickets / totalDays) * 10) / 10 : 0;

    return {
        total_tickets: totalTickets,
        open_tickets: openTickets,
        avg_tickets_per_day: avgPerDay,
        priority_breakdown: priorityBreakdown,
        category_breakdown: categoryBreakdown,
    };
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    getStats,
    VALID_CATEGORIES,
    VALID_PRIORITIES,
    VALID_STATUSES,
};
