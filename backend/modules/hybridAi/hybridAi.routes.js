import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { recommendationRateLimit } from '../recommendations/recommendation.rateLimit.js';
import { predictAndSuggest } from './hybridAi.controller.js';

const router = express.Router();
router.post('/predict-and-suggest', requireAuth, recommendationRateLimit({ limit: 12, windowMs: 60_000 }), predictAndSuggest);
export default router;
