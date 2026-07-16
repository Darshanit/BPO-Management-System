const asyncHandler = require('express-async-handler');
const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const APIFeatures = require('../utils/apiFeatures');
const { generatePayslipPDF } = require('../services/pdf.service');
const { Notification } = require('../models/Misc');

/** Simple flat-rate tax/PF estimation — replace with real payroll rules as needed. */
const computeStatutoryDeductions = (gross) => ({
  tax: Math.round(gross * 0.1),
  pf: Math.round(gross * 0.12),
});

// @route  POST /api/payroll/generate
// Generates payroll for one employee for a given month/year based on their base salary.
const generatePayroll = asyncHandler(async (req, res) => {
  const { employee: employeeId, month, year, allowances = [], bonus = 0, deductions = [] } = req.body;

  const employee = await Employee.findById(employeeId).populate('user', 'name email');
  if (!employee) throw new ApiError(404, 'Employee not found');

  const existing = await Payroll.findOne({ employee: employeeId, month, year });
  if (existing) throw new ApiError(409, 'Payroll for this employee/month/year already exists');

  const baseSalary = employee.salary.base;
  const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);
  const grossSalary = baseSalary + totalAllowances + Number(bonus);

  const { tax, pf } = computeStatutoryDeductions(grossSalary);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0) + tax + pf;
  const netSalary = grossSalary - totalDeductions;

  const payroll = await Payroll.create({
    employee: employeeId,
    month,
    year,
    baseSalary,
    allowances,
    bonus,
    deductions,
    tax,
    pf,
    grossSalary,
    netSalary,
    status: 'processed',
    generatedBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, 'Payroll generated successfully', payroll));
});

// @route  PATCH /api/payroll/:id/mark-paid — finalizes payroll and generates the payslip PDF
const markAsPaid = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id).populate({
    path: 'employee',
    populate: { path: 'user', select: 'name email' },
  });
  if (!payroll) throw new ApiError(404, 'Payroll record not found');
  if (payroll.status === 'paid') throw new ApiError(400, 'This payroll has already been marked as paid');

  const payslipUrl = await generatePayslipPDF(payroll, payroll.employee, payroll.employee.user);

  payroll.status = 'paid';
  payroll.paidOn = new Date();
  payroll.payslipUrl = payslipUrl;
  await payroll.save();

  await Notification.create({
    recipient: payroll.employee.user._id,
    title: 'Salary Credited',
    message: `Your salary for ${payroll.month}/${payroll.year} has been processed`,
    type: 'payroll',
    link: `/payroll/${payroll._id}`,
  }).catch(() => {});

  res.status(200).json(new ApiResponse(200, 'Payroll marked as paid, payslip generated', payroll));
});

// @route  GET /api/payroll  (Admin/HR view, filterable by month/year/employee/status)
const getAllPayroll = asyncHandler(async (req, res) => {
  const baseQuery = Payroll.find().populate({
    path: 'employee',
    select: 'employeeId user',
    populate: { path: 'user', select: 'name email' },
  });

  const features = new APIFeatures(baseQuery, req.query).filter().sort().paginate();
  const records = await features.query;
  const meta = await features.countTotal(Payroll);

  res.status(200).json(new ApiResponse(200, 'Payroll records fetched', records, meta));
});

// @route  GET /api/payroll/me — logged-in employee's own salary history
const getMyPayroll = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new ApiError(404, 'Employee profile not found');

  const records = await Payroll.find({ employee: employee._id }).sort('-year -month');
  res.status(200).json(new ApiResponse(200, 'Your salary history fetched', records));
});

module.exports = { generatePayroll, markAsPaid, getAllPayroll, getMyPayroll };
