const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { createUserAndLogin } = require('./helpers');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./dbSetup');

beforeAll(setupTestDB);
afterEach(clearTestDB);
afterAll(teardownTestDB);

describe('Auth flow', () => {
  describe('POST /api/auth/register', () => {
    it('creates a new user with the default employee role', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('jane@example.com');
      expect(res.body.data.role).toBe('employee');

      const stored = await User.findOne({ email: 'jane@example.com' }).select('+password');
      expect(stored).not.toBeNull();
      expect(stored.password).not.toBe('Password123'); // must be hashed
    });

    it('rejects duplicate email registration', async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Jane Doe',
        email: 'dupe@example.com',
        password: 'Password123',
      });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Jane Doe 2',
        email: 'dupe@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('rejects a weak password (no number)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Weak Pass',
        email: 'weak@example.com',
        password: 'nonumbershere',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with correct credentials and returns an access token', async () => {
      await User.create({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123',
        isEmailVerified: true,
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
      // Refresh token should be set as an httpOnly cookie, never in the JSON body
      expect(res.headers['set-cookie']).toBeDefined();
      expect(res.body.data.refreshToken).toBeUndefined();
    });

    it('rejects an incorrect password', async () => {
      await User.create({
        name: 'Login User',
        email: 'login2@example.com',
        password: 'Password123',
        isEmailVerified: true,
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'login2@example.com',
        password: 'WrongPassword1',
      });

      expect(res.status).toBe(401);
    });

    it('rejects login for a deactivated account', async () => {
      await User.create({
        name: 'Inactive User',
        email: 'inactive@example.com',
        password: 'Password123',
        isEmailVerified: true,
        isActive: false,
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'inactive@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/auth/me', () => {
    it('rejects requests with no access token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('rejects requests with a malformed token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');
      expect(res.status).toBe(401);
    });

    it('returns the current user for a valid access token', async () => {
      const { accessToken, user } = await createUserAndLogin(app);

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(user.email);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears the refresh token cookie', async () => {
      const { accessToken } = await createUserAndLogin(app);

      const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=;/);
    });
  });
});
