const Redis = require('ioredis');
const env = require('./env');
const logger = require('./logger');

let baseClient;

const buildClient = () => {
  const client = new Redis(env.redisUrl);
  client.on('error', (err) => logger.error({ err }, 'Redis error'));
  client.on('connect', () => logger.info('Redis connected'));
  return client;
};

const getRedisClient = () => {
  if (!baseClient) {
    baseClient = buildClient();
  }
  return baseClient;
};

const getBullMQConnection = () => getRedisClient().duplicate();

module.exports = { getRedisClient, getBullMQConnection };