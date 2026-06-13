"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeSocket, disconnectSocket } from "@/shared/lib/socket";
import {
  fetchNotifications,
  fetchUnreadCount,
  newNotificationReceived,
  unreadCountUpdated,
} from "@/features/notifications/store/notificationSlice";
import {
  newMessageReceived,
  messageSent,
  conversationUpdated,
} from "@/features/message/store/messageSlice";
import type { Message, Notification } from "@/types";

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const fetchData = useCallback(async () => {
    dispatch(fetchNotifications({ page: 1, pageSize: 10 }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {

    if (!isAuthenticated || !user || user.role === "admin") {
      return;
    }

    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  },[fetchData, isAuthenticated, user]);

  useEffect(() => {
    // Only initialize socket if user is authenticated and not admin
    if (!isAuthenticated || !user || user.role === "admin") {
      return;
    }

    const socket = initializeSocket();

    // Notification listeners
    socket.on("new_notification", (notification: Notification) => {
      console.log("🔔 New notification received:", notification);
      dispatch(newNotificationReceived(notification));
    });

    socket.on("unread_count", (data: { unreadCount: number }) => {
      console.log("🔢 Unread count updated:", data);
      dispatch(unreadCountUpdated(data));
    });

    // Message listeners
    socket.on("new_message", (message: Message) => {
      console.log("💬 New message received:", message);
      dispatch(newMessageReceived(message));
    });

    socket.on("message_sent", (message: Message) => {
      console.log("📤 Message sent confirmation:", message);
      dispatch(messageSent(message));
    });

    socket.on("conversation_updated", (conversation: any) => {
      console.log("📝 Conversation updated:", conversation);
      dispatch(conversationUpdated(conversation));
    });

    return () => {
      socket.off("new_notification");
      socket.off("unread_count");
      socket.off("new_message");
      socket.off("message_sent");
      socket.off("conversation_updated");
    };
  }, [dispatch, isAuthenticated, user]);

  // Disconnect socket when user logs out or becomes admin
  useEffect(() => {
    if (!isAuthenticated || !user || user.role === "admin") {
      disconnectSocket();
    }
  }, [isAuthenticated, user]);

  return <>{children}</>;
}
