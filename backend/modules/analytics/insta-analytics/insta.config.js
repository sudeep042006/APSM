import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

export default {
  name:         'Instagram',
  clientId:     process.env.FACEBOOK_APP_ID,     // same Meta app
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  redirectUri:  `${BASE_URL}/auth/instagram/callback`,

  authUrl:  'https://www.facebook.com/v18.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',

  scopes: [
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement',
  ],

  authParams: {},

  // Instagram Graph API: FB Page → Instagram Business Account → username
  async getProfile(accessToken) {
    // Step 1 — get Facebook Pages this user manages
    const pagesRes = await axios.get(
      'https://graph.facebook.com/me/accounts',
      { params: { access_token: accessToken } }
    );
    const page = pagesRes.data.data?.[0];
    if (!page) {
      throw new Error(
        'No Facebook Page found. Instagram requires a Business or Creator account linked to a Facebook Page.'
      );
    }

    // Step 2 — get the Instagram Business Account linked to that page
    const igRes = await axios.get(
      `https://graph.facebook.com/v18.0/${page.id}`,
      { params: { fields: 'instagram_business_account', access_token: accessToken } }
    );
    const igAccount = igRes.data.instagram_business_account;
    if (!igAccount) {
      throw new Error(
        'No Instagram Business account linked to your Facebook Page. Please link one in Facebook Settings.'
      );
    }

    // Step 3 — get the Instagram username
    const profileRes = await axios.get(
      `https://graph.facebook.com/v18.0/${igAccount.id}`,
      { params: { fields: 'id,username', access_token: accessToken } }
    );
    return {
      platformUserId:   profileRes.data.id,
      platformUsername: profileRes.data.username,
    };
  },

  // Same as Facebook — short-lived → long-lived exchange
  async normalizeTokens(tokenData) {
    const res = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          grant_type:        'fb_exchange_token',
          client_id:         process.env.FACEBOOK_APP_ID,
          client_secret:     process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: tokenData.access_token,
        },
      }
    );
    return {
      accessToken:  res.data.access_token,
      refreshToken: null,
      expiresAt:    new Date(Date.now() + (res.data.expires_in ?? 5184000) * 1000),
      scopes:       [],
    };
  },

  async refreshAccessToken() {
    throw new Error('Instagram tokens cannot be refreshed. User must reconnect.');
  },
};
