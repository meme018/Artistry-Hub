import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import eventRoutes from "./routes/event.route.js";
import ticketRoutes from "./routes/ticket.route.js";
import discussionRoutes from "./routes/discussion.route.js";
import reviewRoutes from "./routes/review.route.js";
import { errorHandler } from "./middleware/error.middleware.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Make uploads folder static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Connect to DB before starting server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
