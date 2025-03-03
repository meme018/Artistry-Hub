import express from "express";
import {
  getEvents,
  createEvents,
  updateEvents,
  deleteEvents,
} from "../controllers/event.controller.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" }); // Configure storage as needed

router.post("/create", upload.single("Image"), createEvents);

//get all events
router.get("/", getEvents);

//update event
router.put("/:id", updateEvents);

//delete event
router.delete("/:id", deleteEvents);

export default router;
