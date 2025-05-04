import mongoose from "mongoose";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expiration time
  });
};

// Register users - restricted to Artist/Organizer and Attendee roles
export const registerUsers = async (req, res) => {
  const user = req.body;

  // Log the incoming data
  console.log("User data received:", user);

  if (!user.name || !user.email || !user.password || !user.role) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill in all the fields!" });
  }

  // Prevent Admin role registration
  if (user.role === "Admin") {
    return res
      .status(403)
      .json({ success: false, message: "Admin registration is not allowed!" });
  }

  // Validate role is either Artist/Organizer or Attendee
  if (user.role !== "Artist/Organizer" && user.role !== "Attendee") {
    return res
      .status(400)
      .json({ success: false, message: "Invalid role selected!" });
  }

  try {
    // Check for existing user with the same email or username
    const existingUser = await User.findOne({
      $or: [{ email: user.email }, { name: user.name }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email or username already in use!" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    // Create new user with hashed password
    const newUser = new User({
      ...user,
      password: hashedPassword,
    });

    await newUser.save(); // Save user to database

    // Return user data with JWT token
    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the user. Please try again.",
    });
  }
};

// User Login
// User Login
export const loginUser = async (req, res) => {
  const { name, password } = req.body;

  // Log request for debugging
  console.log("Login request received:", { name });

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

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been banned. Please contact support for more information.",
        banReason: user.banReason,
        bannedAt: user.bannedAt,
      });
    }

    // Check password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password!" });
    }

    // Return user data with JWT token
    res.status(200).json({
      success: true,
      message: "Login successful!",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error!" });
  }
};

// Get current user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all users - Admin and Artist/Organizer only
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log("Error getting users!", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user
export const updateUsers = async (req, res) => {
  try {
    // Get ID from authenticated user when using profile route
    const id = req.params.id || req.user._id.toString();

    // Explicitly allow only specific fields to be updated
    const allowedUpdates = ["name", "email", "bio", "password", "role"];
    const updates = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Authorization check
    if (req.user.role !== "Admin" && id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user",
      });
    }

    // Handle password update
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    // Perform update
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during update",
    });
  }
};

// Delete user by ID
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "User not found!" });
  }

  try {
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return res
        .status(404)
        .json({ success: false, message: "User not found in the database!" });
    }

    // Prevent deleting the Admin user by non-admin
    if (userToDelete.role === "Admin" && req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot delete Admin user!" });
    }

    // Authorization checks:
    // 1. Admin can delete any user
    // 2. Users can delete themselves
    // 3. Artist/Organizer cannot delete other users
    if (req.user.role === "Admin" || req.user._id.toString() === id) {
      await User.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: "User deleted!" });
    } else {
      res.status(403).json({
        success: false,
        message: "Not authorized to delete this user",
      });
    }
  } catch (error) {
    console.log("Error deleting user!", error.message);
    res.status(500).json({ success: false, message: "Server error!!" });
  }
};

// Ban a user
export const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // Get the user to be banned
    const userToBan = await User.findById(id);

    if (!userToBan) {
      return res.status(404).json({
        success: false,
        message: "User not found in the database!",
      });
    }

    // Check if user is already banned
    if (userToBan.isBanned) {
      return res.status(400).json({
        success: false,
        message: "User is already banned!",
      });
    }

    // Prevent banning Admin users
    if (userToBan.role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Admin users cannot be banned!",
      });
    }

    // Ban the user
    userToBan.isBanned = true;
    userToBan.bannedAt = new Date();
    userToBan.banReason = reason || "Violation of platform guidelines";
    userToBan.bannedBy = req.user._id;

    await userToBan.save();

    res.status(200).json({
      success: true,
      message: "User banned successfully",
      data: {
        _id: userToBan._id,
        name: userToBan.name,
        email: userToBan.email,
        role: userToBan.role,
        isBanned: userToBan.isBanned,
        bannedAt: userToBan.bannedAt,
        banReason: userToBan.banReason,
      },
    });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({
      success: false,
      message: "Server error during user ban",
    });
  }
};

// Unban a user
export const unbanUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // Get the user to be unbanned
    const userToUnban = await User.findById(id);

    if (!userToUnban) {
      return res.status(404).json({
        success: false,
        message: "User not found in the database!",
      });
    }

    // Check if user is actually banned
    if (!userToUnban.isBanned) {
      return res.status(400).json({
        success: false,
        message: "User is not banned!",
      });
    }

    // Unban the user
    userToUnban.isBanned = false;
    userToUnban.bannedAt = null;
    userToUnban.banReason = "";
    userToUnban.bannedBy = null;

    await userToUnban.save();

    res.status(200).json({
      success: true,
      message: "User unbanned successfully",
      data: {
        _id: userToUnban._id,
        name: userToUnban.name,
        email: userToUnban.email,
        role: userToUnban.role,
        isBanned: userToUnban.isBanned,
      },
    });
  } catch (error) {
    console.error("Error unbanning user:", error);
    res.status(500).json({
      success: false,
      message: "Server error during user unban",
    });
  }
};

// Get all banned users
export const getBannedUsers = async (req, res) => {
  try {
    const bannedUsers = await User.find({ isBanned: true })
      .select("-password")
      .populate("bannedBy", "name");

    res.status(200).json({
      success: true,
      count: bannedUsers.length,
      data: bannedUsers,
    });
  } catch (error) {
    console.error("Error getting banned users:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching banned users",
    });
  }
};
