const axios = require('axios');
const Job = require('../models/jobModel');
const ImportLog = require('../models/importLogModel');
const env = require('../config/env');
const logger = require('../config/logger');
const { parseFeed } = require('../utils/xml');
const chunkArray = require('../utils/chunkArray');
const { mapFeedItemToJob } = require('./jobMapper');

const fetchFeed = async (feedUrl) => {
  const response = await axios.get(feedUrl, { timeout: 20000 });
  return response.data;
};

const upsertJob = async (jobPayload) => {
  const filter = { externalId: jobPayload.externalId };
  const result = await Job.updateOne(filter, { $set: jobPayload }, { upsert: true });
  return {
    isNew: result.upsertedCount > 0,
    wasModified: (result.upsertedCount === 0 && result.modifiedCount > 0) || result.matchedCount > 0
  };
};

const importFeed = async ({ feedUrl, feedLabel }) => {
  const log = await ImportLog.create({ feedUrl, feedLabel, status: 'running', startedAt: new Date() });
  const counters = { totalFetched: 0, newJobs: 0, updatedJobs: 0, failedJobs: 0 };
  const failures = [];

  try {
    const xml = await fetchFeed(feedUrl);
    const { items } = await parseFeed(xml);
    counters.totalFetched = items.length;

    const chunks = chunkArray(items, env.importBatchSize || 50);

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (item) => {
          try {
            const jobPayload = mapFeedItemToJob(item, feedLabel);
            if (!jobPayload.externalId) {
              throw new Error('Job is missing a stable identifier');
            }

            const { isNew, wasModified } = await upsertJob(jobPayload);
            if (isNew) {
              counters.newJobs += 1;
            } else if (wasModified) {
              counters.updatedJobs += 1;
            }
          } catch (error) {
            counters.failedJobs += 1;
            if (failures.length < 10) {
              failures.push({ externalId: item?.guid || item?.link || 'unknown', reason: error.message });
            }
            logger.error({ err: error, feedUrl }, 'Job import failed');
          }
        })
      );
    }

    const totalImported = counters.newJobs + counters.updatedJobs;
    await ImportLog.findByIdAndUpdate(
      log._id,
      {
        ...counters,
        totalImported,
        failures,
        completedAt: new Date(),
        status: 'completed'
      },
      { new: true }
    );

    return { ...counters, totalImported };
  } catch (error) {
    await ImportLog.findByIdAndUpdate(log._id, {
      status: 'failed',
      completedAt: new Date(),
      notes: error.message
    });
    logger.error({ err: error, feedUrl }, 'Feed import failed');
    throw error;
  }
};

module.exports = { importFeed };