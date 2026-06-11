// ─────────────────────────────────────────────────────────────────────────────
// config/platforms.js
//
// Single source of truth for all OAuth platform configurations.
// To add a new platform — add one entry here. Nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

const platforms = {

  // ── YouTube (Google OAuth2) ───────────────────────────────────────────────
  youtube: {
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
  },

  // ── Facebook ──────────────────────────────────────────────────────────────
  facebook: {
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
  },

  // ── Instagram ─────────────────────────────────────────────────────────────
  // Uses the same Meta developer app as Facebook.
  // IMPORTANT: only works with Instagram Business or Creator accounts
  // that are linked to a Facebook Page. Personal accounts will fail.
  instagram: {
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
  },
};

module.exports = platforms;
