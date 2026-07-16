const asyncHandler = require('express-async-handler');
const Department = require('../models/Department');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const APIFeatures = require('../utils/apiFeatures');

const getDepartments = asyncHandler(async (req, res) => {
  const baseQuery = Department.find().populate('head', 'employeeId').populate('parentDepartment', 'name');
  const features = new APIFeatures(baseQuery, req.query).filter().search(['name', 'code']).sort().paginate();

  const departments = await features.query;
  const meta = await features.countTotal(Department);

  res.status(200).json(new ApiResponse(200, 'Departments fetched', departments, meta));
});

const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id)
    .populate('head', 'employeeId user')
    .populate('parentDepartment', 'name');
  if (!department) throw new ApiError(404, 'Department not found');
  res.status(200).json(new ApiResponse(200, 'Department fetched', department));
});

const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, head, parentDepartment } = req.body;

  const existing = await Department.findOne({ $or: [{ name }, { code }] });
  if (existing) throw new ApiError(409, 'A department with this name or code already exists');

  const department = await Department.create({ name, code, description, head, parentDepartment });
  res.status(201).json(new ApiResponse(201, 'Department created successfully', department));
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) throw new ApiError(404, 'Department not found');
  res.status(200).json(new ApiResponse(200, 'Department updated successfully', department));
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!department) throw new ApiError(404, 'Department not found');
  res.status(200).json(new ApiResponse(200, 'Department deactivated successfully'));
});

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
