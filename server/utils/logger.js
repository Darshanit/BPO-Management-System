const { createLogger, format, transports } = require('winston');
const path = require('path');

/**
 * Application-wide Winston logger.
 * Logs to console (dev) and to rotating files under server/logs.
 */
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(__dirname, '..', 'logs', 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(__dirname, '..', 'logs', 'combined.log') }),
  ],
  exitOnError: false,
});

module.exports = logger;
