const asyncHandler = require('express-async-handler');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { Notification, Ticket } = require('../models/Misc');
const ApiResponse = require('../utils/ApiResponse');
const { ROLES } = require('../config/roles');

/** Admin/HR/Super Admin org-wide dashboard stats. */
const getAdminStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalEmployees, presentToday, pendingLeaves, activeProjects, openTickets] =
    await Promise.all([
      Employee.countDocuments({ employmentStatus: 'active' }),
      Attendance.countDocuments({ date: today, status: 'present' }),
      Leave.countDocuments({ status: 'pending' }),
      Project.countDocuments({ status: 'in_progress' }),
      Ticket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
    ]);

  const taskOverview = await Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  const projectStatus = await Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  res.status(200).json(
    new ApiResponse(200, 'Dashboard stats fetched', {
      totalEmployees,
      presentToday,
      pendingLeaves,
      activeProjects,
      openTickets,
      taskOverview,
      projectStatus,
    })
  );
});

/** Employee's personal dashboard stats. */
const getEmployeeStats = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) return res.status(200).json(new ApiResponse(200, 'No employee profile', {}));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayAttendance, myPendingLeaves, myTasks, unreadNotifications] = await Promise.all([
    Attendance.findOne({ employee: employee._id, date: today }),
    Leave.countDocuments({ employee: employee._id, status: 'pending' }),
    Task.aggregate([
      { $match: { assignedTo: employee._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Dashboard stats fetched', {
      clockedInToday: !!todayAttendance?.clockIn,
      clockedOutToday: !!todayAttendance?.clockOut,
      leaveBalance: employee.leaveBalance,
      myPendingLeaves,
      myTasks,
      unreadNotifications,
    })
  );
});

/** Routes to the right stats shape based on the logged-in user's role. */
const getDashboardStats = asyncHandler(async (req, res, next) => {
  if ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.TEAM_LEADER].includes(req.user.role)) {
    return getAdminStats(req, res, next);
  }
  return getEmployeeStats(req, res, next);
});

module.exports = { getDashboardStats };
