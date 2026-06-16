import axios from 'axios';
import { getValidToken } from '../../utils/tokenManager.js';
import { AnalyticsSnapshot } from './analytics.model.js';

export const fetchAndSaveYouTubeAnalytics = async (userId) => {
  try {
    // 1. Get token
    const accessToken = await getValidToken(userId, 'youtube');

    // 2. Call Google API (Example: fetching channel stats)
    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { part: 'statistics', mine: true }
    });

    const stats = response.data.items[0].statistics;

    // 3. Save to Unified Model
    const snapshot = await AnalyticsSnapshot.create({
      incubationCenterId: userId,
      platform: 'youtube',
      metrics: {
        followers: parseInt(stats.subscriberCount) || 0,
        totalPosts: parseInt(stats.videoCount) || 0
      },
      rawPlatformData: {
        totalViews: parseInt(stats.viewCount) || 0
      }
    });

    console.log(`✅ YouTube data saved for user ${userId}`);
    return snapshot;
  } catch (error) {
    console.error(`❌ YouTube fetch failed for user ${userId}:`, error.message);
  }
};