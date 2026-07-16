const express = require('express');
const router = express.Router();

const {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  moveStage,
  addNote,
  deleteCandidate,
} = require('../controllers/candidate.controller');

const protect = require('../middlewares/auth.middleware');
const { permission } = require('../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../config/roles');

router.use(protect, permission(PERMISSIONS.MANAGE_RECRUITMENT));

router.route('/').get(getCandidates).post(createCandidate);
router.route('/:id').get(getCandidateById).put(updateCandidate).delete(deleteCandidate);
router.patch('/:id/stage', moveStage);
router.post('/:id/notes', addNote);

module.exports = router;
