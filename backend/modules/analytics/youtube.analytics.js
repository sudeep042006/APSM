import axios from 'axios';
import { getValidToken } from '../../utils/tokenManager.js';
import { AnalyticsSnapshot } from './analytics.model.js';

/**
 * The YouTube Reporting API only serves data for *complete* days.
 * Google documents a 1–2 day lag (occasionally longer under load), so asking for
 * `endDate = today` returns either nothing or a partially-populated final row.
 * We clamp the requested window to the last day that is actually reportable.
 */
const REPORTING_LAG_DAYS = 2;
const DEFAULT_WINDOW_DAYS = 30;

const toISODate = (d) => d.toISOString().split('T')[0];

/**
 * Resolves the effective reporting window.
 * A caller-supplied range is honoured but always clamped to `today - REPORTING_LAG_DAYS`
 * so the API never returns a trailing day of zeros. The caller gets the *effective*
 * window back so the UI can label charts with the truth instead of the request.
 */
const resolveRange = (range = {}) => {
  const today = new Date();
  const latestReportable = new Date(today);
  latestReportable.setDate(latestReportable.getDate() - REPORTING_LAG_DAYS);

  const requestedStart = range.startDate ? new Date(range.startDate) : null;
  const requestedEnd = range.endDate ? new Date(range.endDate) : null;

  const isValidDate = (d) => d && !Number.isNaN(d.getTime());

  const start = isValidDate(requestedStart)
    ? requestedStart
    : new Date(latestReportable.getTime() - (DEFAULT_WINDOW_DAYS - 1) * 24 * 60 * 60 * 1000);

  const end = isValidDate(requestedEnd) ? requestedEnd : latestReportable;
  const effectiveEnd = end > latestReportable ? latestReportable : end;
  const effectiveStart = start > effectiveEnd ? effectiveEnd : start;

  return {
    startDate: toISODate(effectiveStart),
    endDate: toISODate(effectiveEnd),
    requestedStartDate: isValidDate(requestedStart) ? toISODate(requestedStart) : null,
    requestedEndDate: isValidDate(requestedEnd) ? toISODate(requestedEnd) : null,
    clampedByLagDays: end > latestReportable ? Math.round((end - latestReportable) / 86_400_000) : 0
  };
};

export const fetchAndSaveYouTubeAnalytics = async (userId, range = {}) => {
  let hasRealData = false;
  let lastError = null;
  let channel = null;
  let stats = {};
  let recentVideos = [];
  let dailyReport = null;
  let countryReport = null;
  let deviceReport = null;
  let ageGenderReport = null;
  let playlists = [];

  // Per-report failures are recorded (not swallowed) so the UI can explain an
  // empty chart instead of rendering a blank frame with no explanation.
  const reportErrors = {};

  const window = resolveRange(range);

  try {
    // 1. Get valid access token
    const accessToken = await getValidToken(userId, 'youtube');

    // 2. Fetch complete channel details
    console.log(`[youtube.analytics] Fetching channel details for user ${userId}...`);
    const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { 
        part: 'id,snippet,statistics,contentDetails,brandingSettings,status,topicDetails', 
        mine: true 
      }
    });

    channel = channelResponse.data.items?.[0];
    if (!channel) {
      throw new Error('No YouTube channel found for the authenticated account.');
    }

    stats = channel.statistics || {};
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

    // 3. Fetch recent uploads (videos) details
    if (uploadsPlaylistId) {
      try {
        console.log(`[youtube.analytics] Fetching recent uploads from playlist: ${uploadsPlaylistId}`);
        const playlistResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            part: 'snippet,contentDetails',
            playlistId: uploadsPlaylistId,
            maxResults: 25
          }
        });

        const playlistItems = playlistResponse.data.items || [];
        const videoIds = playlistItems.map(item => item.contentDetails?.videoId).filter(Boolean);

        if (videoIds.length > 0) {
          // The `videos.list` endpoint accepts at most 50 ids per call.
          const chunks = [];
          for (let i = 0; i < videoIds.length; i += 50) chunks.push(videoIds.slice(i, i + 50));

          const items = [];
          for (const chunk of chunks) {
            const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
              headers: { Authorization: `Bearer ${accessToken}` },
              params: {
                part: 'snippet,statistics,contentDetails,status,topicDetails',
                id: chunk.join(',')
              }
            });
            items.push(...(videosResponse.data.items || []));
          }
          recentVideos = items;
        }
      } catch (err) {
        console.error(`⚠️ [youtube.analytics] Failed to fetch recent video details:`, err.message);
      }
    }

    // 3b. Fetch playlists
    try {
      console.log(`[youtube.analytics] Fetching playlists for user ${userId}...`);
      const playlistsResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlists', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          part: 'snippet,contentDetails',
          mine: true,
          maxResults: 50
        }
      });
      playlists = playlistsResponse.data.items || [];
    } catch (err) {
      console.error(`⚠️ [youtube.analytics] Failed to fetch playlists:`, err.message);
    }

    // 4. Fetch YouTube Analytics reports over the resolved window
    const fetchAnalyticsReport = async (dimensions, metrics, sort = null) => {
      const params = {
        ids: 'channel==MINE',
        startDate: window.startDate,
        endDate: window.endDate,
        metrics,
      };
      if (dimensions) params.dimensions = dimensions;
      if (sort) params.sort = sort;

      const res = await axios.get('https://youtubeanalytics.googleapis.com/v2/reports', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      });
      return res.data;
    };

    // NOTE: `dislikes` was removed from the YouTube Reporting API in 2021.
    // Requesting it made Google reject the ENTIRE daily report with a 400,
    // which silently blanked every time-series chart in the dashboard.
    const runReport = async (key, label, dimensions, metrics, sort = null) => {
      try {
        console.log(`[youtube.analytics] Fetching ${label} report (${window.startDate} → ${window.endDate})...`);
        const report = await fetchAnalyticsReport(dimensions, metrics, sort);
        if (!report || !Array.isArray(report.rows) || report.rows.length === 0) {
          reportErrors[key] = `${label}: the API returned no rows for this period.`;
          console.warn(`⚠️ [youtube.analytics] ${label} report returned 0 rows for ${window.startDate} → ${window.endDate}`);
        }
        return report;
      } catch (err) {
        const detail = err.response?.data?.error?.message || err.message;
        reportErrors[key] = `${label}: ${detail}`;
        console.error(`⚠️ [youtube.analytics] Failed to fetch ${label} report:`, detail);
        return null;
      }
    };

    dailyReport = await runReport(
      'daily',
      'daily performance',
      'day',
      'views,comments,likes,shares,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost',
      'day'
    );

    countryReport = await runReport(
      'country',
      'country demographics',
      'country',
      'views,likes,comments,shares,estimatedMinutesWatched',
      '-views'
    );

    deviceReport = await runReport(
      'device',
      'device type',
      'deviceType',
      'views,estimatedMinutesWatched',
      '-views'
    );

    // `viewerPercentage` is the real, measured audience share returned by YouTube.
    ageGenderReport = await runReport(
      'ageGender',
      'age/gender demographics',
      'ageGroup,gender',
      'viewerPercentage'
    );

    if (!dailyReport) {
      // Do NOT persist this. The daily report is the source for every
      // time-series chart, the period totals and the engagement rate. Saving a
      // snapshot without it writes an all-zero document, and `fetchOrCache` then
      // serves that poisoned snapshot for the next 24 h — so a single failed
      // fetch (most often a channel that never granted `yt-analytics.readonly`)
      // blanks the whole dashboard for a day instead of surfacing one error.
      // Throwing lets the controller fall back to the last good snapshot.
      console.error(
        `❌ [youtube.analytics] No daily report for user ${userId}. ` +
        `Most likely causes: the 'yt-analytics.readonly' scope was never granted ` +
        `(reconnect the channel), or the channel has no reportable activity. ` +
        `Reason: ${reportErrors.daily || 'unknown'}`
      );
      throw new Error(
        `YouTube daily report unavailable for ${window.startDate} → ${window.endDate}: ` +
        `${reportErrors.daily || 'the Reporting API returned no rows'}. ` +
        `If this persists, reconnect the channel to grant the yt-analytics.readonly scope.`
      );
    }

    hasRealData = true;
  } catch (error) {
    console.warn(`⚠️ [youtube.analytics] YouTube API fetch skipped/failed for user ${userId}:`, error.message);
    // Keep the specific reason (e.g. the missing `yt-analytics.readonly` scope)
    // so the controller's fallback path and the UI both show what actually
    // failed instead of a generic "no YouTube account connected".
    lastError = error;
  }

  if (hasRealData) {
    // 5. Aggregate the daily report into real period totals
    let totalViews30Days = 0;
    let watchTimeMinutes = 0;
    let totalEngagement = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    if (dailyReport && Array.isArray(dailyReport.rows) && Array.isArray(dailyReport.columnHeaders)) {
      const idx = (name) => dailyReport.columnHeaders.findIndex(h => h.name === name);
      const viewsIdx = idx('views');
      const likesIdx = idx('likes');
      const commentsIdx = idx('comments');
      const sharesIdx = idx('shares');
      const minutesIdx = idx('estimatedMinutesWatched');

      for (const row of dailyReport.rows) {
        if (viewsIdx !== -1) totalViews30Days += parseInt(row[viewsIdx]) || 0;
        if (minutesIdx !== -1) watchTimeMinutes += parseInt(row[minutesIdx]) || 0;
        if (likesIdx !== -1) { const v = parseInt(row[likesIdx]) || 0; totalLikes += v; totalEngagement += v; }
        if (commentsIdx !== -1) { const v = parseInt(row[commentsIdx]) || 0; totalComments += v; totalEngagement += v; }
        if (sharesIdx !== -1) { const v = parseInt(row[sharesIdx]) || 0; totalShares += v; totalEngagement += v; }
      }
    }

    // 6. Process demographics mapping
    let topCountries = [];
    if (countryReport && Array.isArray(countryReport.rows) && Array.isArray(countryReport.columnHeaders)) {
      const countryIdx = countryReport.columnHeaders.findIndex(h => h.name === 'country');
      const viewsIdx = countryReport.columnHeaders.findIndex(h => h.name === 'views');
      if (countryIdx !== -1 && viewsIdx !== -1) {
        topCountries = countryReport.rows.map(row => ({
          name: row[countryIdx],
          count: parseInt(row[viewsIdx]) || 0
        })).sort((a, b) => b.count - a.count);
      }
    }

    let ageAndGender = [];
    if (ageGenderReport && Array.isArray(ageGenderReport.rows) && Array.isArray(ageGenderReport.columnHeaders)) {
      const ageIdx = ageGenderReport.columnHeaders.findIndex(h => h.name === 'ageGroup');
      const genderIdx = ageGenderReport.columnHeaders.findIndex(h => h.name === 'gender');
      const percentIdx = ageGenderReport.columnHeaders.findIndex(h => h.name === 'viewerPercentage');
      if (ageIdx !== -1 && genderIdx !== -1 && percentIdx !== -1) {
        ageAndGender = ageGenderReport.rows.map(row => {
          const percentage = parseFloat(row[percentIdx]) || 0;
          const ageGroup = row[ageIdx];
          const gender = row[genderIdx];
          return {
            group: `${ageGroup}_${gender}`,
            ageGroup,
            gender,
            // REAL measured share of the audience, straight from YouTube.
            percentage,
            // View-weighted estimate, retained for backward compatibility only.
            count: Math.round((percentage / 100) * totalViews30Days) || 0
          };
        });
      }
    }

    // 7. Save to database
    const rawPlatformData = {
      channelDetails: channel,
      recentVideos,
      playlists,
      analyticsReports: {
        daily: dailyReport,
        country: countryReport,
        device: deviceReport,
        ageGender: ageGenderReport
      },
      // Provenance: lets the UI label every chart with the truth.
      range: window,
      reportErrors: Object.keys(reportErrors).length ? reportErrors : null,
      totals: { totalViews30Days, watchTimeMinutes, totalLikes, totalComments, totalShares }
    };

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const snapshot = await AnalyticsSnapshot.findOneAndUpdate(
      {
        incubationCenterId: userId,
        platform: 'youtube',
        snapshotDate: { $gte: startOfDay, $lte: endOfDay }
      },
      {
        incubationCenterId: userId,
        platform: 'youtube',
        snapshotDate: new Date(),
        metrics: {
          followers: parseInt(stats.subscriberCount) || 0,
          // YouTube's Reporting API has no impression/reach concept.
          // Storing view counts here was a duplicate masquerading as a distinct metric.
          impressions: 0,
          reach: 0,
          profileViews: 0,
          totalEngagement,
          totalViews: totalViews30Days,
          watchTimeMinutes,
          videoCount: parseInt(stats.videoCount) || 0
        },
        demographics: {
          topCountries,
          topCities: [],
          ageAndGender
        },
        rawPlatformData
      },
      { upsert: true, new: true }
    );

    console.log(
      `✅ [youtube.analytics] YouTube data saved for user ${userId} ` +
      `[${window.startDate} → ${window.endDate}] ` +
      `views=${totalViews30Days} engagement=${totalEngagement} ` +
      `failedReports=${Object.keys(reportErrors).length ? Object.keys(reportErrors).join(',') : 'none'}`
    );
    return snapshot;
  } else {
    // Surface the real cause (missing `yt-analytics.readonly` scope, revoked
    // token, no reportable activity) rather than a generic message, so the
    // controller can fall back to the last good snapshot with an accurate log.
    throw new Error(
      lastError?.message ||
      'Failed to fetch valid YouTube data or no YouTube account connected.'
    );
  }
};
