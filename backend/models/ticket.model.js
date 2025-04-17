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
    rsvpStatus: {
      type: Boolean,
      default: true,
    },
    status: {
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
