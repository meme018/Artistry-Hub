import express from "express";
import {
  deleteUser,
  getUsers,
  registerUsers,
  updateUsers,
  loginUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Add users
router.post("/register", registerUsers);

// Login users
router.post("/login", loginUser);

// Get users
router.get("/", getUsers);

//update user
router.put("/:id", updateUsers);

// Delete user by ID
router.delete("/:id", deleteUser);

export default router;
