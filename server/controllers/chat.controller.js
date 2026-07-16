const asyncHandler = require('express-async-handler');
const { Chat, Message } = require('../models/Chat');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @route  GET /api/chat — all chats (private + team) the logged-in user belongs to
const getMyChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'name avatar role')
    .populate('lastMessage')
    .sort('-updatedAt');

  res.status(200).json(new ApiResponse(200, 'Chats fetched', chats));
});

// @route  POST /api/chat/private — get-or-create a 1:1 chat with another user
const getOrCreatePrivateChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) throw new ApiError(400, 'userId is required');

  let chat = await Chat.findOne({
    isGroup: false,
    participants: { $all: [req.user._id, userId], $size: 2 },
  });

  if (!chat) {
    chat = await Chat.create({ isGroup: false, participants: [req.user._id, userId] });
  }

  chat = await chat.populate('participants', 'name avatar role');
  res.status(200).json(new ApiResponse(200, 'Private chat ready', chat));
});

// @route  POST /api/chat/team — create a team group chat
const createTeamChat = asyncHandler(async (req, res) => {
  const { name, team, participants } = req.body;

  const chat = await Chat.create({
    isGroup: true,
    name,
    team,
    participants: [...new Set([...participants, req.user._id.toString()])],
  });

  res.status(201).json(new ApiResponse(201, 'Team chat created', chat));
});

// @route  GET /api/chat/:chatId/messages?page=1&limit=30
const getMessages = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) throw new ApiError(404, 'Chat not found');
  if (!chat.participants.some((p) => p.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not a participant in this chat');
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);

  const messages = await Message.find({ chat: req.params.chatId })
    .populate('sender', 'name avatar')
    .populate('attachments')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(limit);

  res.status(200).json(new ApiResponse(200, 'Messages fetched', messages.reverse()));
});

// @route  POST /api/chat/:chatId/messages — REST fallback for sending (Socket.io is the primary path)
const sendMessage = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) throw new ApiError(404, 'Chat not found');

  const message = await Message.create({
    chat: chat._id,
    sender: req.user._id,
    text: req.body.text,
    attachments: req.body.attachments || [],
    seenBy: [req.user._id],
  });

  chat.lastMessage = message._id;
  await chat.save();

  const populated = await message.populate('sender', 'name avatar');
  res.status(201).json(new ApiResponse(201, 'Message sent', populated));
});

module.exports = {
  getMyChats,
  getOrCreatePrivateChat,
  createTeamChat,
  getMessages,
  sendMessage,
};
