import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import commentSocket from "./socket/commentSocket.js";

dotenv.config();
connectDB();

// Create HTTP server wrapper
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: { origin: "*" },
});

// Attach socket logic
commentSocket(io);

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
