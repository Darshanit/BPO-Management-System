const express = require('express');
const router = express.Router();

const { generateReport } = require('../controllers/report.controller');
const protect = require('../middlewares/auth.middleware');
const { permission } = require('../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../config/roles');

router.use(protect);

router.get('/:type', permission(PERMISSIONS.VIEW_REPORTS), generateReport);

module.exports = router;
