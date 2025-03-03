import mongoose from "mongoose";
import Event from "../models/event.model.js";

// Create an event
export const createEvents = async (req, res) => {
  const { body, file } = req;

  // Check if all required fields are present, including the image
  if (!file) {
    return res
      .status(400)
      .json({ success: false, message: "Event banner is required!" });
  }

  try {
    const eventData = {
      ...body,
      Image: file.path, // Path where the image is saved
      Location: JSON.parse(body.Location), // Parse the Location string
      Date: new Date(body.Date),
      StartDate: new Date(body.StartDate),
      EndDate: new Date(body.EndDate),
    };

    const newEvent = new Event(eventData);
    await newEvent.save();
    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ success: false, message: error.message });
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
