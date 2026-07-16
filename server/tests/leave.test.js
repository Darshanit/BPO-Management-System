const request = require('supertest');
const app = require('../app');
const { createUserAndLogin } = require('./helpers');
const { ROLES } = require('../config/roles');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const { setupTestDB, clearTestDB, teardownTestDB } = require('./dbSetup');

beforeAll(setupTestDB);
afterEach(clearTestDB);
afterAll(teardownTestDB);

describe('Leave workflow', () => {
  let hrToken;
  let employeeToken;
  let employeeRecord;

  beforeEach(async () => {
    const hrAuth = await createUserAndLogin(app, { role: ROLES.HR, email: 'hr@example.com' });
    hrToken = hrAuth.accessToken;

    const empAuth = await createUserAndLogin(app, { role: ROLES.EMPLOYEE, email: 'staffer@example.com' });
    employeeToken = empAuth.accessToken;

    const department = await Department.create({ name: 'Support', code: 'SUP' });
    employeeRecord = await Employee.create({
      user: empAuth.user._id,
      employeeId: 'EMP-2026-0001',
      department: department._id,
      designation: 'Support Agent',
      salary: { base: 30000 },
      joiningDate: new Date('2026-01-01'),
      leaveBalance: { casual: 12, medical: 10, paid: 15 },
    });
  });

  it('lets an employee apply for casual leave', async () => {
    const res = await request(app)
      .post('/api/leaves/apply')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'casual',
        startDate: '2026-08-01',
        endDate: '2026-08-02',
        reason: 'Family event',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.totalDays).toBe(2);
  });

  it('rejects a leave application that exceeds the available balance', async () => {
    const res = await request(app)
      .post('/api/leaves/apply')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'casual',
        startDate: '2026-08-01',
        endDate: '2026-08-20', // 20 days, more than the 12-day casual balance
        reason: 'Long trip',
      });

    expect(res.status).toBe(400);
  });

  it('deducts the leave balance when HR approves the request', async () => {
    const applyRes = await request(app)
      .post('/api/leaves/apply')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'casual',
        startDate: '2026-08-01',
        endDate: '2026-08-03', // 3 days
        reason: 'Trip',
      });

    const leaveId = applyRes.body.data._id;

    const approveRes = await request(app)
      .patch(`/api/leaves/${leaveId}/approve`)
      .set('Authorization', `Bearer ${hrToken}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('approved');

    const updatedEmployee = await Employee.findById(employeeRecord._id);
    expect(updatedEmployee.leaveBalance.casual).toBe(9); // 12 - 3
  });

  it('does not deduct balance when a leave request is rejected', async () => {
    const applyRes = await request(app)
      .post('/api/leaves/apply')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'casual',
        startDate: '2026-08-01',
        endDate: '2026-08-02',
        reason: 'Trip',
      });

    const leaveId = applyRes.body.data._id;

    await request(app)
      .patch(`/api/leaves/${leaveId}/reject`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({ rejectionReason: 'Not enough notice' });

    const updatedEmployee = await Employee.findById(employeeRecord._id);
    expect(updatedEmployee.leaveBalance.casual).toBe(12); // unchanged
  });

  it('blocks a plain employee from approving their own leave', async () => {
    const applyRes = await request(app)
      .post('/api/leaves/apply')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        leaveType: 'casual',
        startDate: '2026-08-01',
        endDate: '2026-08-02',
        reason: 'Trip',
      });

    const leaveId = applyRes.body.data._id;

    const res = await request(app)
      .patch(`/api/leaves/${leaveId}/approve`)
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
  });
});
