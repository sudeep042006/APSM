import { AnalyticsSnapshot } from './analytics.model.js';
import { fetchAndSaveYouTubeAnalytics } from './youtube.analytics.js';

const getAnalyticsSummary = async (req, res, next) => {
  try {
    let { platform } = req.query;
    
    // Automatically detect platform from path if not provided in query (e.g. /analytics/youtube)
    if (!platform) {
      const lastPart = req.path.split('/').pop();
      if (['youtube', 'meta', 'linkedin'].includes(lastPart)) {
        platform = lastPart;
      }
    }

    const userId = req.user._id;

    // For YouTube direct request, perform a fresh fetch and return the complete JSON data
    if (platform === 'youtube') {
      try {
        console.log(`[analytics.controller] Fetching fresh YouTube data for user ${userId}...`);
        const snapshot = await fetchAndSaveYouTubeAnalytics(userId);
        return res.json({
          message: 'YouTube analytics retrieved successfully',
          data: snapshot
        });
      } catch (err) {
        console.error(`⚠️ [analytics.controller] Live YouTube fetch failed, returning latest snapshot:`, err.message);
        const latestSnapshot = await AnalyticsSnapshot.findOne({ incubationCenterId: userId, platform: 'youtube' })
                                                       .sort({ snapshotDate: -1 });
        if (!latestSnapshot) {
          return res.status(400).json({
            error: 'Failed to fetch live YouTube analytics, and no saved snapshot was found.',
            details: err.message
          });
        }
        return res.json({
          message: 'Retrieved latest cached YouTube analytics (live fetch failed)',
          data: latestSnapshot
        });
      }
    }

    // Identify active connected platforms to check/fetch
    const activePlatforms = platform
      ? [platform]
      : (req.user.socialAccounts || [])
          .filter(acc => acc.isActive)
          .map(acc => acc.platform);

    // If 0 snapshots exist for an active platform, run the initial fetch
    for (const p of activePlatforms) {
      const count = await AnalyticsSnapshot.countDocuments({ incubationCenterId: userId, platform: p });
      if (count === 0) {
        if (p === 'youtube') {
          try {
            await fetchAndSaveYouTubeAnalytics(userId);
          } catch (err) {
            console.error(`❌ Dynamic initial fetch failed for YouTube:`, err.message);
          }
        }
      }
    }

    // Retrieve the snapshots from database
    const query = { incubationCenterId: userId };
    if (platform) {
      query.platform = platform;
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