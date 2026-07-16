const asyncHandler = require('express-async-handler');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const APIFeatures = require('../utils/apiFeatures');
const { Notification } = require('../models/Misc');

/** Computes total days between two dates inclusive (half_day always counts as 0.5). */
const computeDays = (leaveType, startDate, endDate) => {
  if (leaveType === 'half_day') return 0.5;
  const diffMs = new Date(endDate) - new Date(startDate);
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

// @route  POST /api/leaves/apply
const applyLeave = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new ApiError(404, 'Employee profile not found');

  const { leaveType, startDate, endDate, reason, attachments } = req.body;
  const totalDays = computeDays(leaveType, startDate, endDate);

  if (['casual', 'medical', 'paid'].includes(leaveType)) {
    const balanceKey = leaveType;
    if ((employee.leaveBalance[balanceKey] ?? 0) < totalDays) {
      throw new ApiError(400, `Insufficient ${leaveType} leave balance`);
    }
  }

  const leave = await Leave.create({
    employee: employee._id,
    leaveType,
    startDate,
    endDate,
    totalDays,
    reason,
    attachments,
  });

  // Notify the employee's manager (best-effort, don't fail the request if this errors)
  if (employee.manager) {
    const manager = await Employee.findById(employee.manager).populate('user', '_id');
    if (manager?.user) {
      await Notification.create({
        recipient: manager.user._id,
        sender: req.user._id,
        title: 'New Leave Request',
        message: `${req.user.name} requested ${totalDays} day(s) of ${leaveType} leave`,
        type: 'leave',
        link: `/leaves/${leave._id}`,
      }).catch(() => {});
    }
  }

  res.status(201).json(new ApiResponse(201, 'Leave request submitted', leave));
});

// @route  GET /api/leaves/me
const getMyLeaves = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new ApiError(404, 'Employee profile not found');

  const leaves = await Leave.find({ employee: employee._id }).sort('-createdAt');
  res.status(200).json(new ApiResponse(200, 'Your leave requests fetched', leaves));
});

// @route  GET /api/leaves  (HR/Admin/Team Leader view, filterable by status/employee/date)
const getAllLeaves = asyncHandler(async (req, res) => {
  const baseQuery = Leave.find().populate({
    path: 'employee',
    select: 'employeeId user department',
    populate: { path: 'user', select: 'name email' },
  });

  const features = new APIFeatures(baseQuery, req.query).filter().sort().paginate();
  const leaves = await features.query;
  const meta = await features.countTotal(Leave);

  res.status(200).json(new ApiResponse(200, 'Leave requests fetched', leaves, meta));
});

// @route  PATCH /api/leaves/:id/approve
const approveLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.findById(req.params.id).populate('employee');
  if (!leave) throw new ApiError(404, 'Leave request not found');
  if (leave.status !== 'pending') throw new ApiError(400, 'This leave request has already been processed');

  const approverEmployee = await Employee.findOne({ user: req.user._id });

  leave.status = 'approved';
  leave.approvedBy = approverEmployee?._id;
  leave.approvedAt = new Date();
  await leave.save();

  // Deduct from balance for balance-tracked leave types
  if (['casual', 'medical', 'paid'].includes(leave.leaveType)) {
    await Employee.findByIdAndUpdate(leave.employee._id, {
      $inc: { [`leaveBalance.${leave.leaveType}`]: -leave.totalDays },
    });
  }

  await Notification.create({
    recipient: leave.employee.user,
    title: 'Leave Approved',
    message: `Your ${leave.leaveType} leave request has been approved`,
    type: 'leave',
    link: `/leaves/${leave._id}`,
  }).catch(() => {});

  res.status(200).json(new ApiResponse(200, 'Leave approved', leave));
});

// @route  PATCH /api/leaves/:id/reject
const rejectLeave = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const leave = await Leave.findById(req.params.id).populate('employee');
  if (!leave) throw new ApiError(404, 'Leave request not found');
  if (leave.status !== 'pending') throw new ApiError(400, 'This leave request has already been processed');

  leave.status = 'rejected';
  leave.rejectionReason = rejectionReason;
  await leave.save();

  await Notification.create({
    recipient: leave.employee.user,
    title: 'Leave Rejected',
    message: `Your ${leave.leaveType} leave request was rejected${rejectionReason ? `: ${rejectionReason}` : ''}`,
    type: 'leave',
    link: `/leaves/${leave._id}`,
  }).catch(() => {});

  res.status(200).json(new ApiResponse(200, 'Leave rejected', leave));
});

// @route  PATCH /api/leaves/:id/cancel  (employee cancels their own pending request)
const cancelLeave = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  const leave = await Leave.findOne({ _id: req.params.id, employee: employee._id });
  if (!leave) throw new ApiError(404, 'Leave request not found');
  if (leave.status !== 'pending') throw new ApiError(400, 'Only pending requests can be cancelled');

  leave.status = 'cancelled';
  await leave.save();
  res.status(200).json(new ApiResponse(200, 'Leave request cancelled', leave));
});

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
};
