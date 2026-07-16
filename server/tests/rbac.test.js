const request = require('supertest');
const app = require('../app');
const { createUserAndLogin } = require('./helpers');
const { ROLES } = require('../config/roles');
const Department = require('../models/Department');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./dbSetup');

beforeAll(setupTestDB);
afterEach(clearTestDB);
afterAll(teardownTestDB);

describe('RBAC permission middleware', () => {
  it('allows Super Admin to create a department', async () => {
    const { accessToken } = await createUserAndLogin(app, { role: ROLES.SUPER_ADMIN });

    const res = await request(app)
      .post('/api/departments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Engineering', code: 'ENG' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Engineering');
  });

  it('blocks a plain Employee from creating a department', async () => {
    const { accessToken } = await createUserAndLogin(app, {
      role: ROLES.EMPLOYEE,
      email: 'emp1@example.com',
    });

    const res = await request(app)
      .post('/api/departments')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Sales', code: 'SAL' });

    expect(res.status).toBe(403);
  });

  it('blocks a Client from accessing employee management', async () => {
    const { accessToken } = await createUserAndLogin(app, {
      role: ROLES.CLIENT,
      email: 'client1@example.com',
    });

    const res = await request(app).get('/api/employees').set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(403);
  });

  it('allows HR to view departments but blocks HR from deleting a user', async () => {
    const { accessToken } = await createUserAndLogin(app, { role: ROLES.HR, email: 'hr1@example.com' });
    await Department.create({ name: 'HR Dept', code: 'HRD' });

    const listRes = await request(app).get('/api/departments').set('Authorization', `Bearer ${accessToken}`);
    expect(listRes.status).toBe(200);

    const { user: targetUser } = await createUserAndLogin(app, {
      role: ROLES.EMPLOYEE,
      email: 'todelete@example.com',
    });

    const deleteRes = await request(app)
      .delete(`/api/users/${targetUser._id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(deleteRes.status).toBe(403); // deleteUser is Super Admin only
  });
});
