import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    Creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Image: {
      type: String,
      // required: true,
    },
    EventTitle: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    Category: {
      type: String,
      required: true,
      enum: [
        "Sculpting",
        "Digital Art",
        "Painting",
        "Calligraphy",
        "Embroidery",
      ],
    },
    SubCategory: {
      type: String,
      required: true,
      enum: ["Showcase", "Workshop", "Meet up"],
    },
    Type: {
      type: String,
      required: true,
      enum: ["Online", "Offline-indoors", "Offline-outdoors"],
    },
    Link: {
      type: String,
      validate: {
        validator: function (value) {
          return this.Type !== "Online" || (value && value.trim().length > 0);
        },
        message: "Link is required for online events.",
      },
    },
    Location: {
      Landmark: {
        type: String,
        validate: {
          // ✅ Direct validator definition
          validator: function (value) {
            return (
              this.Type === "Offline-outdoors" ||
              this.Type === "Offline-indoors" ||
              (value && value.trim().length > 0)
            );
          },
          message: "Landmark is required for offline events.",
        },
      },
      City: {
        type: String,
        validate: {
          validator: function (value) {
            return (
              this.Type === "Offline-outdoors" ||
              this.Type === "Offline-indoors" ||
              (value && value.trim().length > 0)
            );
          },
          message: "City is required for offline events.",
        },
      },
      Country: {
        type: String,
        validate: {
          validator: function (value) {
            return (
              this.Type === "Offline-outdoors" ||
              this.Type === "Offline-indoors" ||
              (value && value.trim().length > 0)
            );
          },
          message: "Country is required for offline events.",
        },
      },
    },
    Date: {
      type: Date,
      required: true,
    },
    StartTime: {
      type: String,
      required: true,
    },
    EndTime: {
      type: String,
      required: true,
    },
    TicketQuantity: {
      type: Number,
      required: true,
    },
    TicketsAvailable: {
      type: Number,
      default: function () {
        return this.TicketQuantity;
      },
    },
    StartDate: {
      type: Date,
      required: true,
    },
    EndDate: {
      type: Date,
      required: true,
    },
    // New payment-related fields
    IsPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    Price: {
      type: Number,
      required: function () {
        return this.IsPaid === true;
      },
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    Currency: {
      type: String,
      required: function () {
        return this.IsPaid === true;
      },
      default: "NPR", // Nepalese Rupee for Khalti
      enum: ["NPR"], // You can add more currencies if needed in the future
    },
  },
  {
    timestamps: true, // createdAt, updatedAt on each doc
  }
);

// Middleware to ensure TicketsAvailable doesn't exceed TicketQuantity
eventSchema.pre("save", function (next) {
  if (
    this.isModified("TicketQuantity") &&
    !this.isModified("TicketsAvailable")
  ) {
    this.TicketsAvailable = this.TicketQuantity;
  }

  // Ensure price is set to 0 for free events
  if (this.IsPaid === false) {
    this.Price = 0;
  }

  next();
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
