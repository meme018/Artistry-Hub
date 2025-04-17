import express from "express";
import {
  createRSVP,
  getUserTickets,
} from "../controllers/ticket.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// RSVP for an event
// Moving the event validation logic to the controller for simplicity
router.post("/rsvp/:eventId", createRSVP);

// Get all tickets for the logged-in user
router.get("/", getUserTickets);

export default router;
