// server.js

import express from "express";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import writingRoutes from './routes/writingRoutes.js';
import cors from "cors";
import connectDB from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js"; 
import savedRoutes from "./routes/savedRoutes.js";
import likedRoutes from "./routes/liked.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Server is running!");
});
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/auth", authRoutes);      // Authentication
app.use("/api/posts", postRoutes);     // Posts CRUD
app.use("/api/saved", savedRoutes);    // Saved posts
app.use("/api/liked", likedRoutes);    // Liked posts
app.use('/api/writing', writingRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
