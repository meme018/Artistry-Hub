// user.routes.js (corrected)
import express from "express";
import {
  deleteUser,
  getUsers,
  registerUsers,
  updateUsers,
  loginUser,
  getUserProfile,
  banUser,
  unbanUser,
  getBannedUsers,
} from "../controllers/user.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUsers);
router.post("/login", loginUser);

// Protected routes - All authenticated users can see and update their own profile
router.route("/profile").get(protect, getUserProfile).put(protect, updateUsers); // Any user can update their own profile

// Admin and Artist/Organizer routes
router.get("/", protect, authorize("Admin", "Artist/Organizer"), getUsers);

// Banned users route - Admin only
router.get("/banned", protect, authorize("Admin"), getBannedUsers);

// User management routes - Updated to allow users to update their own profile
router
  .route("/:id")
  .put(protect, authorize("Admin"), updateUsers) // Restrict ID-based updates to Admin
  .delete(protect, authorize("Admin"), deleteUser);

// Ban/unban routes - Admin only
router.post("/:id/ban", protect, authorize("Admin"), banUser);
router.post("/:id/unban", protect, authorize("Admin"), unbanUser);

export default router;
