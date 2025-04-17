import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkReviewEligibility } from "../middleware/auth.middleware.js";
import {
  createReview,
  getEventReviews,
  deleteReview,
} from "../controllers/review.controller.js";

const router = express.Router();

// Create a review for an event
router.post("/:eventId", protect, checkReviewEligibility, createReview);

// Get all reviews for an event
router.get("/:eventId", getEventReviews);

// Delete a review
router.delete("/:reviewId", protect, deleteReview);

export default router;
