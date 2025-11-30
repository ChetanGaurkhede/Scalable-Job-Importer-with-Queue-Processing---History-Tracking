const { Queue } = require('bullmq');
const env = require('../config/env');
const { getBullMQConnection } = require('../config/redis');
const logger = require('../config/logger');

const queue = new Queue(env.queueName, {
  connection: getBullMQConnection(),
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 200
  }
});

const enqueueFeedImport = async ({ feedUrl, feedLabel }) => {
  const job = await queue.add(
    'import-feed',
    { feedUrl, feedLabel },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    }
  );
  logger.info({ jobId: job.id, feedUrl }, 'Enqueued feed import job');
  return job.id;
};

module.exports = { queue, enqueueFeedImport };