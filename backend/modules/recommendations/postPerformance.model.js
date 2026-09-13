import mongoose from 'mongoose';

// One normalized record per published post. Platform sync jobs should upsert this
// shape instead of making recommendation logic depend on platform-specific APIs.
const postPerformanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  platform: { type: String, enum: ['youtube', 'facebook', 'instagram', 'linkedin'], required: true },
  externalPostId: { type: String, required: true },
  industry: { type: String, default: 'general', trim: true, lowercase: true },
  contentType: { type: String, default: 'post', trim: true, lowercase: true },
  title: { type: String, default: '' },
  caption: { type: String, default: '' },
  hashtags: { type: [String], default: [] },
  publishedAt: { type: Date, required: true, index: true },
  metrics: {
    reach: { type: Number, default: 0, min: 0 },
    impressions: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    comments: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    saves: { type: Number, default: 0, min: 0 },
  },
}, { timestamps: true });

postPerformanceSchema.index({ userId: 1, platform: 1, externalPostId: 1 }, { unique: true });
postPerformanceSchema.index({ userId: 1, industry: 1, publishedAt: -1 });

export const PostPerformance = mongoose.model('PostPerformance', postPerformanceSchema);
