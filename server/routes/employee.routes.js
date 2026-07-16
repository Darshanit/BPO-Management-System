const express = require('express');
const router = express.Router();

const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addPerformanceReview,
  getMyEmployeeProfile,
} = require('../controllers/employee.controller');

const protect = require('../middlewares/auth.middleware');
const { authorize, permission } = require('../middlewares/rbac.middleware');
const { ROLES, PERMISSIONS } = require('../config/roles');

router.use(protect);

// Self-service route must come before /:id to avoid "me" being parsed as an ObjectId
router.get('/me/profile', getMyEmployeeProfile);

router
  .route('/')
  .get(permission(PERMISSIONS.MANAGE_EMPLOYEES), getEmployees)
  .post(permission(PERMISSIONS.MANAGE_EMPLOYEES), createEmployee);

router
  .route('/:id')
  .get(permission(PERMISSIONS.MANAGE_EMPLOYEES), getEmployeeById)
  .put(permission(PERMISSIONS.MANAGE_EMPLOYEES), updateEmployee)
  .delete(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deleteEmployee);

router.post(
  '/:id/performance',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.TEAM_LEADER),
  addPerformanceReview
);

module.exports = router;
