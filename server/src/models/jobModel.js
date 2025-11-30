const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true, index: true, unique: true },
    title: { type: String, required: true },
    company: String,
    location: String,
    description: String,
    url: String,
    source: { type: String, required: true },
    publishedAt: Date,
    raw: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

module.exports = mongoose.models.Job || mongoose.model('Job', jobSchema);