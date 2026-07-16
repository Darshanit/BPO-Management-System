const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { Notification } = require('../models/Misc');

// @route  GET /api/tasks?project=<id>  — returns tasks grouped by status for the kanban board
const getTasksByProject = asyncHandler(async (req, res) => {
  const { project } = req.query;
  if (!project) throw new ApiError(400, 'project query param is required');

  const tasks = await Task.find({ project })
    .populate('assignedTo', 'employeeId user')
    .populate('assignedBy', 'employeeId user')
    .sort('order');

  const board = { todo: [], in_progress: [], review: [], completed: [] };
  tasks.forEach((task) => board[task.status]?.push(task));

  res.status(200).json(new ApiResponse(200, 'Kanban board fetched', board));
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'employeeId user')
    .populate('assignedBy', 'employeeId user')
    .populate('comments.author', 'name avatar')
    .populate('attachments');
  if (!task) throw new ApiError(404, 'Task not found');
  res.status(200).json(new ApiResponse(200, 'Task fetched', task));
});

// @route  POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const assignedByEmployee = await Employee.findOne({ user: req.user._id });
  if (!assignedByEmployee) throw new ApiError(404, 'Employee profile not found for this account');

  const task = await Task.create({ ...req.body, assignedBy: assignedByEmployee._id });

  // Notify assignees
  if (task.assignedTo?.length) {
    const assignees = await Employee.find({ _id: { $in: task.assignedTo } }).populate('user', '_id');
    await Promise.all(
      assignees.map((emp) =>
        Notification.create({
          recipient: emp.user._id,
          sender: req.user._id,
          title: 'New Task Assigned',
          message: `You've been assigned: ${task.title}`,
          type: 'task',
          link: `/tasks/${task._id}`,
        }).catch(() => {})
      )
    );
  }

  res.status(201).json(new ApiResponse(201, 'Task created successfully', task));
});

// @route  PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!task) throw new ApiError(404, 'Task not found');
  res.status(200).json(new ApiResponse(200, 'Task updated successfully', task));
});

// @route  PATCH /api/tasks/:id/move  — drag-and-drop between kanban columns
const moveTask = asyncHandler(async (req, res) => {
  const { status, order } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  task.status = status;
  if (typeof order === 'number') task.order = order;
  if (status === 'completed' && !task.completedAt) task.completedAt = new Date();
  await task.save();

  res.status(200).json(new ApiResponse(200, 'Task moved', task));
});

// @route  POST /api/tasks/:id/comments
const addComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  task.comments.push({ author: req.user._id, text: req.body.text });
  await task.save();

  res.status(201).json(new ApiResponse(201, 'Comment added', task.comments));
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  res.status(200).json(new ApiResponse(200, 'Task deleted successfully'));
});

// @route  GET /api/tasks/my — logged-in employee's assigned tasks across all projects
const getMyTasks = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ user: req.user._id });
  if (!employee) throw new ApiError(404, 'Employee profile not found');

  const tasks = await Task.find({ assignedTo: employee._id })
    .populate('project', 'name')
    .sort('-createdAt');

  res.status(200).json(new ApiResponse(200, 'Your tasks fetched', tasks));
});

module.exports = {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  moveTask,
  addComment,
  deleteTask,
  getMyTasks,
};
