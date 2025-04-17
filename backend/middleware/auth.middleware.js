import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import Ticket from "../models/ticket.model.js";
import asyncHandler from "express-async-handler";

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (without password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found with this token",
        });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

/**
 * Role-based authorization middleware**/
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

/**
 * Admin-only middleware
 * Restricts access to admin users only
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "Admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied: Admin only",
    });
  }
};

// Middleware to check if event exists
export const checkEventExists = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Attach the event to the request object for use in later middleware
  req.event = event;
  next();
});

export const checkReviewEligibility = asyncHandler(async (req, res, next) => {
  const eventId = req.params.eventId;
  const userId = req.user.id;

  // Check if event exists and has ended
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

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

  next();
});
