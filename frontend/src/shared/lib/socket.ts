/**
 * Socket.io client wrapper for real-time messaging and notifications
 */

import { io, Socket } from "socket.io-client";
import { getCookie } from "./cookie";

let socket: Socket | null = null;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

/**
 * Initialize socket connection with JWT authentication
 */
export const initializeSocket = (): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const token = getCookie("token");

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 1,
    reconnectionDelay: 3000,
  });

  socket.on("connect", () => {
    console.log("🟢 Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error.message);
  });

  return socket;
};

/**
 * Get socket instance (initialize if not exists)
 */
export const getSocket = (): Socket => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("🔌 Socket disconnected manually");
  }
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};
