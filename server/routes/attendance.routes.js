const express = require('express');
const router = express.Router();

const {
  clockIn,
  clockOut,
  startBreak,
  endBreak,
  getMyAttendance,
  getAllAttendance,
  getMonthlySummary,
} = require('../controllers/attendance.controller');

const protect = require('../middlewares/auth.middleware');
const { permission } = require('../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../config/roles');

router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/break/start', startBreak);
router.post('/break/end', endBreak);
router.get('/me', getMyAttendance);

router.get('/', permission(PERMISSIONS.MANAGE_ATTENDANCE), getAllAttendance);
router.get('/summary/:employeeId', permission(PERMISSIONS.MANAGE_ATTENDANCE), getMonthlySummary);

module.exports = router;
