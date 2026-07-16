const request = require('supertest');
const app = require('../app');
const { createUserAndLogin } = require('./helpers');
const { ROLES } = require('../config/roles');
const Department = require('../models/Department');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./dbSetup');

beforeAll(setupTestDB);
afterEach(clearTestDB);
afterAll(teardownTestDB);

describe('Employee module', () => {
  let accessToken;
  let department;

  beforeEach(async () => {
    const auth = await createUserAndLogin(app, { role: ROLES.SUPER_ADMIN });
    accessToken = auth.accessToken;
    department = await Department.create({ name: 'Engineering', code: 'ENG' });
  });

  const createEmployeePayload = (overrides = {}) => ({
    name: 'New Employee',
    email: `employee${Date.now()}${Math.random().toString(36).slice(2)}@example.com`,
    password: 'Password123',
    department: department._id.toString(),
    designation: 'Software Engineer',
    salary: { base: 50000 },
    baseSalary: 50000,
    joiningDate: '2026-01-15',
    ...overrides,
  });

  it('creates an employee with an auto-generated employee ID', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createEmployeePayload());

    expect(res.status).toBe(201);
    expect(res.body.data.employeeId).toMatch(/^EMP-\d{4}-\d{4}$/);
    expect(res.body.data.designation).toBe('Software Engineer');
  });

  it('increments the employee ID sequence for subsequent employees', async () => {
    const res1 = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createEmployeePayload({ email: 'first@example.com' }));

    const res2 = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createEmployeePayload({ email: 'second@example.com' }));

    const num1 = parseInt(res1.body.data.employeeId.split('-').pop(), 10);
    const num2 = parseInt(res2.body.data.employeeId.split('-').pop(), 10);
    expect(num2).toBe(num1 + 1);
  });

  it('rejects creating an employee with a duplicate email', async () => {
    const payload = createEmployeePayload({ email: 'duplicate@example.com' });
    await request(app).post('/api/employees').set('Authorization', `Bearer ${accessToken}`).send(payload);

    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    expect(res.status).toBe(409);
  });

  it('lists employees with pagination metadata', async () => {
    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createEmployeePayload({ email: 'list1@example.com' }));
    await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createEmployeePayload({ email: 'list2@example.com' }));

    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1, limit: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.meta.total).toBe(2);
    expect(res.body.meta.totalPages).toBe(2);
  });
});
