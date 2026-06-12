import axios from 'axios';
import linkedinConfig from './linkedin.config.js';

export const getLinkedInAnalytics = async (req, res, next) => {
  try {
    const account = req.user.getSocialAccount('linkedin');
    if (!account) {
      return res.status(404).json({ error: 'LinkedIn account not connected' });
    }

    let accessToken = account.accessToken;
    
    if (account.isExpired()) {
      return res.status(401).json({ error: 'LinkedIn session expired, please reconnect.' });
    }

    // LinkedIn organizational page analytics require the 'r_organization_social' scope and Page access.
    // Since we only requested 'r_liteprofile' in config, we can only get basic user info for now.
    // For a fully-featured dashboard, you would query `https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity`
    // but that requires LinkedIn marketing developer approval.
    
    // We will provide a fallback response so the dashboard functions
    res.json({
      metrics: {
        followers: 0,
        impressions: 0,
        engagementRate: 0,
        growth: 0
      },
      charts: {
        impressionsData: null,
        engagementData: null
      },
      notice: 'Detailed LinkedIn analytics requires additional LinkedIn Developer portal approvals for Marketing Developer Platform access.'
    });

  } catch (err) {
    console.error('LinkedIn Analytics Error:', err.response?.data || err.message);
    next(err);
  }
};
