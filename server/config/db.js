const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Establishes connection to MongoDB using Mongoose.
 * Exits process on failure since the app cannot run without a DB connection.
 */
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== 'production', // disable in prod for performance
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
