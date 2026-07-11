import dotenv from "dotenv";
dotenv.config(); // ✅ Sabse pehle — taaki sab env vars load ho jayein

import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import commentSocket from "./socket/commentSocket.js";
import path from "path";
import express from "express";

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

connectDB();

// Create HTTP server wrapper
const server = http.createServer(app);

// Setup Socket.io
export let io;
io = new Server(server, {
  cors: { origin: "*" },
});

// Attach socket logic
commentSocket(io);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
