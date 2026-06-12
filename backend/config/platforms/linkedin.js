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
    'r_liteprofile',
    'r_emailaddress',
    'w_member_social',
  ],

  authParams: {},

  async getProfile(accessToken) {
    const res = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      platformUserId:   res.data.id,
      platformUsername: `${res.data.localizedFirstName} ${res.data.localizedLastName}`,
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
    const res = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      client_id:     process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    });
    return {
      accessToken: res.data.access_token,
      expiresAt:   res.data.expires_in ? new Date(Date.now() + res.data.expires_in * 1000) : null,
    };
  },
};
