import mongoose from 'mongoose';

// Stores no draft text. It provides a privacy-conscious audit trail for later
// calibration against actual published outcomes.
const recommendationRunSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  modelVersion: { type: String, required: true },
  draftFingerprint: { type: String, required: true },
  dataSnapshot: {
    sampleSize: { type: Number, required: true },
    comparablePosts: { type: Number, default: 0 },
    baselineEngagementRate: { type: Number, default: 0 },
    lookbackDays: { type: Number, required: true },
  },
  recommendation: { type: mongoose.Schema.Types.Mixed, required: true },
  feedback: {
    helpful: Boolean,
    note: { type: String, maxlength: 500 },
    recordedAt: Date,
  },
  outcome: {
    publishedAt: Date,
    reach: { type: Number, min: 0 },
    impressions: { type: Number, min: 0 },
    likes: { type: Number, min: 0 },
    comments: { type: Number, min: 0 },
    shares: { type: Number, min: 0 },
    saves: { type: Number, min: 0 },
    selectedRecommendations: { type: [String], default: [] },
    recordedAt: Date,
  },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), expires: 0 },
}, { timestamps: true });

recommendationRunSchema.index({ userId: 1, createdAt: -1 });
export const RecommendationRun = mongoose.model('RecommendationRun', recommendationRunSchema);
