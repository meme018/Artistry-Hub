import mongoose from "mongoose";
import User from "../models/user.model.js";

// Add users
export const registerUsers = async (req, res) => {
  const user = req.body;

  // Log the incoming data
  console.log("User data received:", user);

  if (!user.name || !user.email || !user.password || !user.role) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill in all the fields!" });
  }

  try {
    // Check for existing user with the same email
    const existingUser = await User.findOne({
      email: user.email,
      name: user.name,
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email or username already in use!" });
    }

    const newUser = new User(user);
    await newUser.save(); // Save user to database
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Error creating user:", error); // Log the entire error for better debugging
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the user. Please try again.",
    });
  }
};

// User Login
export const loginUser = async (req, res) => {
  const { name, password } = req.body;

  // Log request for debugging
  console.log("Login request received:", { name, password });

  if (!name || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please enter username and password!" });
  }

  try {
    // Find user by name
    const user = await User.findOne({ name });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // Check password (assuming it's plain text for now; use hashing in production)
    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password!" });
    }

    res
      .status(200)
      .json({ success: true, message: "Login successful!", data: user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

// Get users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log("Error getting users!", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//update user
export const updateUsers = async (req, res) => {
  const { id } = req.params; //get id from the database

  const user = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "User not found  !!" });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "User not found  !!" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found in the database!" });
    }
    res.status(200).json({ success: true, message: "User deleted!" });
  } catch (error) {
    console.log("Error deleting user!", error.message);
    res.status(500).json({ success: false, message: "Server error!!" });
  }
};
