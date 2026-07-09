import axios from 'axios';

export default {
  name:         'LinkedIn',
  get clientId() { return process.env.LINKEDIN_CLIENT_ID || ''; },
  get clientSecret() { return process.env.LINKEDIN_CLIENT_SECRET || ''; },
  get redirectUri() {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
    return `${BASE_URL}/auth/linkedin/callback`;
  },

  authUrl:  'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',

  scopes: [
    'openid',
    'profile',
    'email',
    'w_member_social',
  ],

  authParams: {},

  async getProfile(accessToken) {
    const res = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      platformUserId:   res.data.sub, // 'sub' contains the person's unique ID
      platformUsername: res.data.name,
    };
  },

  async normalizeTokens(tokenData) {
    return {
      accessToken:  tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt:    tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
      scopes:       [],
    };
  },

  async refreshAccessToken(refreshToken) {
    const params = new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      client_id:     process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    });

    const res = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    return {
      accessToken: res.data.access_token,
      expiresAt:   res.data.expires_in ? new Date(Date.now() + res.data.expires_in * 1000) : null,
    };
  },
};
