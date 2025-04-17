import mongoose from "mongoose";
import Event from "../models/event.model.js";
import User from "../models/user.model.js"; // Make sure to import User model

// Create an event
export const createEvents = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

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

    // Handle Location parsing if it's sent as a string (from FormData)
    let parsedLocation;
    try {
      parsedLocation =
        typeof Location === "string" ? JSON.parse(Location) : Location;
    } catch (err) {
      parsedLocation = {
        Landmark: req.body["Location.Landmark"] || "",
        City: req.body["Location.City"] || "",
        Country: req.body["Location.Country"] || "",
      };
    }

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
      Creator: req.user.id,
      EventTitle,
      Description,
      Category,
      SubCategory,
      Type,
      Link,
      Location: parsedLocation,
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
      message: error.message || "Internal Server Error",
    });
  }
};

// Get all events with optional filtering
export const getEvents = async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { category, subcategory, type, search } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.Category = category;
    if (subcategory) filter.SubCategory = subcategory;
    if (type) filter.Type = type;

    // Add text search if provided
    if (search) {
      filter.$or = [
        { EventTitle: { $regex: search, $options: "i" } },
        { Description: { $regex: search, $options: "i" } },
      ];
    }

    // Populate creator information when getting all events
    const events = await Event.find(filter).populate(
      "Creator",
      "name email bio"
    );
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching the events.",
    });
  }
};

// Get a single event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    // Populate creator information
    const event = await Event.findById(id).populate(
      "Creator",
      "name email bio profileImage"
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching the event.",
    });
  }
};

// Update an event
export const updateEvents = async (req, res) => {
  try {
    console.log("UPDATE FUNCTION CALLED", req.params.id);
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    // Get existing event to check if it exists and verify creator
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if the user is the creator of the event
    if (existingEvent.Creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this event",
      });
    }

    // Create update data object
    const updateData = {};

    // Extract basic fields from request body
    const fieldsToCopy = [
      "EventTitle",
      "Description",
      "Category",
      "SubCategory",
      "Type",
      "Link",
      "Date",
      "StartTime",
      "EndTime",
      "TicketQuantity",
      "StartDate",
      "EndDate",
    ];

    fieldsToCopy.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle Location field - try parsing if it's a string
    if (req.body.Location) {
      try {
        updateData.Location = JSON.parse(req.body.Location);
      } catch (err) {
        // If JSON parsing fails, build from individual fields or use existing
        updateData.Location = {
          Landmark:
            req.body["Location.Landmark"] ||
            existingEvent.Location?.Landmark ||
            "",
          City: req.body["Location.City"] || existingEvent.Location?.City || "",
          Country:
            req.body["Location.Country"] ||
            existingEvent.Location?.Country ||
            "",
        };
      }
    }

    // Handle image upload if provided
    if (req.file) {
      updateData.Image = req.file.path;
    }

    console.log("Final update data:", updateData);

    // Update the event and populate creator information in the response
    const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run mongoose validators
    }).populate("Creator", "name email bio profileImage");

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found after update attempt",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
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
  try {
    console.log("DELETE FUNCTION CALLED", req.params.id);

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Invalid event ID format",
      });
    }

    // First find the event to verify creator
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if the user is the creator of the event
    if (event.Creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this event",
      });
    }

    const deletedEvent = await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while deleting the event.",
    });
  }
};

// Get artist's events
export const getArtistEvents = async (req, res) => {
  try {
    // Get artist ID from auth middleware
    const artistId = req.user.id;

    if (!artistId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Find events and populate creator info
    const events = await Event.find({ Creator: artistId }).populate(
      "Creator",
      "name email bio profileImage"
    );

    res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching artist events:", error);
    res.status(500).json({
      success: false,
      message:
        error.message || "An error occurred while fetching artist events.",
    });
  }
};

// New endpoint to get organizer info with event count
export const getOrganizerInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Get user info
    const user = await User.findById(userId, "name email bio profileImage");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Count number of events created by this user
    const eventCount = await Event.countDocuments({ Creator: userId });

    // Prepare response data
    const organizerData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio || "This artist hasn't added a bio yet.",
      profileImage: user.profileImage,
      eventsCreated: eventCount,
    };

    res.status(200).json({
      success: true,
      data: organizerData,
    });
  } catch (error) {
    console.error("Error fetching organizer info:", error);
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while fetching organizer information.",
    });
  }
};
