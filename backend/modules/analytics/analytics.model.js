import mongoose from 'mongoose';

const AnalyticsSnapshotSchema = new mongoose.Schema({
  incubationCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['linkedin', 'meta', 'facebook', 'instagram', 'youtube'], required: true },
  snapshotDate: { type: Date, default: Date.now },

  metrics: {
    followers: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 }, // How many times it was on a screen
    reach: { type: Number, default: 0 },       // How many UNIQUE accounts saw it
    profileViews: { type: Number, default: 0 },
    totalEngagement: { type: Number, default: 0 }, // Likes + Comments + Shares
    // Real, period-scoped values measured over the requested window
    totalViews: { type: Number, default: 0 },        // sum of daily `views`
    watchTimeMinutes: { type: Number, default: 0 }, // sum of daily `estimatedMinutesWatched`
    videoCount: { type: Number, default: 0 }      
  },

  // 2. DEMOGRAPHICS (Who & Where)
  demographics: {

    topCountries: [{ name: String, count: Number }],
    topCities: [{ name: String, count: Number }],

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