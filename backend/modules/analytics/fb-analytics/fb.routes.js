import express from 'express';
import { getFacebookAnalytics } from './fb.controller.js';
import { requireAuth } from '../../../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getFacebookAnalytics);

export default router;
