import dotenv from "dotenv";

dotenv.config();

export function getEnv() {
  const mongoUri = process.env.MONGO_URI;
  const redisUrl = process.env.REDIS_URL;
  const port = Number.parseInt(process.env.PORT || "4000", 10);
  const importConcurrency = Number.parseInt(process.env.IMPORT_CONCURRENCY || "5", 10);
  const importIntervalMinutes = Number.parseInt(process.env.IMPORT_INTERVAL_MINUTES || "60", 10);
  const queueName = process.env.QUEUE_NAME || "job-import-queue";

  return {
    mongoUri,
    redisUrl,
    port,
    importConcurrency,
    importIntervalMinutes,
    queueName
  };
}