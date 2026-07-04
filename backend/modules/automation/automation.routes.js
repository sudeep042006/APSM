// modules/automation/automation.routes.js

import express from 'express';
// ── Controller Imports ──────────────────────────────────────────────
import ScheduleCrossPost from './automation.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// ── Routes ──────────────────────────────────────────────────────────
// Create a new automated/scheduled post
router.post('/jobs', requireAuth, ScheduleCrossPost);

export default router;
