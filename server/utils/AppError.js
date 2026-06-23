/**
 * Custom application error class.
 * Extends native Error with an HTTP statusCode and operational flag.
 * The global error handler uses `isOperational` to distinguish
 * expected errors from unexpected crashes.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Capture stack trace, excluding this constructor from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
