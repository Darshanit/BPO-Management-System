const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  activateUser,
  deleteUser,
} = require('../controllers/user.controller');

const protect = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { validateRequest } = require('../middlewares/security.middleware');
const { createUserValidator } = require('../validators/user.validator');
const { ROLES } = require('../config/roles');

router.use(protect);

router
  .route('/')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR), getUsers)
  .post(
    authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR),
    createUserValidator,
    validateRequest,
    createUser
  );

router
  .route('/:id')
  .get(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR), getUserById)
  .put(authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), updateUser)
  .delete(authorize(ROLES.SUPER_ADMIN), deleteUser);

router.patch('/:id/deactivate', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), deactivateUser);
router.patch('/:id/activate', authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN), activateUser);

module.exports = router;
