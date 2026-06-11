// routes/auth.js
//
// Handles:
//   POST /auth/register
//   POST /auth/login
//   GET  /auth/me
//   GET  /auth/status
//   GET  /auth/:platform              → initiates OAuth (youtube / facebook / instagram)
//   GET  /auth/:platform/callback     → OAuth callback (same 3 platforms)
//   DELETE /auth/:platform            → disconnect a platform
// ─────────────────────────────────────────────────────────────────────────────

const express        = require('express');
const axios          = require('axios');
const crypto         = require('crypto');
const jwt            = require('jsonwebtoken');
const bcrypt         = require('bcrypt');
const { User }       = require('../models/User');
const { requireAuth} = require('../middleware/auth');
const platforms      = require('../config/platforms');

const router = express.Router();

// ─── In-memory CSRF state store ───────────────────────────────────────────────
// Maps state string → { userId, platform, expiresAt }
// Sufficient for single-server / development. Use Redis for multi-server production.
const pendingStates = new Map();

// Auto-clean expired states every 15 min
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of pendingStates) {
    if (now > v.expiresAt) pendingStates.delete(k);
  }
}, 15 * 60 * 1000);

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER
// POST /auth/register
// Body: { name, email, password }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are all required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user         = await User.create({ name, email, passwordHash });

    res.status(201).json({
      message: 'Account created successfully.',
      token:   generateJWT(user._id),
      user:    publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN
// POST /auth/login
// Body: { email, password }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    res.json({
      message: 'Logged in successfully.',
      token:   generateJWT(user._id),
      user:    publicUser(user),
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ME — get current logged-in user
// GET /auth/me
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// ─────────────────────────────────────────────────────────────────────────────
// STATUS — which platforms are connected?
// GET /auth/status
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status', requireAuth, (req, res) => {
  const status = Object.keys(platforms).map(platform => {
    const account = req.user.getSocialAccount(platform);
    return {
      platform,
      connected:        !!account,
      username:         account?.platformUsername  ?? null,
      expiresAt:        account?.expiresAt         ?? null,
      isExpired:        account?.isExpired()        ?? false,
      connectedAt:      account?.connectedAt        ?? null,
    };
  });
  res.json({ status });
});

// ─────────────────────────────────────────────────────────────────────────────
// INITIATE OAUTH — Step 1 & 2
// GET /auth/:platform
// User must be logged in (JWT required). Redirects to platform consent screen.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:platform', requireAuth, (req, res) => {
  const { platform } = req.params;
  const config = platforms[platform];

  if (!config) {
    return res.status(404).json({ error: `Unknown platform: ${platform}` });
  }

  // Cryptographically random state param — prevents CSRF attacks
  const state = crypto.randomBytes(16).toString('hex');
  pendingStates.set(state, {
    userId:    req.user._id.toString(),
    platform,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id:     config.clientId,
    redirect_uri:  config.redirectUri,
    response_type: 'code',
    scope:         config.scopes.join(' '),
    state,
    ...config.authParams,
  });

  res.redirect(`${config.authUrl}?${params}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// OAUTH CALLBACK — Steps 4, 5, 6, 7
// GET /auth/:platform/callback
// Platform redirects here after user approves or denies.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:platform/callback', async (req, res) => {
  const { platform }         = req.params;
  const { code, state, error } = req.query;
  const frontendUrl          = process.env.FRONTEND_URL;
  const config               = platforms[platform];

  if (!config) {
    return res.redirect(`${frontendUrl}/settings?error=unknown_platform`);
  }

  // User denied permission on the consent screen
  if (error) {
    console.warn(`[OAuth] ${platform} denied:`, error);
    return res.redirect(`${frontendUrl}/settings?error=${platform}_denied`);
  }

  // Validate state (CSRF check)
  const pending = pendingStates.get(state);
  if (!pending || pending.platform !== platform) {
    return res.redirect(`${frontendUrl}/settings?error=invalid_state`);
  }
  if (Date.now() > pending.expiresAt) {
    pendingStates.delete(state);
    return res.redirect(`${frontendUrl}/settings?error=state_expired`);
  }

  const { userId } = pending;
  pendingStates.delete(state); // one-time use only

  try {
    // ── Step 5: Exchange authorization code for tokens ──────────────────────
    const tokenRes = await axios.post(config.tokenUrl, {
      grant_type:    'authorization_code',
      code,
      redirect_uri:  config.redirectUri,
      client_id:     config.clientId,
      client_secret: config.clientSecret,
    });

    // ── Normalize tokens (handles Meta short→long-lived exchange internally) ─
    const normalized = await config.normalizeTokens(tokenRes.data);

    // ── Fetch the user's profile on this platform ────────────────────────────
    const profile = await config.getProfile(normalized.accessToken);

    // ── Step 6: Save to MongoDB ──────────────────────────────────────────────
    const user = await User.findById(userId);
    if (!user) {
      return res.redirect(`${frontendUrl}/settings?error=user_not_found`);
    }

    user.upsertSocialAccount(platform, { ...normalized, ...profile });
    await user.save();

    console.log(`[OAuth] ${platform} connected for user ${userId} (@${profile.platformUsername})`);

    // ── Step 7: Redirect to frontend with success ────────────────────────────
    res.redirect(
      `${frontendUrl}/settings?connected=${platform}&username=${encodeURIComponent(profile.platformUsername)}`
    );

  } catch (err) {
    const detail = err.response?.data
      ? JSON.stringify(err.response.data)
      : err.message;
    console.error(`[OAuth] ${platform} callback error:`, detail);
    res.redirect(`${frontendUrl}/settings?error=${platform}_failed&detail=${encodeURIComponent(err.message)}`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DISCONNECT
// DELETE /auth/:platform
// Soft-deletes the connection (isActive = false, tokens kept for audit)
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:platform', requireAuth, async (req, res, next) => {
  try {
    const { platform } = req.params;

    if (!platforms[platform]) {
      return res.status(404).json({ error: `Unknown platform: ${platform}` });
    }

    const account = req.user.getSocialAccount(platform);
    if (!account) {
      return res.status(404).json({ error: `${platform} is not connected.` });
    }

    account.isActive = false;
    await req.user.save();

    res.json({ message: `${platform} disconnected successfully.` });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function generateJWT(userId) {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return {
    id:    user._id,
    name:  user.name,
    email: user.email,
    connectedPlatforms: (user.socialAccounts || [])
      .filter(a => a.isActive)
      .map(a => ({
        platform: a.platform,
        username: a.platformUsername,
        expiresAt: a.expiresAt,
      })),
  };
}

module.exports = router;
