import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import likedRoutes from "./routes/liked.js";
import writingRoutes from "./routes/writingRoutes.js";
import commentRoutes from "./routes/commentRoutes.js"; 

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Auth & Users
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes);

// Posts (image / video)
app.use("/api/posts", postRoutes);

// Writing (poetry / thoughts)
app.use("/api/writing", writingRoutes);

// ✅ ONE unified comment system (posts + writing)
app.use("/api/comments", commentRoutes);

// Saved / Liked
app.use("/api/saved", savedRoutes);
app.use("/api/liked", likedRoutes);

export default app;
