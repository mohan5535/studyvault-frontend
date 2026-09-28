// Centralized error handler. Every route/controller should forward errors
// here via next(err) instead of sending ad-hoc error responses, so the API
// always returns a consistent error shape and never leaks stack traces
// to the client in production.

// 404 handler for any /api/* route that doesn't match a defined route.
// Mounted AFTER all real routes, BEFORE the error handler.
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

// Express recognizes this as an error-handling middleware because it takes
// 4 arguments. Must be registered last, after all routes and notFoundHandler.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && Number.isInteger(err.statusCode)
    ? err.statusCode
    : 500;

  const isProduction = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    // Log full detail server-side regardless of environment.
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: statusCode >= 500 && isProduction
        ? 'Internal server error'
        : err.message || 'Internal server error',
      ...(err.fields ? { fields: err.fields } : {}),
      ...(!isProduction && err.stack ? { stack: err.stack } : {}),
    },
  });
}

module.exports = { notFoundHandler, errorHandler };
