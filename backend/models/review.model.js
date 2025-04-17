import mongoose from "mongoose";
const { Schema } = mongoose;

const reviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "Event is required"],
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure a user can only review an event once
reviewSchema.index({ user: 1, event: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
