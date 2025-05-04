// 1. Update ticket.model.js to include approval status
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    qrCode: {
      type: String,
      default: null,
    },
    attendanceStatus: {
      type: String,
      enum: ["booked", "attended"],
      default: "booked",
    },
  },
  {
    timestamps: true,
  }
);

// Create a unique compound index on user and event
ticketSchema.index({ user: 1, event: 1 }, { unique: true });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
