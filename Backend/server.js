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
app.use("/api/auth", (req, res, next) => {
  console.log("🚦 [AUTH ROUTE HIT]");
  console.log("➡️  Method:", req.method);
  console.log("➡️  URL:", req.originalUrl);
  console.log("➡️  Time:", new Date().toLocaleString());
  console.log("➡️  Body:", req.body);
  console.log("➡️  Headers:", req.headers.authorization ? "✅ Auth header present" : "❌ No auth header");
  next();
});    // Authentication

// Missing:
app.use("/api/auth", authRoutes);

app.use("/api/posts", (req, res, next) => {
    console.log(`Request received at /api/posts -> Method: ${req.method}, URL: ${req.url}`);
    next(); // pass control to postRoutes
}, postRoutes);


app.use("/api/saved", savedRoutes);    // Saved posts
app.use("/api/liked", likedRoutes);    // Liked posts
app.use('/api/writing', writingRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on https://localhost:${PORT}`));