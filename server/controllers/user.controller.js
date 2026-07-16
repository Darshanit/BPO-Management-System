const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const APIFeatures = require('../utils/apiFeatures');
const { AuditLog } = require('../models/System');

// @route  GET /api/users
// @access Super Admin, Admin, HR
const getUsers = asyncHandler(async (req, res) => {
  const baseQuery = User.find();
  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .search(['name', 'email'])
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  const meta = await features.countTotal(User);

  res.status(200).json(new ApiResponse(200, 'Users fetched', users, meta));
});

// @route  GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json(new ApiResponse(200, 'User fetched', user));
});

// @route  POST /api/users
// @access Super Admin, Admin, HR (creates accounts for employees/hr/team_leader/client/admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'A user with this email already exists');

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    isEmailVerified: true, // admin-created accounts are pre-verified
    createdBy: req.user._id,
  });

  await AuditLog.create({
    user: req.user._id,
    action: 'user.created',
    metadata: { createdUserId: user._id, role },
  });

  res.status(201).json(new ApiResponse(201, 'User created successfully', user));
});

// @route  PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { password, tokenVersion, ...updates } = req.body; // password changes go through auth flow, not here

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new ApiError(404, 'User not found');

  res.status(200).json(new ApiResponse(200, 'User updated successfully', user));
});

// @route  PATCH /api/users/:id/deactivate
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false, $inc: { tokenVersion: 1 } }, // also kills active sessions
    { new: true }
  );
  if (!user) throw new ApiError(404, 'User not found');

  await AuditLog.create({
    user: req.user._id,
    action: 'user.deactivated',
    metadata: { targetUserId: user._id },
  });

  res.status(200).json(new ApiResponse(200, 'User deactivated', user));
});

// @route  PATCH /api/users/:id/activate
const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json(new ApiResponse(200, 'User activated', user));
});

// @route  DELETE /api/users/:id
// @access Super Admin only
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  await AuditLog.create({
    user: req.user._id,
    action: 'user.deleted',
    metadata: { deletedUserId: req.params.id, email: user.email },
  });

  res.status(200).json(new ApiResponse(200, 'User deleted successfully'));
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser,
};
