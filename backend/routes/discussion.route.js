import express from "express";
const router = express.Router();
import {
  createDiscussion,
  getEventDiscussions,
} from "../controllers/discussion.controller.js";
import { protect } from "../middleware/auth.middleware.js";

// POST /api/discussions/:eventId - Create discussion
router.post("/:eventId", protect, createDiscussion);

// GET /api/discussions/:eventId - Get all discussions for an event
router.get("/:eventId", getEventDiscussions);

export default router;
