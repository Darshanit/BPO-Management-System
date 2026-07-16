const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/generateTokens');
const logger = require('../utils/logger');
const { Chat, Message } = require('../models/Chat');
const { Notification } = require('../models/Misc');

/**
 * Initializes Socket.io on top of the HTTP server.
 * Handles: joining chat rooms, sending messages (private + team), typing
 * indicators, seen/read receipts, and pushing live in-app notifications.
 */
function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Authenticate every socket connection using the same JWT access token
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: user ${socket.userId} (${socket.id})`);

    // Join a personal room so we can push notifications/messages directly to this user
    socket.join(`user:${socket.userId}`);

    // ---- Chat: join a specific chat room to receive its live events ----
    socket.on('chat:join', (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('chat:leave', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    // ---- Chat: send message (private or team) with optional file attachments ----
    socket.on('chat:message', async ({ chatId, text, attachments = [] }, callback) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.some((p) => p.toString() === socket.userId)) {
          return callback?.({ error: 'Not authorized for this chat' });
        }

        const message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          text,
          attachments,
          seenBy: [socket.userId],
        });
        chat.lastMessage = message._id;
        await chat.save();

        const populated = await message.populate('sender', 'name avatar');

        // Broadcast to everyone currently in the chat room (live view)
        io.to(`chat:${chatId}`).emit('chat:message', populated);

        // Push a notification to participants who aren't actively viewing the chat
        chat.participants
          .filter((p) => p.toString() !== socket.userId)
          .forEach((participantId) => {
            io.to(`user:${participantId}`).emit('notification:new', {
              type: 'chat',
              chatId,
              preview: text?.slice(0, 100),
            });
          });

        callback?.({ success: true, message: populated });
      } catch (err) {
        logger.error(`chat:message error: ${err.message}`);
        callback?.({ error: 'Failed to send message' });
      }
    });

    // ---- Chat: typing indicator ----
    socket.on('chat:typing', ({ chatId, isTyping }) => {
      socket.to(`chat:${chatId}`).emit('chat:typing', { userId: socket.userId, isTyping });
    });

    // ---- Chat: seen/read receipts ----
    socket.on('chat:seen', async ({ chatId }) => {
      await Message.updateMany(
        { chat: chatId, seenBy: { $ne: socket.userId } },
        { $addToSet: { seenBy: socket.userId } }
      );
      socket.to(`chat:${chatId}`).emit('chat:seen', { chatId, userId: socket.userId });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user ${socket.userId} (${socket.id})`);
    });
  });

  return io;
}

module.exports = initSocket;
