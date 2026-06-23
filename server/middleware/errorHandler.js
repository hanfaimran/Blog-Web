const AppError = require('../utils/AppError');

/**
 * Global error handler middleware.
 * Catches all errors thrown or passed via next(err).
 *
 * - Operational errors (AppError): returns the defined message + statusCode.
 * - Mongoose validation errors: maps to 400 with field-level details.
 * - Mongoose duplicate key errors: maps to 409 Conflict.
 * - Mongoose cast errors (bad ObjectId): maps to 400.
 * - Unknown errors: returns 500 with generic message (no leak).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // ── Mongoose Validation Error ─────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose Duplicate Key Error ──────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for '${field}'. This ${field} already exists.`;
  }

  // ── Mongoose Cast Error (invalid ObjectId, etc.) ──────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── JWT Errors ────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please refresh your session.';
  }

  // ── Log unexpected errors in development ──────────────────────────
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 ERROR:', err);
  }

  // ── Send response ────────────────────────────────────────────────
  const response = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  // In development, include the stack trace
  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
