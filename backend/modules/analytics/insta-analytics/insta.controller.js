import axios from 'axios';
import instaConfig from './insta.config.js';

export const getInstagramAnalytics = async (req, res, next) => {
  try {
    const account = req.user.getSocialAccount('instagram');
    if (!account) {
      return res.status(404).json({ error: 'Instagram account not connected' });
    }

    let accessToken = account.accessToken;
    
    if (account.isExpired()) {
      return res.status(401).json({ error: 'Instagram session expired, please reconnect.' });
    }

    // To get IG insights, we need the user's FB Page, then its linked IG account.
    // 1. Get FB Pages
    const pagesRes = await axios.get('https://graph.facebook.com/me/accounts', {
      params: { access_token: accessToken }
    });
    
    const page = pagesRes.data.data?.[0]; 
    if (!page) {
      return res.status(404).json({ error: 'No Facebook Page found' });
    }

    // 2. Get the Instagram Business Account linked to the page
    const igRes = await axios.get(`https://graph.facebook.com/v18.0/${page.id}`, {
      params: { fields: 'instagram_business_account', access_token: accessToken }
    });
    
    const igAccount = igRes.data.instagram_business_account;
    if (!igAccount) {
      return res.status(404).json({ error: 'No Instagram Business account linked to Facebook Page' });
    }

    // 3. Get Instagram Insights (impressions, reach, profile_views, follower_count is from standard field)
    let reachData = [];
    let totalImpressions = 0;
    let followers = 0;

    try {
      // Get followers directly from the IG account field
      const profileRes = await axios.get(`https://graph.facebook.com/v18.0/${igAccount.id}`, {
        params: { fields: 'followers_count', access_token: accessToken }
      });
      followers = profileRes.data.followers_count || 0;

      // Get Insights
      const insightsRes = await axios.get(`https://graph.facebook.com/v18.0/${igAccount.id}/insights`, {
        params: {
          metric: 'impressions,reach',
          period: 'day',
          since: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60),
          until: Math.floor(Date.now() / 1000),
          access_token: accessToken
        }
      });
      
      const insightsData = insightsRes.data.data;
      const reachMetric = insightsData.find(d => d.name === 'reach')?.values || [];
      const impressionsMetric = insightsData.find(d => d.name === 'impressions')?.values || [];

      // Format reach for charts
      reachData = reachMetric.map(item => {
        const dateObj = new Date(item.end_time);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        return { day: dayName, reach: item.value };
      });
      
      totalImpressions = impressionsMetric.reduce((sum, item) => sum + item.value, 0);

    } catch (err) {
      console.warn('Could not fetch Instagram Insights, returning basic stats.', err.response?.data || err.message);
    }

    // Prepare unified response
    res.json({
      metrics: {
        followers: followers,
        reach: reachData.reduce((sum, item) => sum + item.reach, 0),
        impressions: totalImpressions
      },
      charts: {
        reachData: reachData.length ? reachData : null
      }
    });

  } catch (err) {
    console.error('Instagram Analytics Error:', err.response?.data || err.message);
    next(err);
  }
};
