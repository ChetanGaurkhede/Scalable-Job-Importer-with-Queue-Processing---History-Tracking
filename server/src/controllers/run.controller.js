import { runImportForAllFeeds } from "../services/importService.js";

export async function runFeed (req, res)  {
  try {
    const result = await runImportForAllFeeds();
    res.json({ ok: true, result });
  } catch (err) {
    console.error("Error in /api/import/run", err);
    res.status(500).json({ ok: false, error: err.message || "Unknown error" });
  }
}
