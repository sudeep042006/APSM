import express from 'express';
import { getYouTubeAnalytics } from './yt.controller.js';
import { requireAuth } from '../../../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getYouTubeAnalytics);

export default router;
