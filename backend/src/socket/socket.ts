import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Message } from "../modules/message/message.model";
import { Conversation } from "../modules/message/conversation.model";
import { Notification } from "../modules/notification/notification.model";
import { setSocketIO } from "../modules/notification/notification.service";
import dotenv from "dotenv";
dotenv.config();

export const initSocket = (io: Server): void => {
  // Set socket.io instance for notification service
  setSocketIO(io);

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

    // Notification handlers
    socket.on("get_notifications", async ({ page = 1, pageSize = 10 }) => {
      try {
        const skip = (page - 1) * pageSize;
        const [notifications, total] = await Promise.all([
          Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize),
          Notification.countDocuments({ userId }),
        ]);

        socket.emit("notifications", {
          data: notifications,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to fetch notifications" });
      }
    });

    socket.on("mark_notification_read", async ({ notificationId }) => {
      try {
        const notification = await Notification.findOneAndUpdate(
          { _id: notificationId, userId },
          { $set: { read: true } },
          { new: true }
        );

        if (notification) {
          socket.emit("notification_updated", notification);
          
          // Emit updated unread count
          const unreadCount = await Notification.countDocuments({ userId, read: false });
          socket.emit("unread_count", { unreadCount });
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to mark notification as read" });
      }
    });

    socket.on("mark_all_notifications_read", async () => {
      try {
        await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
        socket.emit("all_notifications_read");
        socket.emit("unread_count", { unreadCount: 0 });
      } catch (error) {
        socket.emit("error", { message: "Failed to mark all notifications as read" });
      }
    });

    socket.on("get_unread_count", async () => {
      try {
        const unreadCount = await Notification.countDocuments({ userId, read: false });
        socket.emit("unread_count", { unreadCount });
      } catch (error) {
        socket.emit("error", { message: "Failed to get unread count" });
      }
    });

    socket.on("delete_notification", async ({ notificationId }) => {
      try {
        const notification = await Notification.findOneAndDelete({
          _id: notificationId,
          userId,
        });

        if (notification) {
          socket.emit("notification_deleted", { notificationId });
          
          // Emit updated unread count
          const unreadCount = await Notification.countDocuments({ userId, read: false });
          socket.emit("unread_count", { unreadCount });
        }
      } catch (error) {
        socket.emit("error", { message: "Failed to delete notification" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${userId}`);
    });
  });
};