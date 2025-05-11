import express from "express";
import {
  initiateKhaltiPayment,
  // verifyKhaltiPayment,
  handleKhaltiCallback,
  getPaymentStatus,
  createKhaltiPaymentSession,
} from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Payment initialization and verification routes
router.post("/initiate", protect, initiateKhaltiPayment);
router.post("/create-payment-session", protect, createKhaltiPaymentSession);
// router.post("/verify", protect, verifyKhaltiPayment);

// Handle Khalti callback (public route)
router.get("/callback", handleKhaltiCallback);

// Get payment status for an event
router.get("/status/:eventId", protect, getPaymentStatus);

export default router;
