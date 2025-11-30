import express from "express";
// import { runImportForAllFeeds } from "../services/importService.js";
// import { ImportLog } from "../models/ImportLog.js";
import { runFeed } from "../controllers/run.controller.js";
import { runLogs } from "../controllers/log.controller.js";

export function createImportRouter() {
  const router = express.Router();

  router.post("/run", runFeed);
  router.get("/logs", runLogs);

  return router;
}


