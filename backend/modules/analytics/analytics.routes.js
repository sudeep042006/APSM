// modules/analytics/analytics.routes.js

import express from 'express';
import analyticsController from './analytics.controller.js';
import { requireAuth } from '../../middleware/auth.js';

// Modular analytics routes
import ytRoutes from './yt-analytics/yt.routes.js';
import fbRoutes from './fb-analytics/fb.routes.js';
import instaRoutes from './insta-analytics/insta.routes.js';
import linkedinRoutes from './linkedin-analytics/linkedin.routes.js';

const router = express.Router();

// Get legacy analytics summary
router.get('/summary', requireAuth, analyticsController.getAnalyticsSummary);
router.get('/youtube', requireAuth, analyticsController.getAnalyticsSummary);
router.get('/meta', requireAuth, analyticsController.getAnalyticsSummary);
router.get('/linkedin', requireAuth, analyticsController.getAnalyticsSummary);

// Specific platform endpoints
router.use('/youtube', ytRoutes);
router.use('/facebook', fbRoutes);
router.use('/instagram', instaRoutes);
router.use('/linkedin', linkedinRoutes);

export default router;
