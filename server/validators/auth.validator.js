const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

const verifyOtpValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyOtpValidator,
};
