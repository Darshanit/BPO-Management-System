const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const APIFeatures = require('../utils/apiFeatures');

const getProjects = asyncHandler(async (req, res) => {
  const baseQuery = Project.find()
    .populate('client', 'companyName')
    .populate('teamLeader', 'employeeId user')
    .populate('members', 'employeeId user');

  const features = new APIFeatures(baseQuery, req.query).filter().search(['name']).sort().paginate();
  const projects = await features.query;
  const meta = await features.countTotal(Project);

  res.status(200).json(new ApiResponse(200, 'Projects fetched', projects, meta));
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('client', 'companyName contactPerson')
    .populate('teamLeader', 'employeeId user')
    .populate('members', 'employeeId user')
    .populate('attachments');

  if (!project) throw new ApiError(404, 'Project not found');
  res.status(200).json(new ApiResponse(200, 'Project fetched', project));
});

const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(new ApiResponse(201, 'Project created successfully', project));
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!project) throw new ApiError(404, 'Project not found');
  res.status(200).json(new ApiResponse(200, 'Project updated successfully', project));
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');
  res.status(200).json(new ApiResponse(200, 'Project deleted successfully'));
});

// @route  POST /api/projects/:id/milestones
const addMilestone = asyncHandler(async (req, res) => {
  const { title, dueDate } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  project.milestones.push({ title, dueDate });
  await project.save();
  res.status(201).json(new ApiResponse(201, 'Milestone added', project.milestones));
});

// @route  PATCH /api/projects/:id/milestones/:milestoneId/complete
const completeMilestone = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  const milestone = project.milestones.id(req.params.milestoneId);
  if (!milestone) throw new ApiError(404, 'Milestone not found');

  milestone.isCompleted = true;
  milestone.completedAt = new Date();
  await project.save();

  res.status(200).json(new ApiResponse(200, 'Milestone marked complete', milestone));
});

// @route  GET /api/projects/client/mine — client's own assigned projects
const getMyClientProjects = asyncHandler(async (req, res) => {
  const Client = require('../models/Client');
  const client = await Client.findOne({ user: req.user._id });
  if (!client) throw new ApiError(404, 'Client profile not found for this account');

  const projects = await Project.find({ client: client._id }).populate('teamLeader', 'employeeId user');
  res.status(200).json(new ApiResponse(200, 'Your projects fetched', projects));
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMilestone,
  completeMilestone,
  getMyClientProjects,
};
