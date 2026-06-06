import { Notification } from "./notification.model";
import { ApiError } from "../../utils/ApiError";
import { buildPaginatedResponse } from "../../utils/pagination";
import { NotificationType } from "../../shared/types/index";

// ─── Get notifications for a user ────────────────────────────────────────────
export const getUserNotifications = async (
  userId: string,
  page: number,
  pageSize: number
) => {
  const skip = (page - 1) * pageSize;
  const [data, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Notification.countDocuments({ userId }),
  ]);
  return buildPaginatedResponse(data, total, page, pageSize);
};

// ─── Mark single notification as read ────────────────────────────────────────
export const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { read: true } },
    { new: true }
  );
  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
};

// ─── Mark all notifications as read ──────────────────────────────────────────
export const markAllAsRead = async (userId: string) => {
  await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
  return { message: "All notifications marked as read" };
};

// ─── Delete a notification ────────────────────────────────────────────────────
export const deleteNotification = async (
  notificationId: string,
  userId: string
) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    userId,
  });
  if (!notification) throw new ApiError(404, "Notification not found");
  return notification;
};

// ─── Unread count ─────────────────────────────────────────────────────────────
export const getUnreadCount = async (userId: string) => {
  const count = await Notification.countDocuments({ userId, read: false });
  return { unreadCount: count };
};

// ─── Create notification (used internally by other services) ──────────────────
export const createNotification = async (data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  avatar?: string;
}) => {
  return Notification.create({ ...data, read: false });
};