import Review from "../models/review.model.js";
import Event from "../models/event.model.js";
import Ticket from "../models/ticket.model.js";
import asyncHandler from "express-async-handler";

// @desc    Create a review
// @route   POST /api/reviews/:eventId
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const eventId = req.params.eventId;
  const userId = req.user.id;

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Check if event has ended
  if (new Date(event.date) > new Date()) {
    res.status(400);
    throw new Error("Cannot review an event that has not ended yet");
  }

  // Check if user has a valid ticket
  const ticket = await Ticket.findOne({ user: userId, event: eventId });
  if (!ticket) {
    res.status(403);
    throw new Error("You must have a ticket to review this event");
  }

  // Check if user has already reviewed this event
  const existingReview = await Review.findOne({ user: userId, event: eventId });
  if (existingReview) {
    res.status(400);
    throw new Error("You have already reviewed this event");
  }

  // Create review
  const review = await Review.create({
    user: userId,
    event: eventId,
    rating,
    comment,
  });

  // Update event with new average rating
  const reviews = await Review.find({ event: eventId });
  const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Event.findByIdAndUpdate(eventId, {
    averageRating,
    numberOfReviews: reviews.length,
  });

  res.status(201).json(review);
});

// @desc    Get all reviews for an event
// @route   GET /api/reviews/:eventId
// @access  Public
export const getEventReviews = asyncHandler(async (req, res) => {
  const eventId = req.params.eventId;

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  const reviews = await Review.find({ event: eventId })
    .populate("user", "name avatar")
    .sort("-createdAt");

  res.json(reviews);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private (admin or review owner)
export const deleteReview = asyncHandler(async (req, res) => {
  const reviewId = req.params.reviewId;
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  const review = await Review.findById(reviewId);

  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }

  // Check if user is review owner or admin
  if (review.user.toString() !== userId && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to delete this review");
  }

  await Review.findByIdAndDelete(reviewId);

  // Update event with new average rating
  const eventId = review.event;
  const reviews = await Review.find({ event: eventId });

  if (reviews.length === 0) {
    await Event.findByIdAndUpdate(eventId, {
      averageRating: 0,
      numberOfReviews: 0,
    });
  } else {
    const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Event.findByIdAndUpdate(eventId, {
      averageRating,
      numberOfReviews: reviews.length,
    });
  }

  res.json({ message: "Review removed" });
});
