import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { ingestPostPerformance, optimiseDraft, recordOutcome, recordFeedback } from './recommendation.controller.js';
import { recommendationRateLimit } from './recommendation.rateLimit.js';

const router = express.Router();
// Support both spellings for API consumers; the frontend uses /optimise.
router.post(['/optimise', '/optimize'], requireAuth, recommendationRateLimit({ limit: 20, windowMs: 60_000 }), optimiseDraft);
router.post('/posts', requireAuth, recommendationRateLimit({ limit: 120, windowMs: 60_000 }), ingestPostPerformance);
router.post('/runs/:runId/outcome', requireAuth, recommendationRateLimit({ limit: 30, windowMs: 60_000 }), recordOutcome);
router.post('/runs/:runId/feedback', requireAuth, recommendationRateLimit({ limit: 30, windowMs: 60_000 }), recordFeedback);
export default router;
