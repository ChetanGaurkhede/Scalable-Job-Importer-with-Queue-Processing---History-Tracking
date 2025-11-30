const { Worker, QueueScheduler } = require('bullmq');
const env = require('../config/env');
const { getBullMQConnection } = require('../config/redis');
const { connectMongo } = require('../config/mongo');
const logger = require('../config/logger');
const { importFeed } = require('../services/jobImportService');

const startWorker = async () => {
  await connectMongo();

  const connection = getBullMQConnection();
  const scheduler = new QueueScheduler(env.queueName, { connection });
  await scheduler.waitUntilReady();

  const worker = new Worker(
    env.queueName,
    async (job) => {
      logger.info({ jobId: job.id, feedUrl: job.data.feedUrl }, 'Processing feed import');
      return importFeed(job.data);
    },
    {
      connection,
      concurrency: env.workerConcurrency || 5
    }
  );

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'Feed import completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Feed import failed');
  });

  logger.info('Worker ready');
};

startWorker().catch((err) => {
  logger.error({ err }, 'Worker crashed');
  process.exit(1);
});