import { jobImportQueue } from "../queue/queue.js";
import { ImportLog } from "../models/ImportLog.js";
import { fetchJobsFromFeed, getFeedUrls } from "./jobFetchService.js";

export async function runImportForFeed(feedUrl) {
  const items = await fetchJobsFromFeed(feedUrl);

  const importLog = await ImportLog.create({
    feedUrl,
    totalFetched: items.length
  });

  const jobs = items.map((item) => ({
    name: "import-job",
    data: { item, feedUrl, importLogId: importLog._id.toString() }
  }));

  if (jobs.length > 0) {
    await jobImportQueue.addBulk(jobs);
  }

  return {
    importLogId: importLog._id.toString(),
    totalFetched: items.length
  };
}

export async function runImportForAllFeeds() {
  const feeds = getFeedUrls();
  const results = [];

  for (const feedUrl of feeds) {
    try {
      const res = await runImportForFeed(feedUrl);
      results.push({ feedUrl, ...res });
    } catch (err) {
      console.error("Error importing feed", feedUrl, err);
      results.push({
        feedUrl,
        error: err.message || "Unknown error",
        importLogId: null,
        totalFetched: 0
      });
    }
  }

  return results;
}


