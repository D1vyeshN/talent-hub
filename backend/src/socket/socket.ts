import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Message } from "../modules/message/message.model";
import { Conversation } from "../modules/message/conversation.model";
import dotenv from "dotenv";
dotenv.config();

export const initSocket = (io: Server): void => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    const JWT_SECRET = (process.env.JWT_SECRET || "fallback-secret-change-me") as jwt.Secret;
    
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      socket.data.userId = decoded.userId;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    socket.join(userId); // Personal room

    console.log(`🟢 User connected: ${userId}`);

    socket.on("send_message", async ({ conversationId, receiverId, content }) => {
      const message = await Message.create({
        senderId: userId,
        receiverId,
        content,
        conversationId,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        $inc: { unreadCount: 1 },
      });

      io.to(receiverId).emit("new_message", message);
      socket.emit("message_sent", message);
    });

    socket.on("mark_read", async ({ conversationId }) => {
      await Message.updateMany(
        { conversationId, receiverId: userId },
        { $set: { read: true } }
      );
      await Conversation.findByIdAndUpdate(conversationId, { unreadCount: 0 });
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${userId}`);
    });
  });
};