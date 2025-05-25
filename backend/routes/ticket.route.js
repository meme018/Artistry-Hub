import express from "express";
import {
  requestTicket,
  getUserTickets,
  getPendingTickets,
  updateTicketStatus,
  getTicketStats, // Add the new controller function
  createTicketAfterPayment,
  cancelTicket,
  deletePastTicket,
  getAllTickets,
} from "../controllers/ticket.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);
// Route for creating ticket after payment
router.post("/create-after-payment", createTicketAfterPayment);

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

// Cancel/delete a ticket
router.delete("/:ticketId/cancel", cancelTicket);

// Delete a ticket for past events from history
router.delete("/:ticketId/delete-past", deletePastTicket);

router.get("/alltickets", protect, getAllTickets);
export default router;
