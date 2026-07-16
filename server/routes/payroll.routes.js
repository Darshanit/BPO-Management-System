const express = require('express');
const router = express.Router();

const {
  generatePayroll,
  markAsPaid,
  getAllPayroll,
  getMyPayroll,
} = require('../controllers/payroll.controller');

const protect = require('../middlewares/auth.middleware');
const { permission } = require('../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../config/roles');

router.use(protect);

router.get('/me', getMyPayroll);

router.get('/', permission(PERMISSIONS.MANAGE_PAYROLL), getAllPayroll);
router.post('/generate', permission(PERMISSIONS.MANAGE_PAYROLL), generatePayroll);
router.patch('/:id/mark-paid', permission(PERMISSIONS.MANAGE_PAYROLL), markAsPaid);

module.exports = router;
