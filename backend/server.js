import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import eventRoutes from "./routes/event.route.js";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
app.use(express.json()); // Allows JSON request body parsing

app.use(
  cors({
    origin: "http://localhost:5173", // Explicitly allow frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
// Connect to DB before starting server
app.listen(PORT, () => {
  connectDB();
  console.log("Server started at http://localhost:" + PORT);
});
