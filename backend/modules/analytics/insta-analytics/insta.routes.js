import express from 'express';
import { getInstagramAnalytics } from './insta.controller.js';
import { requireAuth } from '../../../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getInstagramAnalytics);

export default router;
