import axios from 'axios';
import ytConfig from './yt.config.js';

export const getYouTubeAnalytics = async (req, res, next) => {
  try {
    const account = req.user.getSocialAccount('youtube');
    if (!account) {
      return res.status(404).json({ error: 'YouTube account not connected' });
    }

    let accessToken = account.accessToken;
    
    // Auto-refresh logic could go here if expired, but we'll try with the current token
    if (account.isExpired()) {
      try {
        const newTokens = await ytConfig.refreshAccessToken(account.refreshToken);
        account.accessToken = newTokens.accessToken;
        account.expiresAt = newTokens.expiresAt;
        await req.user.save();
        accessToken = newTokens.accessToken;
      } catch (err) {
        return res.status(401).json({ error: 'YouTube session expired, please reconnect.' });
      }
    }

    // 1. Get Channel Stats (Subscribers, Views, Videos)
    const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: { part: 'statistics,snippet', mine: true },
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const channelInfo = channelRes.data.items?.[0];
    if (!channelInfo) {
      return res.status(404).json({ error: 'YouTube channel not found' });
    }

    const stats = channelInfo.statistics;
    
    // 2. Fetch basic daily views for the past 7 days using YouTube Analytics API
    // End date is today, start date is 7 days ago
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let viewsData = [];
    try {
      const analyticsRes = await axios.get('https://youtubeanalytics.googleapis.com/v2/reports', {
        params: {
          ids: 'channel==MINE',
          startDate: startDate,
          endDate: endDate,
          metrics: 'views',
          dimensions: 'day',
          sort: 'day'
        },
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Map API response to chart format
      if (analyticsRes.data && analyticsRes.data.rows) {
        viewsData = analyticsRes.data.rows.map(row => {
          const dateStr = row[0]; // e.g., "2023-10-01"
          const dateObj = new Date(dateStr);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          return { day: dayName, views: row[1] };
        });
      }
    } catch (err) {
      console.warn('Could not fetch YouTube Analytics report, returning basic channel stats. Ensure yt-analytics.readonly scope is granted.', err.message);
    }

    // Prepare unified response
    res.json({
      metrics: {
        subscribers: stats.subscriberCount || 0,
        totalViews: stats.viewCount || 0,
        videos: stats.videoCount || 0,
        // Mocking watch time as it requires specific analytics queries
        watchTime: 'N/A' 
      },
      charts: {
        viewsData: viewsData.length ? viewsData : null
      }
    });

  } catch (err) {
    console.error('YouTube Analytics Error:', err.response?.data || err.message);
    next(err);
  }
};
