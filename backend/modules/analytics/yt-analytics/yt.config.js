import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

export default {
  name:         'YouTube',
  clientId:     process.env.YOUTUBE_CLIENT_ID,
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
  redirectUri:  `${BASE_URL}/auth/youtube/callback`,

  authUrl:  'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',

  scopes: [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
  ],

  // Google-specific: offline = get refresh token, consent = always show screen
  authParams: {
    access_type: 'offline',
    prompt:      'consent',
  },

  // Fetch the user's YouTube channel after tokens are received
  async getProfile(accessToken) {
    const res = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params:  { part: 'snippet', mine: true },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const channel = res.data.items?.[0];
    if (!channel) throw new Error('No YouTube channel found for this Google account.');
    return {
      platformUserId:   channel.id,
      platformUsername: channel.snippet.title,
    };
  },

  // Google gives a proper refresh token — store as-is
  async normalizeTokens(tokenData) {
    return {
      accessToken:  tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresAt:    new Date(Date.now() + tokenData.expires_in * 1000),
      scopes:       tokenData.scope ? tokenData.scope.split(' ') : [],
    };
  },

  // Refresh an expired access token using the stored refresh token
  async refreshAccessToken(refreshToken) {
    const res = await axios.post('https://oauth2.googleapis.com/token', {
      client_id:     process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    });
    return {
      accessToken: res.data.access_token,
      expiresAt:   new Date(Date.now() + res.data.expires_in * 1000),
    };
  },
};
