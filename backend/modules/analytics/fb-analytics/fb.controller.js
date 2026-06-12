import axios from 'axios';
import fbConfig from './fb.config.js';

export const getFacebookAnalytics = async (req, res, next) => {
  try {
    const account = req.user.getSocialAccount('facebook');
    if (!account) {
      return res.status(404).json({ error: 'Facebook account not connected' });
    }

    let accessToken = account.accessToken;
    
    if (account.isExpired()) {
      return res.status(401).json({ error: 'Facebook session expired, please reconnect.' });
    }

    // 1. Get Facebook Pages this user manages
    const pagesRes = await axios.get('https://graph.facebook.com/me/accounts', {
      params: { fields: 'id,name,access_token,fan_count', access_token: accessToken }
    });
    
    const page = pagesRes.data.data?.[0]; // Use the first page for the dashboard
    if (!page) {
      return res.status(404).json({ error: 'No Facebook Page found for this account' });
    }

    const pageAccessToken = page.access_token;

    // 2. Fetch page insights (reach/impressions, engagement)
    let reachData = [];
    let totalEngagements = 0;
    
    try {
      const insightsRes = await axios.get(`https://graph.facebook.com/v18.0/${page.id}/insights`, {
        params: {
          metric: 'page_impressions,page_post_engagements',
          period: 'day',
          date_preset: 'last_7d',
          access_token: pageAccessToken
        }
      });
      
      const insightsData = insightsRes.data.data;
      const impressions = insightsData.find(d => d.name === 'page_impressions')?.values || [];
      const engagements = insightsData.find(d => d.name === 'page_post_engagements')?.values || [];

      // Format impressions for charts
      reachData = impressions.map(item => {
        const dateObj = new Date(item.end_time);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        return { day: dayName, reach: item.value };
      });
      
      // Calculate total engagement over the 7 days
      totalEngagements = engagements.reduce((sum, item) => sum + item.value, 0);

    } catch (err) {
      console.warn('Could not fetch Facebook Page Insights, returning basic page stats.', err.response?.data || err.message);
    }

    // Prepare unified response
    res.json({
      metrics: {
        pageLikes: page.fan_count || 0,
        reach: reachData.reduce((sum, item) => sum + item.reach, 0),
        engagement: totalEngagements
      },
      charts: {
        reachData: reachData.length ? reachData : null
      }
    });

  } catch (err) {
    console.error('Facebook Analytics Error:', err.response?.data || err.message);
    next(err);
  }
};
