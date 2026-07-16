const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { verifyAccessToken } = require('../utils/generateTokens');

/**
 * Protects routes by requiring a valid access token in the Authorization header.
 * Attaches the authenticated user document to `req.user`.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, no access token provided');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired');
    }
    throw new ApiError(401, 'Not authorized, invalid token');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'The user belonging to this token no longer exists');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been deactivated. Contact your administrator');
  }

  // Invalidate token if password was changed after it was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    throw new ApiError(401, 'Password was recently changed. Please log in again');
  }

  req.user = user;
  next();
});

module.exports = protect;
