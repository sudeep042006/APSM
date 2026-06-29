import { AnalyticsSnapshot } from './analytics.model.js';
import { fetchAndSaveYouTubeAnalytics } from './youtube.analytics.js';
import { fetchAndSaveFacebookAnalytics, fetchAndSaveInstagramAnalytics } from './meta.analytics.js';

const getAnalyticsSummary = async (req, res, next) => {
  try {
    let { platform, startDate, endDate } = req.query;
    
    // Automatically detect platform from path if not provided in query
    // e.g. /analytics/youtube -> 'youtube', /analytics/meta/facebook -> 'facebook'
    if (!platform) {
      const pathParts = req.path.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (['youtube', 'meta', 'linkedin', 'facebook', 'instagram'].includes(lastPart)) {
        platform = lastPart;
      }
    }

    const userId = req.user._id;

    // Helper function to handle live fetch logic for a specific platform
    const handlePlatformFetch = async (platformName, fetchFunction) => {
      try {
        const { forceRefresh } = req.query;

        if (forceRefresh !== 'true') {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const existingSnapshot = await AnalyticsSnapshot.findOne({
            incubationCenterId: userId,
            platform: platformName,
            snapshotDate: { $gte: oneDayAgo }
          }).sort({ snapshotDate: -1 });

          if (existingSnapshot) {
            console.log(`[analytics.controller] Returning cached ${platformName} snapshot for user ${userId}`);
            return { fromCache: true, data: existingSnapshot };
          }
        }

        console.log(`[analytics.controller] Fetching fresh ${platformName} data for user ${userId}...`);
        const snapshot = await fetchFunction(userId);

        // DB hygiene: Keep 30 most recent snapshots
        const oldestAllowed = await AnalyticsSnapshot.find({ incubationCenterId: userId, platform: platformName })
          .sort({ snapshotDate: -1 })
          .skip(30)
          .select('_id');
        if (oldestAllowed.length > 0) {
          const idsToDelete = oldestAllowed.map(doc => doc._id);
          await AnalyticsSnapshot.deleteMany({ _id: { $in: idsToDelete } });
        }

        return { fromCache: false, data: snapshot };
      } catch (err) {
        console.error(`⚠️ [analytics.controller] Live ${platformName} fetch failed, returning latest snapshot:`, err.message);
        const latestSnapshot = await AnalyticsSnapshot.findOne({ incubationCenterId: userId, platform: platformName })
                                                       .sort({ snapshotDate: -1 });
        if (!latestSnapshot) {
          throw new Error(`Failed to fetch live ${platformName} analytics, and no saved snapshot was found: ${err.message}`);
        }
        return { fromCache: true, data: latestSnapshot, failedLiveFetch: true };
      }
    };

    // Live fetch check for platforms
    if (platform === 'youtube') {
      try {
        const result = await handlePlatformFetch('youtube', fetchAndSaveYouTubeAnalytics);
        return res.json({
          message: result.failedLiveFetch 
            ? 'Retrieved latest cached YouTube analytics (live fetch failed)'
            : (result.fromCache ? 'YouTube analytics retrieved from cache' : 'YouTube analytics retrieved successfully'),
          data: result.data
        });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    if (platform === 'facebook') {
      try {
        const result = await handlePlatformFetch('facebook', fetchAndSaveFacebookAnalytics);
        return res.json({
          message: result.failedLiveFetch 
            ? 'Retrieved latest cached Facebook analytics (live fetch failed)'
            : (result.fromCache ? 'Facebook analytics retrieved from cache' : 'Facebook analytics retrieved successfully'),
          data: result.data
        });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    if (platform === 'instagram') {
      try {
        const result = await handlePlatformFetch('instagram', fetchAndSaveInstagramAnalytics);
        return res.json({
          message: result.failedLiveFetch 
            ? 'Retrieved latest cached Instagram analytics (live fetch failed)'
            : (result.fromCache ? 'Instagram analytics retrieved from cache' : 'Instagram analytics retrieved successfully'),
          data: result.data
        });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }

    // Identify active connected platforms for initial fetch logic
    let activePlatforms = platform
      ? [platform]
      : (req.user.socialAccounts || [])
          .filter(acc => acc.isActive)
          .map(acc => acc.platform);

    // Expand 'meta' to facebook and instagram if checking active platforms
    if (activePlatforms.includes('meta')) {
      activePlatforms = activePlatforms.filter(p => p !== 'meta');
      activePlatforms.push('facebook', 'instagram');
    }

    // If 0 snapshots exist for an active platform, run the initial fetch
    for (const p of activePlatforms) {
      const count = await AnalyticsSnapshot.countDocuments({ incubationCenterId: userId, platform: p });
      if (count === 0) {
        if (p === 'youtube') {
          try { await fetchAndSaveYouTubeAnalytics(userId); } catch (err) { console.error(`❌ Dynamic initial fetch failed for YouTube:`, err.message); }
        } else if (p === 'facebook') {
          try { await fetchAndSaveFacebookAnalytics(userId); } catch (err) { console.error(`❌ Dynamic initial fetch failed for Facebook:`, err.message); }
        } else if (p === 'instagram') {
          try { await fetchAndSaveInstagramAnalytics(userId); } catch (err) { console.error(`❌ Dynamic initial fetch failed for Instagram:`, err.message); }
        }
      }
    }

    // Retrieve the snapshots from database with optional date filtering
    const query = { incubationCenterId: userId };
    if (platform && platform !== 'meta') {
      query.platform = platform;
    } else if (platform === 'meta') {
      // Return both facebook and instagram if meta is queried
      query.platform = { $in: ['facebook', 'instagram', 'meta'] };
    }

    if (startDate || endDate) {
      query.snapshotDate = {};
      if (startDate) query.snapshotDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.snapshotDate.$lte = end;
      }
    }

    const data = await AnalyticsSnapshot.find(query)
                                        .sort({ snapshotDate: -1 })
                                        .limit(30);

    res.json({
      message: 'Analytics retrieved successfully',
      data: data
    });
  } catch (err) {
    next(err);
  }
};

export default { getAnalyticsSummary };