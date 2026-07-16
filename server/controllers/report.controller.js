const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Project = require('../models/Project');
const { Report } = require('../models/System');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { toCSV } = require('../utils/csvExport');

/** Maps a report `type` to a query function returning flat rows suitable for CSV/PDF. */
const REPORT_QUERIES = {
  attendance: async (filters) => {
    const query = {};
    if (filters.from && filters.to) query.date = { $gte: new Date(filters.from), $lte: new Date(filters.to) };
    const records = await Attendance.find(query).populate({
      path: 'employee',
      select: 'employeeId user',
      populate: { path: 'user', select: 'name' },
    });
    return records.map((r) => ({
      employeeId: r.employee?.employeeId,
      name: r.employee?.user?.name,
      date: r.date.toISOString().slice(0, 10),
      status: r.status,
      workingHours: r.workingHours,
      isLate: r.isLate,
    }));
  },
  leave: async (filters) => {
    const query = {};
    if (filters.status) query.status = filters.status;
    const records = await Leave.find(query).populate({
      path: 'employee',
      select: 'employeeId user',
      populate: { path: 'user', select: 'name' },
    });
    return records.map((r) => ({
      employeeId: r.employee?.employeeId,
      name: r.employee?.user?.name,
      leaveType: r.leaveType,
      startDate: r.startDate.toISOString().slice(0, 10),
      endDate: r.endDate.toISOString().slice(0, 10),
      totalDays: r.totalDays,
      status: r.status,
    }));
  },
  payroll: async (filters) => {
    const query = {};
    if (filters.month) query.month = Number(filters.month);
    if (filters.year) query.year = Number(filters.year);
    const records = await Payroll.find(query).populate({
      path: 'employee',
      select: 'employeeId user',
      populate: { path: 'user', select: 'name' },
    });
    return records.map((r) => ({
      employeeId: r.employee?.employeeId,
      name: r.employee?.user?.name,
      month: r.month,
      year: r.year,
      grossSalary: r.grossSalary,
      netSalary: r.netSalary,
      status: r.status,
    }));
  },
  employee: async (filters) => {
    const query = {};
    if (filters.department) query.department = filters.department;
    const records = await Employee.find(query)
      .populate('user', 'name email')
      .populate('department', 'name');
    return records.map((r) => ({
      employeeId: r.employeeId,
      name: r.user?.name,
      email: r.user?.email,
      department: r.department?.name,
      designation: r.designation,
      status: r.employmentStatus,
    }));
  },
  department: async () => {
    const records = await Department.find().populate('head', 'employeeId');
    const counts = await Employee.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    return records.map((d) => ({
      name: d.name,
      code: d.code,
      employeeCount: countMap[String(d._id)] || 0,
      isActive: d.isActive,
    }));
  },
  project: async (filters) => {
    const query = {};
    if (filters.status) query.status = filters.status;
    const records = await Project.find(query).populate('teamLeader', 'employeeId');
    return records.map((p) => ({
      name: p.name,
      status: p.status,
      priority: p.priority,
      progress: p.progress,
      deadline: p.deadline?.toISOString().slice(0, 10),
    }));
  },
  performance: async (filters) => {
    const query = {};
    if (filters.department) query.department = filters.department;
    const records = await Employee.find(query).populate('user', 'name');
    return records.flatMap((e) =>
      (e.performanceHistory || []).map((p) => ({
        employeeId: e.employeeId,
        name: e.user?.name,
        reviewDate: p.reviewDate?.toISOString().slice(0, 10),
        rating: p.rating,
        comments: p.comments,
      }))
    );
  },
};

// @route  GET /api/reports/:type?format=csv|pdf&from=&to=&department=&status=&month=&year=
const generateReport = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { format = 'csv', ...filters } = req.query;

  if (!REPORT_QUERIES[type]) throw new ApiError(400, `Unsupported report type: ${type}`);
  if (!['csv', 'pdf'].includes(format)) throw new ApiError(400, 'format must be csv or pdf');

  const rows = await REPORT_QUERIES[type](filters);

  await Report.create({ type, generatedBy: req.user._id, filters, format });

  if (format === 'csv') {
    const csv = toCSV(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
    return res.status(200).send(csv);
  }

  // PDF format: simple tabular render
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);

  const doc = new PDFDocument({ margin: 40, layout: 'landscape' });
  doc.pipe(res);

  doc.fontSize(16).text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, { align: 'center' });
  doc.moveDown();

  if (rows.length === 0) {
    doc.fontSize(10).text('No records found for the selected filters.');
  } else {
    const headers = Object.keys(rows[0]);
    doc.fontSize(9);
    doc.text(headers.join(' | '));
    doc.moveDown(0.5);
    rows.forEach((row) => {
      doc.text(headers.map((h) => String(row[h] ?? '')).join(' | '));
    });
  }

  doc.end();
});

module.exports = { generateReport };
