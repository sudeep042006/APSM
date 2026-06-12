import express from 'express';
import { getLinkedInAnalytics } from './linkedin.controller.js';
import { requireAuth } from '../../../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getLinkedInAnalytics);

export default router;
