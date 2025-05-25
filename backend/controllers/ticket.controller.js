import Ticket from "../models/ticket.model.js";
import Event from "../models/event.model.js";
import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import QRCode from "qrcode";

/**
 * Generate QR code for ticket
 * @param {Object} ticket - The ticket object
 * @returns {Promise<string>} - QR code data URL or null on error
 */
const generateQRCode = async (ticket) => {
  try {
    const qrData = JSON.stringify({
      ticketId: ticket._id,
      eventId: ticket.event.EventTitle,
      eventId: ticket.event.eventDate,
      userId: ticket.user,
    });

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    return qrCodeDataUrl;
  } catch (err) {
    console.error("QR code generation error:", err);
    return null;
  }
};

/**
 * Request a ticket for an event
 * @route POST /api/tickets/request/:eventId
 * @access Private
 */
export const requestTicket = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  // Check if event exists
  const event = await Event.findById(eventId);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Check if tickets are still available
  if (event.TicketsAvailable <= 0) {
    res.status(400);
    throw new Error("No tickets available for this event");
  }

  // Check if user already has an active ticket request for this event
  const existingTicket = await Ticket.findOne({
    user: userId,
    event: eventId,
  });

  if (existingTicket) {
    res.status(400);
    throw new Error("You already have a ticket for this event");
  }

  // Create new ticket request
  const ticket = await Ticket.create({
    user: userId,
    event: eventId,
    approvalStatus: "pending",
    attendanceStatus: "booked",
  });

  if (ticket) {
    // Decrement available tickets
    event.TicketsAvailable -= 1;
    await event.save();

    res.status(201).json({
      success: true,
      data: ticket,
      message: "Ticket request submitted. Waiting for organizer approval.",
    });
  } else {
    res.status(500);
    throw new Error("Failed to request ticket");
  }
});

/**
 * Get all tickets for the logged-in user
 * @route GET /api/tickets
 * @access Private
 */
export const getUserTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id })
    .populate({
      path: "event",
      select: "EventTitle Type Date StartTime EndTime Location Image Creator",
    })
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    data: tickets,
  });
});

/**
 * Get pending ticket requests for artist's events
 * @route GET /api/tickets/pending
 * @access Private (Artist only)
 */
export const getPendingTickets = asyncHandler(async (req, res) => {
  const artistId = req.user._id;

  // Find all events created by this artist
  const artistEvents = await Event.find({ Creator: artistId }).select("_id");
  const eventIds = artistEvents.map((event) => event._id);

  // Find all pending tickets for these events
  const pendingTickets = await Ticket.find({
    event: { $in: eventIds },
    approvalStatus: "pending",
  }).populate([
    { path: "user", select: "name email profileImage" },
    { path: "event", select: "EventTitle Date" },
  ]);

  res.status(200).json({
    success: true,
    data: pendingTickets,
  });
});

/**
 * Get ticket statistics for artist's events
 * @route GET /api/tickets/stats
 * @access Private (Artist only)
 */
export const getTicketStats = asyncHandler(async (req, res) => {
  const artistId = req.user._id;

  // Find all events created by this artist
  const artistEvents = await Event.find({ Creator: artistId }).select(
    "_id EventTitle Date TicketQuantity TicketsAvailable"
  );

  // Create a map to store ticket counts for each event
  const eventTicketStats = [];

  // Process each event
  for (const event of artistEvents) {
    // Count tickets by status for this event
    const approvedCount = await Ticket.countDocuments({
      event: event._id,
      approvalStatus: "approved",
    });

    const pendingCount = await Ticket.countDocuments({
      event: event._id,
      approvalStatus: "pending",
    });

    const rejectedCount = await Ticket.countDocuments({
      event: event._id,
      approvalStatus: "rejected",
    });

    // Calculate total booked (all tickets created regardless of status)
    const totalBookedCount = approvedCount + pendingCount + rejectedCount;

    eventTicketStats.push({
      eventId: event._id,
      eventTitle: event.EventTitle,
      date: event.Date,
      totalTickets: event.TicketQuantity || 0,
      ticketsAvailable: event.TicketsAvailable || 0,
      bookedTickets: totalBookedCount,
      approvedTickets: approvedCount,
      pendingTickets: pendingCount,
      rejectedTickets: rejectedCount,
    });
  }

  res.status(200).json({
    success: true,
    data: eventTicketStats,
  });
});

/**
 * Approve or reject a ticket request
 * @route PUT /api/tickets/:ticketId/status
 * @access Private (Artist only)
 */
export const updateTicketStatus = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Must be 'approved' or 'rejected'");
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // Verify that the user is the creator of the event
  const event = await Event.findById(ticket.event);

  if (!event) {
    res.status(404);
    throw new Error("Associated event not found");
  }

  if (event.Creator.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error(
      "Not authorized: Only the event creator can approve tickets"
    );
  }

  // Update ticket status
  ticket.approvalStatus = status;

  // Generate QR code if approved
  if (status === "approved") {
    const qrData = JSON.stringify({
      ticketId: ticket._id,
      eventId: ticket.event,
      userId: ticket.user,
    });

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);
      ticket.qrCode = qrCodeDataUrl;
    } catch (err) {
      console.error("QR code generation error:", err);
      // Don't fail the whole operation if QR generation fails
    }
  }

  await ticket.save();

  res.status(200).json({
    success: true,
    data: ticket,
    message: `Ticket request ${status}`,
  });
});

/**
 * Create a ticket after successful payment
 * @route POST /api/tickets/create-after-payment
 * @access Private
 */
export const createTicketAfterPayment = asyncHandler(async (req, res) => {
  const { eventId, paymentId, pidx } = req.body;
  const userId = req.user._id;

  console.log("Creating ticket after payment:", {
    eventId,
    paymentId,
    pidx,
    userId,
  });

  // Validate input
  if (!eventId) {
    res.status(400);
    throw new Error("Event ID is required");
  }

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Check if user already has a ticket for this event
  const existingTicket = await Ticket.findOne({ user: userId, event: eventId });
  if (existingTicket) {
    // If ticket exists, ensure it's approved
    if (existingTicket.approvalStatus !== "approved") {
      existingTicket.approvalStatus = "approved";

      // Generate QR code for the existing ticket if not already present
      if (!existingTicket.qrCode) {
        const qrCodeDataUrl = await generateQRCode(existingTicket);
        if (qrCodeDataUrl) {
          existingTicket.qrCode = qrCodeDataUrl;
        }
      }

      await existingTicket.save();
    }

    return res.status(200).json({
      success: true,
      data: existingTicket,
      message: "Ticket already exists and is approved",
    });
  }

  // Create new ticket with approved status for paid events
  const ticket = await Ticket.create({
    user: userId,
    event: eventId,
    approvalStatus: "approved", // Auto-approve for paid events
    attendanceStatus: "booked",
    // Store payment information
    paymentId: paymentId || null,
    pidx: pidx || null,
  });

  if (ticket) {
    // Generate QR code for the paid ticket
    const qrCodeDataUrl = await generateQRCode(ticket);
    if (qrCodeDataUrl) {
      ticket.qrCode = qrCodeDataUrl;
      await ticket.save();
    }

    // Decrement available tickets
    if (event.TicketsAvailable > 0) {
      event.TicketsAvailable -= 1;
      await event.save();
    }

    res.status(201).json({
      success: true,
      data: ticket,
      message: "Ticket created successfully after payment",
    });
  } else {
    res.status(500);
    throw new Error("Failed to create ticket");
  }
});
/**
 * Cancel a ticket
 * @route DELETE /api/tickets/:ticketId/cancel
 * @access Private
 */
export const cancelTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user._id;

  // Find the ticket
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // Verify ticket belongs to the user
  if (ticket.user.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("Not authorized: You can only cancel your own tickets");
  }

  // Get the event to update ticket availability
  const event = await Event.findById(ticket.event);

  if (!event) {
    res.status(404);
    throw new Error("Associated event not found");
  }

  // Check if the event has already ended
  const eventDate = new Date(event.Date);
  if (event.EndTime) {
    const [hours, minutes] = event.EndTime.split(":").map(Number);
    eventDate.setHours(hours || 0, minutes || 0);
  } else {
    eventDate.setHours(23, 59, 59);
  }

  if (new Date() > eventDate) {
    res.status(400);
    throw new Error("Cannot cancel ticket for an event that has already ended");
  }

  // Delete the ticket
  await Ticket.findByIdAndDelete(ticketId);

  // Increase available tickets count
  event.TicketsAvailable += 1;
  await event.save();

  res.status(200).json({
    success: true,
    message: "Ticket cancelled successfully",
  });
});
/**
 * Delete a past event ticket from user history
 * @route DELETE /api/tickets/:ticketId/delete-past
 * @access Private
 */
export const deletePastTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const userId = req.user._id;

  // Find the ticket
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // Verify ticket belongs to the user
  if (ticket.user.toString() !== userId.toString()) {
    res.status(403);
    throw new Error("Not authorized: You can only delete your own tickets");
  }

  // Get the associated event
  const event = await Event.findById(ticket.event);

  if (!event) {
    res.status(404);
    throw new Error("Associated event not found");
  }

  // Delete the ticket from history
  await Ticket.findByIdAndDelete(ticketId);

  res.status(200).json({
    success: true,
    message: "Past event ticket deleted successfully from your history",
  });
});

export const getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find().populate("user event");
  res.status(200).json({ success: true, data: tickets });
});
