import express from "express";
import {
  deleteUser,
  getUsers,
  registerUsers,
  updateUsers,
  loginUser,
  getUserProfile,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUsers);
router.post("/login", loginUser);

// Protected routes
router.route("/profile").get(protect, getUserProfile).put(protect, updateUsers); // Add this line for profile updates

// Admin and Artist/Organizer routes
router.get("/", protect, authorize("Admin", "Artist/Organizer"), getUsers);

// User management routes
router
  .route("/:id")
  .put(protect, authorize("Admin"), updateUsers) // Restrict ID-based updates to Admin
  .delete(protect, authorize("Admin"), deleteUser);

export default router;
