const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const APIFeatures = require('../utils/apiFeatures');
const { Settings } = require('../models/System');

/** Normalizes a Date to midnight UTC so one attendance doc exists per calendar day. */
const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @route  POST /api/attendance/clock-in
const clockIn = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new ApiError(404, 'Employee profile not found for this account');

  const today = startOfDay();
  const existing = await Attendance.findOne({ employee: employee._id, date: today });
  if (existing && existing.clockIn) throw new ApiError(400, 'You have already clocked in today');

  const settings = await Settings.findOne();
  const workStart = settings?.workingHours?.start || '09:00';
  const [startHour, startMin] = workStart.split(':').map(Number);
  const scheduledStart = new Date(today);
  scheduledStart.setHours(startHour, startMin, 0, 0);

  const now = new Date();
  const isLate = now > scheduledStart;

  const attendance =
    existing ||
    (await Attendance.create({ employee: employee._id, date: today, clockIn: now, isLate }));

  if (existing) {
    existing.clockIn = now;
    existing.isLate = isLate;
    await existing.save();
  }

  res.status(200).json(new ApiResponse(200, 'Clocked in successfully', attendance));
});

// @route  POST /api/attendance/clock-out
const clockOut = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new ApiError(404, 'Employee profile not found for this account');

  const today = startOfDay();
  const attendance = await Attendance.findOne({ employee: employee._id, date: today });
  if (!attendance || !attendance.clockIn) {
    throw new ApiError(400, 'You must clock in before clocking out');
  }
  if (attendance.clockOut) throw new ApiError(400, 'You have already clocked out today');

  attendance.clockOut = new Date();

  const totalBreakMs = attendance.breaks.reduce((sum, b) => {
    if (b.start && b.end) return sum + (new Date(b.end) - new Date(b.start));
    return sum;
  }, 0);

  const grossMs = attendance.clockOut - new Date(attendance.clockIn);
  attendance.workingHours = Math.max(0, (grossMs - totalBreakMs) / (1000 * 60 * 60));
  await attendance.save();

  res.status(200).json(new ApiResponse(200, 'Clocked out successfully', attendance));
});

// @route  POST /api/attendance/break/start
const startBreak = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  const today = startOfDay();
  const attendance = await Attendance.findOne({ employee: employee._id, date: today });
  if (!attendance || !attendance.clockIn) throw new ApiError(400, 'You must clock in first');

  attendance.breaks.push({ start: new Date() });
  await attendance.save();
  res.status(200).json(new ApiResponse(200, 'Break started', attendance));
});

// @route  POST /api/attendance/break/end
const endBreak = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  const today = startOfDay();
  const attendance = await Attendance.findOne({ employee: employee._id, date: today });
  if (!attendance) throw new ApiError(400, 'No active attendance record found');

  const openBreak = [...attendance.breaks].reverse().find((b) => !b.end);
  if (!openBreak) throw new ApiError(400, 'No active break to end');

  openBreak.end = new Date();
  await attendance.save();
  res.status(200).json(new ApiResponse(200, 'Break ended', attendance));
});

// @route  GET /api/attendance/me?month=7&year=2026
const getMyAttendance = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new ApiError(404, 'Employee profile not found');

  const { month, year } = req.query;
  const filter = { employee: employee._id };
  if (month && year) {
    const from = new Date(Number(year), Number(month) - 1, 1);
    const to = new Date(Number(year), Number(month), 1);
    filter.date = { $gte: from, $lt: to };
  }

  const records = await Attendance.find(filter).sort('-date');
  res.status(200).json(new ApiResponse(200, 'Attendance history fetched', records));
});

// @route  GET /api/attendance  (HR/Admin view — all employees, filterable)
const getAllAttendance = asyncHandler(async (req, res) => {
  const baseQuery = Attendance.find().populate({
    path: 'employee',
    select: 'employeeId user department',
    populate: [{ path: 'user', select: 'name email' }, { path: 'department', select: 'name' }],
  });

  const features = new APIFeatures(baseQuery, req.query).filter().sort().paginate();
  const records = await features.query;
  const meta = await features.countTotal(Attendance);

  res.status(200).json(new ApiResponse(200, 'Attendance records fetched', records, meta));
});

// @route  GET /api/attendance/summary/:employeeId?month=7&year=2026
const getMonthlySummary = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { month, year } = req.query;
  if (!month || !year) throw new ApiError(400, 'month and year query params are required');

  const from = new Date(Number(year), Number(month) - 1, 1);
  const to = new Date(Number(year), Number(month), 1);

  const records = await Attendance.find({ employee: employeeId, date: { $gte: from, $lt: to } });

  const summary = records.reduce(
    (acc, r) => {
      acc.totalWorkingHours += r.workingHours || 0;
      acc[r.status] = (acc[r.status] || 0) + 1;
      if (r.isLate) acc.lateCount += 1;
      return acc;
    },
    { totalWorkingHours: 0, lateCount: 0 }
  );

  res.status(200).json(new ApiResponse(200, 'Monthly summary fetched', { records, summary }));
});

module.exports = {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getMyAttendance,
  getAllAttendance,
  getMonthlySummary,
};
