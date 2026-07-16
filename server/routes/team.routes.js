const express = require('express');
const router = express.Router();

const {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getMyTeam,
} = require('../controllers/team.controller');

const protect = require('../middlewares/auth.middleware');
const { permission } = require('../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../config/roles');

router.use(protect);

router.get('/mine', getMyTeam);

router
  .route('/')
  .get(getTeams)
  .post(permission(PERMISSIONS.MANAGE_TEAMS), createTeam);

router
  .route('/:id')
  .get(getTeamById)
  .put(permission(PERMISSIONS.MANAGE_TEAMS), updateTeam)
  .delete(permission(PERMISSIONS.MANAGE_TEAMS), deleteTeam);

module.exports = router;
