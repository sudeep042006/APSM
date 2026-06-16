import mongoose from 'mongoose';

const AnalyticsSnapshotSchema = new mongoose.Schema({
  incubationCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['linkedin', 'meta', 'youtube'],
    required: true
  },
  snapshotDate: {
    type: Date,
    default: Date.now
  },
  metrics: {
    followers: { type: Number, default: 0 },
    engagementRate: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 }
  },
  rawPlatformData: {
    type: mongoose.Schema.Types.Mixed // Stores the unique JSON from each API
  }
}, { timestamps: true });

// Prevent saving duplicate data for the same platform on the same day
AnalyticsSnapshotSchema.index({ incubationCenterId: 1, platform: 1, snapshotDate: 1 });

export const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', AnalyticsSnapshotSchema);