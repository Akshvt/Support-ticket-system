/**
 * Global error handler middleware.
 * Catches unhandled errors and returns a clean JSON response.
 */
function errorHandler(err, req, res, _next) {
    console.error('Unhandled error:', err.message || err);

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error';

    res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
