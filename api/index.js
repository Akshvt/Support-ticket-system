/**
 * Vercel serverless entry point — imports the Express app.
 * All /api/* routes (except classify) are forwarded here.
 */
const app = require('../backend/app');

module.exports = app;
