// server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import likedRoutes from "./routes/liked.js";
import writingRoutes from "./routes/writingRoutes.js";

// Import custom middleware
import { requestLogger } from "./middleware/loggerMiddleware.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

// Root route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// API Routes with optional logging
app.use("/api/auth", requestLogger, authRoutes);
app.use("/api/posts", requestLogger, postRoutes);
app.use("/api/saved", requestLogger, savedRoutes);
app.use("/api/liked", requestLogger, likedRoutes);
app.use("/api/writing", requestLogger, writingRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
