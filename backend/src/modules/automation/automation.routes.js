// ── Automation Routes ────────────────────────────────────────────────
// Cross-posting automation endpoints. All require authentication.
// Routes are prefixed with /api/automation in server.js.

import { Router } from "express";
import {
  schedulePost,
  getScheduledPosts,
  cancelPost,
} from "./automation.controller.js";
import authMiddleware from "../../../middleware/auth.middleware.js";

const router = Router();

// ── Protected Automation Endpoints ──────────────────────────────────
router.post("/schedule", authMiddleware, schedulePost);
router.get("/posts", authMiddleware, getScheduledPosts);
router.delete("/posts/:id", authMiddleware, cancelPost);

export default router;
