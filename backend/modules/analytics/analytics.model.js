import mongoose from 'mongoose';

const AnalyticsSnapshotSchema = new mongoose.Schema({
  incubationCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['linkedin', 'meta', 'facebook', 'instagram', 'youtube'], required: true },
  snapshotDate: { type: Date, default: Date.now },
  
  // 1. CORE METRICS (The daily numbers)
  // NOTE: `impressions` / `reach` are NOT exposed by the YouTube Reporting API.
  // They are left at 0 for YouTube rather than being faked from view counts;
  // the frontend hides any metric that is 0 AND flagged as unsupported.
  metrics: {
    followers: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 }, // How many times it was on a screen
    reach: { type: Number, default: 0 },       // How many UNIQUE accounts saw it
    profileViews: { type: Number, default: 0 },
    totalEngagement: { type: Number, default: 0 }, // Likes + Comments + Shares
    // Real, period-scoped values measured over the requested window
    totalViews: { type: Number, default: 0 },        // sum of daily `views`
    watchTimeMinutes: { type: Number, default: 0 }, // sum of daily `estimatedMinutesWatched`
    videoCount: { type: Number, default: 0 }         // lifetime published videos
  },

  // 2. DEMOGRAPHICS (Who & Where)
  demographics: {
    // Array of objects e.g., [{ name: 'IN', count: 4500 }, { name: 'US', count: 1200 }]
    topCountries: [{ name: String, count: Number }],
    topCities: [{ name: String, count: Number }],
    // `percentage` is the REAL viewerPercentage returned by the YouTube Reporting API.
    // `count` is a view-weighted estimate derived from it (kept for older clients).
    // e.g., [{ group: 'age18-24_male', count: 300, ageGroup: 'age18-24', gender: 'male', percentage: 12.4 }]
    ageAndGender: [{ group: String, count: Number, ageGroup: String, gender: String, percentage: Number }]
  },

  // 3. ADVERTISING DATA (If they are running paid campaigns)
  ads: {
    activeCampaigns: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    adImpressions: { type: Number, default: 0 },
    costPerClick: { type: Number, default: 0 }
  },

  // 4. PLATFORM QUIRKS (Stuff that doesn't fit the standard)
  rawPlatformData: {
    type: mongoose.Schema.Types.Mixed 
    // e.g., YouTube's "averageViewDuration" or Meta's "story_replies"
  }
}, { timestamps: true });

AnalyticsSnapshotSchema.index({ incubationCenterId: 1, platform: 1, snapshotDate: 1 });
export const AnalyticsSnapshot = mongoose.model('AnalyticsSnapshot', AnalyticsSnapshotSchema);