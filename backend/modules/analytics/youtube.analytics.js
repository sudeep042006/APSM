import axios from 'axios';
import { getValidToken } from '../../utils/tokenManager.js';
import { AnalyticsSnapshot } from './analytics.model.js';

export const fetchAndSaveYouTubeAnalytics = async (userId) => {
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

    const channel = channelResponse.data.items?.[0];
    if (!channel) {
      throw new Error('No YouTube channel found for the authenticated account.');
    }

    const stats = channel.statistics || {};
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

    // 3. Fetch recent uploads (videos) details
    let recentVideos = [];
    if (uploadsPlaylistId) {
      try {
        console.log(`[youtube.analytics] Fetching recent uploads from playlist: ${uploadsPlaylistId}`);
        const playlistResponse = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            part: 'snippet,contentDetails',
            playlistId: uploadsPlaylistId,
            maxResults: 5
          }
        });

        const playlistItems = playlistResponse.data.items || [];
        const videoIds = playlistItems.map(item => item.contentDetails?.videoId).filter(Boolean);

        if (videoIds.length > 0) {
          console.log(`[youtube.analytics] Fetching video stats for video IDs: ${videoIds.join(', ')}`);
          const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: {
              part: 'snippet,statistics,contentDetails,status,topicDetails',
              id: videoIds.join(',')
            }
          });
          recentVideos = videosResponse.data.items || [];
        }
      } catch (err) {
        console.error(`⚠️ [youtube.analytics] Failed to fetch recent video details:`, err.message);
      }
    }

    // 4. Fetch YouTube Analytics reports (last 30 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const fetchAnalyticsReport = async (dimensions, metrics, sort = null) => {
      const params = {
        ids: 'channel==MINE',
        startDate,
        endDate,
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

    let dailyReport = null;
    try {
      console.log(`[youtube.analytics] Fetching daily performance report...`);
      dailyReport = await fetchAnalyticsReport(
        'day',
        'views,comments,likes,dislikes,shares,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost',
        'day'
      );
    } catch (err) {
      console.error(`⚠️ [youtube.analytics] Failed to fetch daily analytics report:`, err.message);
    }

    let countryReport = null;
    try {
      console.log(`[youtube.analytics] Fetching country demographics report...`);
      countryReport = await fetchAnalyticsReport(
        'country',
        'views,likes,comments,shares,estimatedMinutesWatched',
        '-views'
      );
    } catch (err) {
      console.error(`⚠️ [youtube.analytics] Failed to fetch country analytics report:`, err.message);
    }

    let deviceReport = null;
    try {
      console.log(`[youtube.analytics] Fetching device type report...`);
      deviceReport = await fetchAnalyticsReport(
        'deviceType',
        'views,estimatedMinutesWatched',
        '-views'
      );
    } catch (err) {
      console.error(`⚠️ [youtube.analytics] Failed to fetch device type report:`, err.message);
    }

    let ageGenderReport = null;
    try {
      console.log(`[youtube.analytics] Fetching age/gender demographics report...`);
      ageGenderReport = await fetchAnalyticsReport(
        'ageGroup,gender',
        'viewerPercentage'
      );
    } catch (err) {
      console.error(`⚠️ [youtube.analytics] Failed to fetch age/gender report:`, err.message);
    }

    // 5. Process demographics mapping for the unified model
    let topCountries = [];
    if (countryReport && countryReport.rows && countryReport.columnHeaders) {
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
    if (ageGenderReport && ageGenderReport.rows && ageGenderReport.columnHeaders) {
      const ageIdx = ageGenderReport.columnHeaders.findIndex(h => h.name === 'ageGroup');
      const genderIdx = ageGenderReport.columnHeaders.findIndex(h => h.name === 'gender');
      const percentIdx = ageGenderReport.columnHeaders.findIndex(h => h.name === 'viewerPercentage');
      if (ageIdx !== -1 && genderIdx !== -1 && percentIdx !== -1) {
        ageAndGender = ageGenderReport.rows.map(row => ({
          group: `${row[ageIdx]}_${row[genderIdx]}`,
          count: parseFloat(row[percentIdx]) || 0
        }));
      }
    }

    // 6. Compute total engagement
    let totalEngagement = 0;
    if (dailyReport && dailyReport.rows && dailyReport.columnHeaders) {
      const likesIdx = dailyReport.columnHeaders.findIndex(h => h.name === 'likes');
      const commentsIdx = dailyReport.columnHeaders.findIndex(h => h.name === 'comments');
      const sharesIdx = dailyReport.columnHeaders.findIndex(h => h.name === 'shares');
      for (const row of dailyReport.rows) {
        if (likesIdx !== -1) totalEngagement += parseInt(row[likesIdx]) || 0;
        if (commentsIdx !== -1) totalEngagement += parseInt(row[commentsIdx]) || 0;
        if (sharesIdx !== -1) totalEngagement += parseInt(row[sharesIdx]) || 0;
      }
    }
    if (totalEngagement === 0 && recentVideos.length > 0) {
      for (const video of recentVideos) {
        const vStats = video.statistics || {};
        totalEngagement += (parseInt(vStats.likeCount) || 0) + (parseInt(vStats.commentCount) || 0);
      }
    }

    // 7. Save to database using Mongoose
    const rawPlatformData = {
      channelDetails: channel,
      recentVideos,
      analyticsReports: {
        daily: dailyReport,
        country: countryReport,
        device: deviceReport,
        ageGender: ageGenderReport
      }
    };

    const snapshot = await AnalyticsSnapshot.create({
      incubationCenterId: userId,
      platform: 'youtube',
      metrics: {
        followers: parseInt(stats.subscriberCount) || 0,
        impressions: parseInt(stats.viewCount) || 0,
        reach: parseInt(stats.viewCount) || 0,
        profileViews: 0,
        totalEngagement
      },
      demographics: {
        topCountries,
        topCities: [],
        ageAndGender
      },
      rawPlatformData
    });

    console.log(`✅ [youtube.analytics] Full YouTube data saved for user ${userId}`);
    return snapshot;
  } catch (error) {
    console.error(`❌ [youtube.analytics] YouTube fetch failed for user ${userId}:`, error.message);
    throw error;
  }
};