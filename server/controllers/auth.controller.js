const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/generateTokens');
const {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
} = require('../services/email.service');
const { AuditLog } = require('../models/System');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: (Number(process.env.COOKIE_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000,
};

/** Issues access + refresh tokens, sets the refresh token as an httpOnly cookie. */
const issueTokens = async (res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  return accessToken;
};

// @route  POST /api/auth/register
// @access Public (self-registration defaults to 'employee'; other roles created by admins via /api/users)
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, 'An account with this email already exists');

  const user = await User.create({ name, email, password });

  const verificationToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendVerificationEmail(user.email, verifyUrl).catch(() => {});

  res
    .status(201)
    .json(new ApiResponse(201, 'Registration successful. Please verify your email.', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
});

// @route  POST /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, 'Invalid or expired verification link');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, 'Email verified successfully'));
});

// @route  POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated');

  const accessToken = await issueTokens(res, user);
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  await AuditLog.create({
    user: user._id,
    action: 'user.login',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  res.status(200).json(
    new ApiResponse(200, 'Login successful', {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    })
  );
});

// @route  POST /api/auth/refresh
// Reads the refresh token from the httpOnly cookie and issues a new access token.
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token missing, please log in again');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token, please log in again');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'User no longer exists or is inactive');
  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new ApiError(401, 'Session invalidated, please log in again');
  }

  const accessToken = generateAccessToken(user);
  res.status(200).json(new ApiResponse(200, 'Token refreshed', { accessToken }));
});

// @route  POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
});

// @route  POST /api/auth/logout-all  (invalidates ALL refresh tokens for the user)
const logoutAll = asyncHandler(async (req, res) => {
  req.user.tokenVersion += 1;
  await req.user.save({ validateBeforeSave: false });
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.status(200).json(new ApiResponse(200, 'Logged out from all devices'));
});

// @route  POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // Always respond the same way to avoid leaking which emails are registered
  if (!user) {
    return res
      .status(200)
      .json(new ApiResponse(200, 'If that email exists, a reset link has been sent'));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendPasswordResetEmail(user.email, resetUrl).catch(() => {});

  res.status(200).json(new ApiResponse(200, 'If that email exists, a reset link has been sent'));
});

// @route  POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.tokenVersion += 1; // invalidate old refresh tokens/sessions
  await user.save();

  res.status(200).json(new ApiResponse(200, 'Password reset successfully. Please log in again'));
});

// @route  POST /api/auth/send-otp
const sendOtp = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, 'No account found with this email');

  const otp = user.createOTP();
  await user.save({ validateBeforeSave: false });
  await sendOTPEmail(user.email, otp);

  res.status(200).json(new ApiResponse(200, 'OTP sent to your email'));
});

// @route  POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email,
    otp: hashedOtp,
    otpExpires: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, 'Invalid or expired OTP');

  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json(new ApiResponse(200, 'OTP verified successfully'));
});

// @route  GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, 'Current user fetched', { user: req.user }));
});

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  getMe,
};
