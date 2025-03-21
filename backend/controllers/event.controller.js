import mongoose from "mongoose";
import Event from "../models/event.model.js";

// Create an event
export const createEvents = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log the request body
    console.log("Uploaded file:", req.file); // Log the uploaded file

    const {
      EventTitle,
      Description,
      Category,
      SubCategory,
      Type,
      Link,
      Location,
      Date,
      StartTime,
      EndTime,
      TicketQuantity,
      StartDate,
      EndDate,
    } = req.body;

    const imagePath = req.file ? req.file.path : null;

    // Validate required fields
    if (!EventTitle || !Description || !Category || !Type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create and save the event to the database
    const newEvent = await Event.create({
      EventTitle,
      Description,
      Category,
      SubCategory,
      Type,
      Link,
      Location,
      Date,
      StartTime,
      EndTime,
      TicketQuantity,
      StartDate,
      EndDate,
      Image: imagePath,
    });

    // Return a success response
    res.status(201).json({
      success: true,
      message: "Event created successfully!",
      data: newEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching the events.",
    });
  }
};

// Get a single event
export const updateEvents = async (req, res) => {
  const { id } = req.params;
  const event = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No event with id: ${id}`);
  }
  try {
    const updatedEvent = await Event.findByIdAndUpdate(id, event, {
      new: true,
    });
    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the event.",
    });
  }
};

// Delete an event
export const deleteEvents = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Event not found!" });
  }

  try {
    const deleteEvent = await Event.findByIdAndDelete(id);
    if (!deleteEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found!" });
    }
    res.status(200).json({ success: true, message: "Event deleted!" });
  } catch (error) {
    console.log("Error deleting event:", error);
    res.status(500).json({ success: false, message: "Server error!" });
  }
};
