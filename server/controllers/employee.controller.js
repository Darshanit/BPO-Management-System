const asyncHandler = require('express-async-handler');
const Employee = require('../models/Employee');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const APIFeatures = require('../utils/apiFeatures');
const generateEmployeeId = require('../utils/generateEmployeeId');
const { ROLES } = require('../config/roles');

// @route  GET /api/employees
// Supports: ?department=<id>&employmentStatus=active&search=john&sort=-createdAt&page=1&limit=20
const getEmployees = asyncHandler(async (req, res) => {
  const baseQuery = Employee.find()
    .populate('user', 'name email phone avatar isActive')
    .populate('department', 'name code')
    .populate('manager', 'employeeId user');

  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const employees = await features.query;
  const meta = await features.countTotal(Employee);

  res.status(200).json(new ApiResponse(200, 'Employees fetched', employees, meta));
});

// @route  GET /api/employees/:id
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('user', 'name email phone avatar isActive')
    .populate('department', 'name code')
    .populate('manager', 'employeeId user')
    .populate('documents');

  if (!employee) throw new ApiError(404, 'Employee not found');
  res.status(200).json(new ApiResponse(200, 'Employee fetched', employee));
});

// @route  POST /api/employees
// Creates the User account (role defaults to 'employee' unless specified) AND the Employee profile.
const createEmployee = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    department,
    designation,
    manager,
    salary,
    joiningDate,
    employmentType,
    dob,
    gender,
    address,
    emergencyContact,
    skills,
    education,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, 'A user with this email already exists');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role && Object.values(ROLES).includes(role) ? role : ROLES.EMPLOYEE,
    isEmailVerified: true,
    createdBy: req.user._id,
  });

  const employeeId = await generateEmployeeId();

  const employee = await Employee.create({
    user: user._id,
    employeeId,
    department,
    designation,
    manager: manager || null,
    salary,
    joiningDate,
    employmentType,
    dob,
    gender,
    address,
    emergencyContact,
    skills,
    education,
  });

  res.status(201).json(new ApiResponse(201, 'Employee created successfully', employee));
});

// @route  PUT /api/employees/:id
const updateEmployee = asyncHandler(async (req, res) => {
  const { salary, department, designation, manager, employmentStatus, ...rest } = req.body;

  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { salary, department, designation, manager, employmentStatus, ...rest },
    { new: true, runValidators: true }
  );
  if (!employee) throw new ApiError(404, 'Employee not found');

  res.status(200).json(new ApiResponse(200, 'Employee updated successfully', employee));
});

// @route  DELETE /api/employees/:id
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) throw new ApiError(404, 'Employee not found');

  // Deactivate the linked user account rather than deleting auth history
  await User.findByIdAndUpdate(employee.user, { isActive: false });

  res.status(200).json(new ApiResponse(200, 'Employee removed successfully'));
});

// @route  POST /api/employees/:id/performance
// @access HR, Admin, Super Admin, Team Leader
const addPerformanceReview = asyncHandler(async (req, res) => {
  const { rating, comments, reviewer } = req.body;

  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new ApiError(404, 'Employee not found');

  employee.performanceHistory.push({
    reviewDate: new Date(),
    rating,
    comments,
    reviewer,
  });
  await employee.save();

  res.status(201).json(new ApiResponse(201, 'Performance review added', employee.performanceHistory));
});

// @route  GET /api/employees/me/profile — the logged-in employee's own profile
const getMyEmployeeProfile = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id })
    .populate('user', 'name email phone avatar')
    .populate('department', 'name code')
    .populate('documents');

  if (!employee) throw new ApiError(404, 'Employee profile not found for this account');
  res.status(200).json(new ApiResponse(200, 'Profile fetched', employee));
});

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addPerformanceReview,
  getMyEmployeeProfile,
};
