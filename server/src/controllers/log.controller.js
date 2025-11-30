import { ImportLog } from "../models/ImportLog.js";

export async function runLogs(req, res) {
  try {
    const logs = await ImportLog.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const mapped = logs.map((log) => ({
      id: log._id.toString(),
      timestamp: log.timestamp,
      fileName: log.feedUrl,
      totalFetched: log.totalFetched,
      totalImported: log.totalImported,
      newJobs: log.newJobs,
      updatedJobs: log.updatedJobs,
      failedJobs: log.failedJobs
    }));

    res.json({ ok: true, data: mapped });
  } catch (err) {
    console.error("Error in /api/import/logs", err);
    res.status(500).json({ ok: false, error: err.message || "Unknown error" });
  }
}