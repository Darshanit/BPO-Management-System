const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/generateTokens');
const logger = require('../utils/logger');

/**
 * Initializes Socket.io on top of the HTTP server.
 * Full event handlers (private chat, team chat, typing indicators, seen
 * status, file sharing) are added in the Chat System phase — this sets up
 * the authenticated connection scaffold so that phase can plug straight in.
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

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user ${socket.userId} (${socket.id})`);
    });
  });

  return io;
}

module.exports = initSocket;
