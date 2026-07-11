import { io } from "socket.io-client";
import API from "./config/api";

export const socket = io(API, {
  transports: ["websocket", "polling"],
});

