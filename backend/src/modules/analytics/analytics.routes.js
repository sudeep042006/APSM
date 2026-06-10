// ── Analytics Routes ─────────────────────────────────────────────────
// All analytics endpoints require authentication.
// Routes are prefixed with /api/analytics in server.js.

import { Router } from "express";
import {
  getYouTubeAnalytics,
  getLinkedInAnalytics,
  getMetaAnalytics,
} from "./analytics.controller.js";
import authMiddleware from "../../../middleware/auth.middleware.js";

const router = Router();

// ── Protected Analytics Endpoints ───────────────────────────────────
router.get("/youtube", authMiddleware, getYouTubeAnalytics);
router.get("/linkedin", authMiddleware, getLinkedInAnalytics);
router.get("/meta", authMiddleware, getMetaAnalytics);

export default router;
