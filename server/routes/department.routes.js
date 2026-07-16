const express = require('express');
const router = express.Router();

const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');

const protect = require('../middlewares/auth.middleware');
const { permission } = require('../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../config/roles');

router.use(protect);

router
  .route('/')
  .get(getDepartments) // visible to all authenticated roles (e.g. for dropdowns)
  .post(permission(PERMISSIONS.MANAGE_DEPARTMENTS), createDepartment);

router
  .route('/:id')
  .get(getDepartmentById)
  .put(permission(PERMISSIONS.MANAGE_DEPARTMENTS), updateDepartment)
  .delete(permission(PERMISSIONS.MANAGE_DEPARTMENTS), deleteDepartment);

module.exports = router;
