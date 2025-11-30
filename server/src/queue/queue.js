import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { getEnv } from "../config/env.js";
import { Job } from "../models/Job.js";
import { ImportLog } from "../models/ImportLog.js";

const { redisUrl, importConcurrency } = getEnv();

// BullMQ v5 requires maxRetriesPerRequest to be null on the underlying Redis client
// For Redis Cloud, detect if URL uses rediss:// (SSL) and enable TLS
const isSSL = redisUrl.startsWith('rediss://');
const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  ...(isSSL && {
    tls: {
      rejectUnauthorized: false
    }
  })
});

export const jobImportQueue = new Queue("job-import-queue", { connection });

function buildExternalId(jobItem) {
  if (jobItem.guid && jobItem.guid[0]) {
    return jobItem.guid[0]._;
  }
  if (jobItem.link && jobItem.link[0]) {
    return jobItem.link[0];
  }
  if (jobItem.title && jobItem.title[0]) {
    return jobItem.title[0];
  }
  return JSON.stringify(jobItem).slice(0, 100);
}

export function startWorker() {
  const worker = new Worker(
    "job-import-queue",
    async (job) => {
      const { item, feedUrl, importLogId } = job.data;
      const externalId = buildExternalId(item);

      try {
        const filter = { externalId };
        const update = {
          $set: {
            externalId,
            title: item.title?.[0] || "",
            link: item.link?.[0] || "",
            description: item.description?.[0] || "",
            company: item["job:company"]?.[0] || "",
            location: item["job:location"]?.[0] || "",
            publishedAt: item.pubDate ? new Date(item.pubDate[0]) : undefined,
            raw: item
          }
        };

        const options = { upsert: true, new: true, setDefaultsOnInsert: true };
        const existing = await Job.findOne({ externalId }).lean();
        await Job.findOneAndUpdate(filter, update, options);

        const isNew = !existing;
        const updateLog = {
          $inc: {
            totalImported: 1,
            ...(isNew ? { newJobs: 1 } : { updatedJobs: 1 })
          }
        };

        await ImportLog.findByIdAndUpdate(importLogId, updateLog);

        return { status: "ok", externalId, feedUrl };
      } catch (err) {
        console.error("Worker job error", err);
        await ImportLog.findByIdAndUpdate(importLogId, {
          $inc: { failedJobsCount: 1 },
          $push: {
            failedJobs: {
              externalId,
              reason: err.message || "Unknown error"
            }
          }
        });
        throw err;
      }
    },
    { connection, concurrency: importConcurrency }
  );

  worker.on("failed", (job, err) => {
    console.error("Job failed", job?.id, err);
  });

  return worker;
}


