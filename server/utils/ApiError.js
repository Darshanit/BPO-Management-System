/**
 * Standardized operational error class.
 * Thrown deliberately (bad input, unauthorized, not found, etc.)
 * so the global error handler can format a consistent JSON response.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
