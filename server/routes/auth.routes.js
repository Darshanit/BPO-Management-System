const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/auth.controller');

const protect = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/security.middleware');
const { validateRequest } = require('../middlewares/security.middleware');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyOtpValidator,
} = require('../validators/auth.validator');

router.post('/register', authLimiter, registerValidator, validateRequest, register);
router.post('/verify-email/:token', verifyEmail);
router.post('/login', authLimiter, loginValidator, validateRequest, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidator,
  validateRequest,
  forgotPassword
);
router.post('/reset-password', resetPasswordValidator, validateRequest, resetPassword);
router.post('/send-otp', authLimiter, sendOtp);
router.post('/verify-otp', verifyOtpValidator, validateRequest, verifyOtp);
router.get('/me', protect, getMe);

module.exports = router;
