import express from "express";
import cors from "cors";
import { getEnv } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { startWorker } from "./queue/queue.js";
import { createImportRouter } from "./routes/importRoutes.js";
import { runImportForAllFeeds } from "./services/importService.js";

async function bootstrap() {
  const app = express();
  const env = getEnv();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/import", createImportRouter());

  await connectDb();
  startWorker();

  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });

  const intervalMs = env.importIntervalMinutes * 60 * 1000;
  console.log(`Scheduling automatic import every ${env.importIntervalMinutes} minutes`);

  setInterval(() => {
    console.log("Running scheduled import for all feeds");
    runImportForAllFeeds().catch((err) => {
      console.error("Scheduled import error", err);
    });
  }, intervalMs);
}

bootstrap().catch((err) => {
  console.error("Fatal error during bootstrap", err);
  process.exit(1);
});


