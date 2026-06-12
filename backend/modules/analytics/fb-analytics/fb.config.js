import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

export default {
  name:         'Facebook',
  clientId:     process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  redirectUri:  `${BASE_URL}/auth/facebook/callback`,

  authUrl:  'https://www.facebook.com/v18.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',

  scopes: [
    'email',
    'public_profile',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
  ],

  authParams: {},

  async getProfile(accessToken) {
    const res = await axios.get('https://graph.facebook.com/me', {
      params: { fields: 'id,name,email', access_token: accessToken },
    });
    return {
      platformUserId:   res.data.id,
      platformUsername: res.data.name,
    };
  },

  // Meta gives a short-lived token (1h) — must exchange for long-lived (60 days)
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
      refreshToken: null, // Meta does not issue refresh tokens
      expiresAt:    new Date(Date.now() + (res.data.expires_in ?? 5184000) * 1000),
      scopes:       [],
    };
  },

  // Meta has no refresh token — user must reconnect after 60 days
  async refreshAccessToken() {
    throw new Error('Facebook tokens cannot be refreshed. User must reconnect.');
  },
};
