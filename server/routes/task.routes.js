const express = require('express');
const router = express.Router();

const {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  moveTask,
  addComment,
  deleteTask,
  getMyTasks,
} = require('../controllers/task.controller');

const protect = require('../middlewares/auth.middleware');
const { permission } = require('../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../config/roles');

router.use(protect);

router.get('/my', getMyTasks);

router
  .route('/')
  .get(getTasksByProject)
  .post(permission(PERMISSIONS.MANAGE_TASKS), createTask);

router
  .route('/:id')
  .get(getTaskById)
  .put(permission(PERMISSIONS.MANAGE_TASKS), updateTask)
  .delete(permission(PERMISSIONS.MANAGE_TASKS), deleteTask);

router.patch('/:id/move', moveTask); // any assignee can move their own task across the board
router.post('/:id/comments', addComment);

module.exports = router;
