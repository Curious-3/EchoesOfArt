import express from "express";
import cors from "cors";
import writingRoutes from "./routes/writingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import likedRoutes from "./routes/liked.js";
import commentRoutes from "./routes/commentRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/liked", likedRoutes);
app.use("/api/writing", writingRoutes);
app.use("/api/comments", commentRoutes);

export default app;
