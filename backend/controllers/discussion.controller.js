import Discussion from "../models/discussion.model.js";
import asyncHandler from "express-async-handler";

// @desc    Create new discussion message
// @route   POST /api/discussions/:eventId
// @access  Private
export const createDiscussion = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const { eventId } = req.params;

  // Create discussion
  const discussion = await Discussion.create({
    event: eventId,
    user: req.user._id, // From auth middleware
    message,
  });

  // Populate user information to return in response
  const populatedDiscussion = await Discussion.findById(discussion._id)
    .populate("user", "name email")
    .populate("event", "title");

  res.status(201).json({
    success: true,
    data: populatedDiscussion,
  });
});

// @desc    Get discussions for an event
// @route   GET /api/discussions/:eventId
// @access  Public
export const getEventDiscussions = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const discussions = await Discussion.find({ event: eventId })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: discussions.length,
    data: discussions,
  });
});
