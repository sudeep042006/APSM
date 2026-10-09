// modules/automation/automation.routes.js

import express from 'express';
import { createAutomationJob, getAutomationJobs, enhancePost } from './automation.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import multer from 'multer';

// Use memory storage for Cloudinary streaming
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Create a new automated/scheduled post (with optional media file)
router.post('/jobs', requireAuth, upload.single('mediaFile'), createAutomationJob);

// Fetch automation history
router.get('/jobs', requireAuth, getAutomationJobs);

// Enhance post content using AI
router.post('/enhance', requireAuth, enhancePost);

export default router;

