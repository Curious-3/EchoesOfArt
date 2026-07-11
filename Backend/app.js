import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import likedRoutes from "./routes/liked.js";
import writingRoutes from "./routes/writingRoutes.js";
import commentRoutes from "./routes/commentRoutes.js"; 

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true
}));
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

// ✅ Health check — UptimeRobot ping karega, Render kabhi sleep nahi karega
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is alive 🚀" });
});

export default app;
