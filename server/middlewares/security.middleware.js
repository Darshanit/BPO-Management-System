const rateLimit = require('express-rate-limit');
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/** General API rate limiter - applied globally. */
const apiLimiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MIN) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

/** Stricter limiter for sensitive auth endpoints (login, forgot-password, OTP). */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again in 15 minutes' },
});

/**
 * Runs after express-validator chains in a route to collect validation errors
 * into a single formatted ApiError, rather than repeating this in every controller.
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ApiError(400, 'Validation failed', formatted));
  }
  next();
};

module.exports = { apiLimiter, authLimiter, validateRequest };
