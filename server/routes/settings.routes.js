const express = require('express');
const router = express.Router();

const { getSettings, updateSettings } = require('../controllers/settings.controller');
const protect = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/rbac.middleware');
const { ROLES } = require('../config/roles');

router.use(protect);

router.get('/', getSettings);
router.put('/', authorize(ROLES.SUPER_ADMIN), updateSettings);

module.exports = router;
