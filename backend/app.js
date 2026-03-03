/**
 * Express application setup.
 * Configures middleware chain and routes. Exports the app (no listen).
 */
const express = require('express');
const cors = require('cors');
const ticketRoutes = require('./routes/ticketRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { initDB } = require('./config/db');

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());

// --------------- Routes ---------------
app.use('/api', ticketRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- Error Handler ---------------
app.use(errorHandler);

// --------------- DB Init ---------------
// Initialize DB (create table) on first import — non-blocking
initDB().catch((err) => {
    console.error('Database initialization failed:', err.message);
});

// For local development: start server if run directly
if (require.main === module) {
    require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
