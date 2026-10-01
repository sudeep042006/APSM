import express from "express";
import { requireAuth } from '../../middleware/auth.js';
import multer from 'multer';
import {
  submitPost,
  getCreatorPosts,
  getIncomingPosts,
  approvePost,
  rejectPost,
} from "./creatorPost.controller.js";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// --- Creator Routes ---
// Submit a draft post for review
router.post("/submit", upload.single("mediaFile"), submitPost);
// View all drafted posts (pending/approved/rejected)
router.get("/my-posts", getCreatorPosts);

// --- Admin Routes ---
// View all incoming pending posts
router.get("/incoming", getIncomingPosts);
// Approve a post
router.post("/:postId/approve", approvePost);
// Reject a post
router.post("/:postId/reject", rejectPost);

export default router;

