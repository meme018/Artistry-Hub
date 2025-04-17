import mongoose from "mongoose";
const Schema = mongoose.Schema;

const DiscussionSchema = new Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "Event ID is required"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  message: {
    type: String,
    required: [true, "Message content cannot be empty"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries when getting discussions for a particular event
DiscussionSchema.index({ event: 1, createdAt: -1 });

const Discussion = mongoose.model("Discussion", DiscussionSchema);

export default Discussion;
