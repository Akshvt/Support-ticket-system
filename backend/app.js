/**
 * Express application setup.
 * Configures middleware chain, routes, and serves built frontend.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const path = require('path');
const cors = require('cors');
const ticketRoutes = require('./routes/ticketRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { initDB } = require('./config/db');

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());

// --------------- API Routes ---------------
app.use('/api', ticketRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --------------- Error Handler (API only) ---------------
app.use('/api', errorHandler);

// --------------- Serve Built Frontend ---------------
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

// SPA fallback — any non-API route serves index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// --------------- DB Init ---------------
// Initialize DB (create table) on first import — non-blocking
initDB().catch((err) => {
    console.error('Database initialization failed:', err.message);
});

// For local development: start server if run directly
if (require.main === module) {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
