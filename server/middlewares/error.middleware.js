const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

/**
 * Converts known error types (Mongoose validation/cast/duplicate key, JWT errors)
 * into a consistent ApiError shape, then formats the final JSON response.
 * Must be registered LAST in the middleware chain.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    // Mongoose bad ObjectId
    if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid value for field: ${error.path}`;
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
    }

    // Mongoose duplicate key
    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0];
      message = `Duplicate value for field: ${field}`;
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    }
    if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
    }

    error = new ApiError(statusCode, message);
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${error.message}\n${error.stack}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.message}`);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

/** Catches requests to undefined routes and forwards a 404 ApiError. */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
