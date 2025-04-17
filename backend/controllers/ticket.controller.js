import Ticket from "../models/ticket.model.js";
import Event from "../models/event.model.js";
import asyncHandler from "express-async-handler";

/**
 * RSVP for an event
 * @route POST /api/tickets/rsvp/:eventId
 * @access Private
 */
export const createRSVP = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  // Check if event exists and is approved
  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  if (!event.approved) {
    res.status(400);
    throw new Error("Event is not yet approved by admin");
  }

  // Check if user already has an RSVP for this event
  const existingTicket = await Ticket.findOne({ user: userId, event: eventId });

  if (existingTicket) {
    res.status(400);
    throw new Error("You have already RSVP'd for this event");
  }

  // Create new ticket
  const ticket = await Ticket.create({
    user: userId,
    event: eventId,
    rsvpStatus: true,
    status: "booked",
  });

  if (ticket) {
    res.status(201).json(ticket);
  } else {
    res.status(500);
    throw new Error("Failed to create RSVP");
  }
});

/**
 * Get all tickets for the logged-in user
 * @route GET /api/tickets
 * @access Private
 */
export const getUserTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id })
    .populate("event", "name date location")
    .sort("-createdAt");

  res.status(200).json(tickets);
});
