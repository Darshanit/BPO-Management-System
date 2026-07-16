const express = require('express');
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave,
} = require('../controllers/leave.controller');

const protect = require('../middlewares/auth.middleware');
const { permission } = require('../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../config/roles');

router.use(protect);

router.post('/apply', applyLeave);
router.get('/me', getMyLeaves);
router.patch('/:id/cancel', cancelLeave);

router.get('/', permission(PERMISSIONS.APPROVE_LEAVES), getAllLeaves);
router.patch('/:id/approve', permission(PERMISSIONS.APPROVE_LEAVES), approveLeave);
router.patch('/:id/reject', permission(PERMISSIONS.APPROVE_LEAVES), rejectLeave);

module.exports = router;
