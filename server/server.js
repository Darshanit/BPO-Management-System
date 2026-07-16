require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const initSocket = require('./socket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  // Attach Socket.io for the real-time chat system (Phase: Chat System)
  initSocket(server);

  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Graceful shutdown & unhandled error safety nets
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
  });
};

startServer();
