import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js"; //  new import

dotenv.config();

//  Connect to MongoDB
connectDB();

const app = express();

//  Middlewares
app.use(cors());
app.use(express.json());

//  Root route
app.get("/", (req, res) => {
  res.send(" Echoes of Art backend is running!");
});

//  Auth routes
app.use("/api/auth", authRoutes);

//  Post CRUD routes
app.use("/api/posts", postRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
