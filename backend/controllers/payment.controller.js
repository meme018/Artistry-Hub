import Ticket from "../models/ticket.model.js";
import Event from "../models/event.model.js";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

// Environment variables
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_EPAYMENT_URL = "https://a.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL = "https://a.khalti.com/api/v2/epayment/lookup/";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * Initiate Khalti payment - returns necessary event information
 * @route POST /api/payment/initiate
 * @access Private
 */
export const initiateKhaltiPayment = async (req, res) => {
  try {
    const { eventId } = req.body;

    // Validate input
    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "Event ID is required",
      });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Verify that it's a paid event
    if (!event.IsPaid) {
      return res.status(400).json({
        success: false,
        message: "This event does not require payment",
      });
    }

    // Check ticket availability
    if (event.TicketsAvailable <= 0) {
      return res.status(400).json({
        success: false,
        message: "Sorry, no tickets available for this event",
      });
    }

    // Check if user already has a ticket
    const existingTicket = await Ticket.findOne({
      user: req.user.id,
      event: eventId,
    });

    if (existingTicket) {
      return res.status(400).json({
        success: false,
        message: "You already have a ticket for this event",
      });
    }

    // Return event info with price in paisa
    return res.status(200).json({
      success: true,
      data: {
        eventId: event._id,
        eventTitle: event.EventTitle,
        amountInPaisa: event.Price * 100,
      },
    });
  } catch (error) {
    console.error("Error initiating payment:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error initiating payment",
    });
  }
};

/**
 * Create Khalti payment session - creates an actual payment session with Khalti
 * @route POST /api/payment/create-payment-session
 * @access Private
 */
// Updated createKhaltiPaymentSession function
export const createKhaltiPaymentSession = async (req, res) => {
  try {
    const { eventId, eventTitle, amount } = req.body;
    const userId = req.user.id;

    console.log("Create payment session request:", {
      eventId,
      eventTitle,
      amount,
    });

    // Validate input
    if (!eventId || !eventTitle || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: eventId, eventTitle or amount",
      });
    }

    // Ensure userId exists
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Verify the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if the amount matches the event's price
    const expectedAmount = event.Price * 100; // Convert to paisa
    if (parseInt(amount) !== expectedAmount) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Expected: ${expectedAmount}, Received: ${amount}`,
      });
    }

    // Get user information from req.user
    const userInfo = {
      name: req.user.name || "Customer",
      email: req.user.email || "customer@example.com",
      phone: req.user.phone || "9800000000",
    };

    // Create unique order ID with timestamp and user ID
    const timestamp = new Date().getTime();
    const purchaseOrderId = `order_${eventId}_${userId}_${timestamp}`;

    // Parse amount to integer to ensure it's a number
    const amountInt = parseInt(amount);

    // Prepare payload for Khalti ePayment
    const payload = {
      return_url: `${FRONTEND_URL}/payment/callback`,
      website_url: FRONTEND_URL,
      amount: amountInt, // Amount in paisa
      purchase_order_id: purchaseOrderId,
      purchase_order_name: eventTitle,
      customer_info: {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
      },
      product_details: [
        {
          identity: eventId,
          name: eventTitle,
          total_price: amountInt,
          quantity: 1,
          unit_price: amountInt,
        },
      ],
      // FIX: Make sure amount_breakdown sums to the total amount
      amount_breakdown: [
        {
          label: "Event Ticket",
          amount: amountInt, // Use the full amount here
        },
      ],
      // Store user and event IDs as metadata in a custom field
      metadata: {
        userId: userId.toString(),
        eventId: eventId.toString(),
      },
    };

    console.log("Khalti payload:", JSON.stringify(payload));
    console.log("Using Khalti URL:", KHALTI_EPAYMENT_URL);
    console.log("Secret key available:", !!KHALTI_SECRET_KEY);

    // Make request to Khalti
    const response = await fetch(KHALTI_EPAYMENT_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const khaltiResponse = await response.json();
    console.log("Khalti response:", khaltiResponse);

    if (response.ok && khaltiResponse.payment_url) {
      return res.status(200).json({
        success: true,
        payment_url: khaltiResponse.payment_url,
        pidx: khaltiResponse.pidx,
      });
    } else {
      console.error("Khalti error response:", khaltiResponse);
      return res.status(400).json({
        success: false,
        message: "Failed to create payment session with Khalti",
        error: khaltiResponse,
      });
    }
  } catch (error) {
    console.error("Error creating payment session:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating payment session",
    });
  }
};

/**
 * Handle Khalti callback with improved debugging and error handling
 * @route GET /api/payment/callback
 * @access Public
 */
export const handleKhaltiCallback = async (req, res) => {
  try {
    const { pidx, transaction_id, status, purchase_order_id, amount, eventId } =
      req.query;

    console.log("Khalti callback received:", {
      query: req.query,
      headers: req.headers,
      cookies: req.cookies,
    });

    if (!pidx || !status) {
      console.error("Invalid callback data: missing pidx or status");
      return res.redirect(
        `${FRONTEND_URL}/payment/status?status=error&message=Invalid callback data`
      );
    }

    // For successful payments, verify with Khalti
    if (status === "Completed") {
      try {
        // Lookup payment status from Khalti
        const response = await fetch(`${KHALTI_LOOKUP_URL}?pidx=${pidx}`, {
          method: "GET",
          headers: {
            Authorization: `Key ${KHALTI_SECRET_KEY}`,
          },
        });

        const khaltiData = await response.json();
        console.log("Khalti verification data:", khaltiData);

        if (response.ok && khaltiData.status === "Completed") {
          // Extract user and event info from multiple sources

          // First try the purchase_order_id
          let userId, eventIdFromOrder;
          if (purchase_order_id && purchase_order_id.startsWith("order_")) {
            // purchase_order_id format: order_eventId_userId_timestamp
            const orderIdParts = purchase_order_id.split("_");
            if (orderIdParts.length >= 3) {
              eventIdFromOrder = orderIdParts[1];
              userId = orderIdParts[2];
            }
          }

          // Then try the metadata from Khalti if available
          const metadata = khaltiData.metadata || {};
          const userIdFromMetadata = metadata.userId;
          const eventIdFromMetadata = metadata.eventId;

          // Finally try the query param
          const eventIdFromQuery = eventId;

          // Use the first available value
          const finalEventId =
            eventIdFromOrder || eventIdFromMetadata || eventIdFromQuery;
          const finalUserId = userId || userIdFromMetadata;

          console.log("Extracted IDs:", {
            finalEventId,
            finalUserId,
            sources: {
              fromOrder: { eventIdFromOrder, userId },
              fromMetadata: { eventIdFromMetadata, userIdFromMetadata },
              fromQuery: { eventIdFromQuery },
            },
          });

          if (!finalEventId || !finalUserId) {
            throw new Error(
              "Could not determine event or user ID from payment data"
            );
          }

          // Get the event
          const event = await Event.findById(finalEventId);
          if (!event) {
            throw new Error(`Event not found with ID: ${finalEventId}`);
          }

          // Check if ticket already exists
          const existingTicket = await Ticket.findOne({
            user: finalUserId,
            event: finalEventId,
          });

          if (existingTicket) {
            console.log("Ticket already exists:", existingTicket);

            // Make sure ticket is approved even if it previously wasn't
            if (existingTicket.approvalStatus !== "approved") {
              existingTicket.approvalStatus = "approved";
              await existingTicket.save();
              console.log("Updated existing ticket to approved status");
            }

            return res.redirect(
              `${FRONTEND_URL}/payment/status?status=success&message=Payment already processed&eventId=${finalEventId}`
            );
          }

          // Create ticket
          const newTicket = await Ticket.create({
            user: finalUserId,
            event: finalEventId,
            approvalStatus: "approved", // Auto-approve for paid events
          });

          console.log("New ticket created:", newTicket);

          // Update ticket availability
          if (event.TicketsAvailable > 0) {
            event.TicketsAvailable -= 1;
            await event.save();
          }

          return res.redirect(
            `${FRONTEND_URL}/payment/status?status=success&message=Payment successful&eventId=${finalEventId}`
          );
        } else {
          console.error("Payment verification failed:", khaltiData);
          throw new Error("Payment verification failed with Khalti");
        }
      } catch (error) {
        console.error("Error processing successful payment:", error);
        return res.redirect(
          `${FRONTEND_URL}/payment/status?status=error&message=${encodeURIComponent(
            error.message
          )}`
        );
      }
    } else {
      // For failed or other status
      console.log(`Payment not completed. Status: ${status}`);
      return res.redirect(`${FRONTEND_URL}/payment/status?status=${status}`);
    }
  } catch (error) {
    console.error("Error handling Khalti callback:", error);
    return res.redirect(
      `${FRONTEND_URL}/payment/status?status=error&message=${encodeURIComponent(
        "Server error: " + error.message
      )}`
    );
  }
};

/**
 * Get payment status
 * @route GET /api/payment/status/:eventId
 * @access Private
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user has a ticket for this event
    const ticket = await Ticket.findOne({ user: userId, event: eventId });

    if (ticket) {
      return res.status(200).json({
        success: true,
        hasPaid: true,
        ticketStatus: ticket.approvalStatus,
      });
    } else {
      return res.status(200).json({
        success: true,
        hasPaid: false,
      });
    }
  } catch (error) {
    console.error("Error getting payment status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error getting payment status",
    });
  }
};
