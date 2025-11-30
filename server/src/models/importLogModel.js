const mongoose = require('mongoose');

const failureSchema = new mongoose.Schema(
  {
    externalId: String,
    reason: String
  },
  { _id: false }
);

const importLogSchema = new mongoose.Schema(
  {
    feedUrl: { type: String, required: true },
    feedLabel: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    totalFetched: { type: Number, default: 0 },
    totalImported: { type: Number, default: 0 },
    newJobs: { type: Number, default: 0 },
    updatedJobs: { type: Number, default: 0 },
    failedJobs: { type: Number, default: 0 },
    failures: [failureSchema],
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending'
    },
    notes: String
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ImportLog || mongoose.model('ImportLog', importLogSchema);