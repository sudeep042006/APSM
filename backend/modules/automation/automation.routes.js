// modules/automation/automation.routes.js

import express from 'express';
import automationController from './automation.controller.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// Create a new automated/scheduled post
router.post('/jobs', requireAuth, automationController.createAutomationJob);

export default router;
