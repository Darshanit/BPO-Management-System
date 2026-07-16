const asyncHandler = require('express-async-handler');
const Team = require('../models/Team');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const getTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find()
    .populate('teamLeader', 'employeeId user')
    .populate('members', 'employeeId user')
    .populate('department', 'name');
  res.status(200).json(new ApiResponse(200, 'Teams fetched', teams));
});

const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('teamLeader', 'employeeId user')
    .populate('members', 'employeeId user');
  if (!team) throw new ApiError(404, 'Team not found');
  res.status(200).json(new ApiResponse(200, 'Team fetched', team));
});

const createTeam = asyncHandler(async (req, res) => {
  const team = await Team.create(req.body);
  res.status(201).json(new ApiResponse(201, 'Team created successfully', team));
});

const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!team) throw new ApiError(404, 'Team not found');
  res.status(200).json(new ApiResponse(200, 'Team updated successfully', team));
});

const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndDelete(req.params.id);
  if (!team) throw new ApiError(404, 'Team not found');
  res.status(200).json(new ApiResponse(200, 'Team deleted successfully'));
});

// @route  GET /api/teams/mine — team led by / belonged to by the logged-in employee
const getMyTeam = asyncHandler(async (req, res) => {
  const Employee = require('../models/Employee');
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new ApiError(404, 'Employee profile not found');

  const team = await Team.findOne({
    $or: [{ teamLeader: employee._id }, { members: employee._id }],
  })
    .populate('teamLeader', 'employeeId user')
    .populate('members', 'employeeId user');

  if (!team) throw new ApiError(404, 'You are not assigned to any team yet');
  res.status(200).json(new ApiResponse(200, 'Your team fetched', team));
});

module.exports = { getTeams, getTeamById, createTeam, updateTeam, deleteTeam, getMyTeam };
