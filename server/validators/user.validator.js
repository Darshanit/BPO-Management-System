const { body } = require('express-validator');
const { ROLES } = require('../config/roles');

const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(Object.values(ROLES)).withMessage('Invalid role'),
];

module.exports = { createUserValidator };
