import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      minlength: 5,
    },
    role: {
      type: String,
      required: true,
      enum: ["Artist/Organizer", "Attendee"],
    },
  },
  {
    timestamps: true, //createdat, updatedat on each doc
  }
);

const User = mongoose.model("User", userSchema);

export default User;
