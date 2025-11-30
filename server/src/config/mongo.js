const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

let cachedConnection = null;

const connectMongo = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    mongoose.set('strictQuery', true);
    cachedConnection = await mongoose.connect(env.mongoUri);
    logger.info({ uri: env.mongoUri }, 'Connected to MongoDB');
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    logger.error({ err: error }, 'MongoDB connection failed');
    throw error;
  }
};

module.exports = { connectMongo };