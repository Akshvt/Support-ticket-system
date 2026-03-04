/**
 * PostgreSQL connection pool.
 * Reads DATABASE_URL from environment. Auto-creates the tickets table on first connect.
 */
const { Pool } = require('pg');

let pool;

function getPool() {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        pool = new Pool({
            connectionString,
            ssl: { rejectUnauthorized: false },
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
    }
    return pool;
}

/**
 * Run a parameterized query against the pool.
 */
async function query(text, params) {
    const client = await getPool().connect();
    try {
        const result = await client.query(text, params);
        return result;
    } finally {
        client.release();
    }
}

/**
 * Auto-create the tickets table if it doesn't exist.
 */
async function initDB() {
    await query(`
        CREATE TABLE IF NOT EXISTS tickets (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(20) NOT NULL CHECK (category IN ('billing', 'technical', 'account', 'general')),
            priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
            status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);
}

module.exports = { query, initDB, getPool };
