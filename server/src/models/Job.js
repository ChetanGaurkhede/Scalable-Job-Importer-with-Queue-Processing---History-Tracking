import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    externalId: { type: String, index: true, unique: true },
    title: String,
    link: String,
    description: String,
    company: String,
    location: String,
    publishedAt: Date,
    raw: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Job = mongoose.model("Job", JobSchema);


