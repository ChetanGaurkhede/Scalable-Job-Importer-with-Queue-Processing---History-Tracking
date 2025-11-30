import mongoose from "mongoose";

const FailedJobSchema = new mongoose.Schema(
  {
    externalId: String,
    reason: String
  },
  { _id: false }
);

const ImportLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    feedUrl: { type: String, required: true },
    totalFetched: { type: Number, default: 0 },
    totalImported: { type: Number, default: 0 },
    newJobs: { type: Number, default: 0 },
    updatedJobs: { type: Number, default: 0 },
    failedJobs: { type: [FailedJobSchema], default: [] }
  },
  { timestamps: true, collection: "import_logs" }
);

export const ImportLog = mongoose.model("ImportLog", ImportLogSchema);


