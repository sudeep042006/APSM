// ── Auth Routes ──────────────────────────────────────────────────────
// Maps HTTP endpoints to their corresponding controller functions.
// Protected routes use the auth middleware guard.

import { Router } from "express";
import { register, login, getProfile } from "./auth.controller.js";
import authMiddleware from "../../../middleware/auth.middleware.js";

const router = Router();

// ── Public Routes ───────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);

// ── Protected Routes ────────────────────────────────────────────────
router.get("/me", authMiddleware, getProfile);

export default router;
