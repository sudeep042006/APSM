// modules/analytics/analytics.routes.js

import express from 'express';
import analyticsController from './analytics.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Get analytics summary across connected platforms
router.get('/summary', requireAuth, analyticsController.getAnalyticsSummary);

export default router;
