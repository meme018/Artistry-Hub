import express from "express";
import {
  createEvents,
  getEvents,
  getEventById,
  updateEvents,
  deleteEvents,
  getArtistEvents,
  getOrganizerInfo,
  checkOngoingEvents,
} from "../controllers/event.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Create a new event - with file upload
router.post("/create", protect, upload.single("Image"), createEvents);

// Get all events
router.get("/", getEvents);

// Get events by artist - MOVED UP
router.get("/artist", protect, getArtistEvents);

// Check if artist has ongoing events - new endpoint
router.get("/artist/ongoing", protect, checkOngoingEvents);

// New route to get organizer info with event count
router.get("/organizer/:userId", getOrganizerInfo);

// Get a single event - MOVED DOWN
router.get("/:id", getEventById);

// Update an event - with file upload support
router.put("/:id", protect, upload.single("Image"), updateEvents);

// Delete an event
router.delete("/:id", protect, deleteEvents);

export default router;
