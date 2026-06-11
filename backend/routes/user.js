// routes/user.js
//
// User-facing routes (will grow in Phase 4 with analytics)
//   GET /user/profile
//   GET /user/connected-accounts

const express      = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /user/profile
router.get('/profile', requireAuth, (req, res) => {
  const user = req.user;
  res.json({
    id:        user._id,
    name:      user.name,
    email:     user.email,
    createdAt: user.createdAt,
    connectedAccounts: user.socialAccounts
      .filter(a => a.isActive)
      .map(a => ({
        platform:         a.platform,
        platformUsername: a.platformUsername,
        connectedAt:      a.connectedAt,
        expiresAt:        a.expiresAt,
        isExpired:        a.isExpired(),
      })),
  });
});

// GET /user/connected-accounts
router.get('/connected-accounts', requireAuth, (req, res) => {
  const accounts = req.user.socialAccounts
    .filter(a => a.isActive)
    .map(a => ({
      platform:         a.platform,
      platformUserId:   a.platformUserId,
      platformUsername: a.platformUsername,
      connectedAt:      a.connectedAt,
      expiresAt:        a.expiresAt,
      isExpired:        a.isExpired(),
      scopes:           a.scopes,
    }));
  res.json({ accounts });
});

module.exports = router;
