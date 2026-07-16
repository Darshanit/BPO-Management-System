const request = require('supertest');
const User = require('../models/User');
const { ROLES } = require('../config/roles');

/**
 * Creates a user with the given role directly via the model (skipping the
 * registration/verification flow) then logs in through the real /auth/login
 * endpoint so tests exercise the actual token-issuing code path.
 */
const createUserAndLogin = async (app, overrides = {}) => {
  const defaults = {
    name: 'Test User',
    email: `user${Date.now()}${Math.random().toString(36).slice(2)}@example.com`,
    password: 'Password123',
    role: ROLES.SUPER_ADMIN,
    isEmailVerified: true,
    isActive: true,
  };
  const userData = { ...defaults, ...overrides };

  const user = await User.create(userData);

  const res = await request(app).post('/api/auth/login').send({
    email: userData.email,
    password: userData.password,
  });

  return { user, accessToken: res.body.data.accessToken, cookies: res.headers['set-cookie'] };
};

module.exports = { createUserAndLogin };
