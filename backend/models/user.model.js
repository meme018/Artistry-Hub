import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Artist/Organizer", "Attendee"],
      default: "Attendee",
    },
    bio: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, //createdat, updatedat on each doc
  }
);

const User = mongoose.model("User", userSchema);

export default User;
