const express = require('express');
const router = express.Router();

const {
  getClients,
  getClientById,
  getMyClientProfile,
  createClient,
  updateClient,
  deleteClient,
  addInvoice,
  raiseTicket,
  getMyTickets,
  getAllTickets,
  replyToTicket,
} = require('../controllers/client.controller');

const protect = require('../middlewares/auth.middleware');
const { permission, authorize } = require('../middlewares/rbac.middleware');
const { PERMISSIONS, ROLES } = require('../config/roles');

router.use(protect);

router.get('/me', authorize(ROLES.CLIENT), getMyClientProfile);

// ---- Support tickets (specific paths first, to not collide with /:id) ----
router.post('/tickets', authorize(ROLES.CLIENT), raiseTicket);
router.get('/tickets/mine', authorize(ROLES.CLIENT), getMyTickets);
router.get(
  '/tickets',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR, ROLES.TEAM_LEADER),
  getAllTickets
);
router.patch(
  '/tickets/:id/reply',
  authorize(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_LEADER, ROLES.CLIENT),
  replyToTicket
);

// ---- Client profile CRUD ----
router
  .route('/')
  .get(permission(PERMISSIONS.MANAGE_CLIENTS), getClients)
  .post(permission(PERMISSIONS.MANAGE_CLIENTS), createClient);

router
  .route('/:id')
  .get(permission(PERMISSIONS.MANAGE_CLIENTS), getClientById)
  .put(permission(PERMISSIONS.MANAGE_CLIENTS), updateClient)
  .delete(permission(PERMISSIONS.MANAGE_CLIENTS), deleteClient);

router.post('/:id/invoices', permission(PERMISSIONS.MANAGE_CLIENTS), addInvoice);

module.exports = router;
