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

// Posts (normal posts)
app.use("/api/posts", postRoutes);

// Writing (poetry / thoughts / long content)
app.use("/api/writing", writingRoutes);

// Generic comments (for posts)
app.use("/api/comments", commentRoutes);

// Saved / Liked
app.use("/api/saved", savedRoutes);
app.use("/api/liked", likedRoutes);

export default app;
