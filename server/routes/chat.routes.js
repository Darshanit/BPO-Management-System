const express = require('express');
const router = express.Router();

const {
  getMyChats,
  getOrCreatePrivateChat,
  createTeamChat,
  getMessages,
  sendMessage,
} = require('../controllers/chat.controller');

const protect = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', getMyChats);
router.post('/private', getOrCreatePrivateChat);
router.post('/team', createTeamChat);
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', sendMessage);

module.exports = router;
