import express from "express";
import {
  requestTicket,
  getUserTickets,
  getPendingTickets,
  updateTicketStatus,
  getTicketStats, // Add the new controller function
} from "../controllers/ticket.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Request a ticket for an event
router.post("/request/:eventId", requestTicket);

// Get all tickets for the logged-in user
router.get("/", getUserTickets);

// Get pending ticket requests for artist's events
router.get("/pending", getPendingTickets);

// Get ticket statistics for artist's events
router.get("/stats", getTicketStats);

// Approve or reject a ticket
router.put("/:ticketId/status", updateTicketStatus);

export default router;
