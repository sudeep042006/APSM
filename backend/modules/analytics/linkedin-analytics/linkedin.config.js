import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

export default {
  name:         'LinkedIn',
  clientId:     process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  redirectUri:  `${BASE_URL}/auth/linkedin/callback`,

  authUrl:  'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',

  scopes: [
    'r_liteprofile',
    'r_emailaddress',
    'w_member_social'
  ],

  authParams: {},

  async getProfile(accessToken) {
    const res = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    // LinkedIn returns localizedFirstName and localizedLastName
    const firstName = res.data.localizedFirstName || '';
    const lastName = res.data.localizedLastName || '';
    
    return {
      platformUserId:   res.data.id,
      platformUsername: `${firstName} ${lastName}`.trim(),
    };
  },

  async normalizeTokens(tokenData) {
    return {
      accessToken:  tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt:    new Date(Date.now() + (tokenData.expires_in * 1000)),
      scopes:       [],
    };
  },

  async refreshAccessToken() {
    throw new Error('LinkedIn token refresh not implemented. User must reconnect.');
  },
};
