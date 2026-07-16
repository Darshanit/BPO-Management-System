const express = require('express');
const router = express.Router();

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMilestone,
  completeMilestone,
  getMyClientProjects,
} = require('../controllers/project.controller');

const protect = require('../middlewares/auth.middleware');
const { permission } = require('../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../config/roles');

router.use(protect);

router.get('/client/mine', getMyClientProjects);

router
  .route('/')
  .get(getProjects) // visible to all authenticated roles; frontend scopes by role
  .post(permission(PERMISSIONS.MANAGE_PROJECTS), createProject);

router
  .route('/:id')
  .get(getProjectById)
  .put(permission(PERMISSIONS.MANAGE_PROJECTS), updateProject)
  .delete(permission(PERMISSIONS.MANAGE_PROJECTS), deleteProject);

router.post('/:id/milestones', permission(PERMISSIONS.MANAGE_PROJECTS), addMilestone);
router.patch(
  '/:id/milestones/:milestoneId/complete',
  permission(PERMISSIONS.MANAGE_PROJECTS),
  completeMilestone
);

module.exports = router;
