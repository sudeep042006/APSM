// ─────────────────────────────────────────────────────────────────────────────
// config/platforms.js
//
// Single source of truth for all OAuth platform configurations.
// Configurations are now modularized under backend/modules/analytics/
// ─────────────────────────────────────────────────────────────────────────────

import ytConfig from '../modules/analytics/yt-analytics/yt.config.js';
import fbConfig from '../modules/analytics/fb-analytics/fb.config.js';
import instaConfig from '../modules/analytics/insta-analytics/insta.config.js';
import linkedinConfig from '../modules/analytics/linkedin-analytics/linkedin.config.js';

const platforms = {
  youtube: ytConfig,
  facebook: fbConfig,
  instagram: instaConfig,
  linkedin: linkedinConfig,
};

export default platforms;
