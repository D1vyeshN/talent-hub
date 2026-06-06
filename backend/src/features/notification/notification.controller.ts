import { Response } from "express";
import * as NotificationService from "./notification.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getPagination } from "../../utils/pagination";

// GET /api/v1/notifications
export const getMyNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, pageSize } = getPagination(req.query);
  const result = await NotificationService.getUserNotifications(
    req.userId!, page, pageSize
  );
  res.json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

// GET /api/v1/notifications/unread-count
export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await NotificationService.getUnreadCount(req.userId!);
  res.json(new ApiResponse(200, result, "Unread count fetched"));
});

// PATCH /api/v1/notifications/:id/read
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await NotificationService.markAsRead(
    req.params.id as string, req.userId!
  );
  res.json(new ApiResponse(200, notification, "Notification marked as read"));
});

// PATCH /api/v1/notifications/read-all
export const markAllRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await NotificationService.markAllAsRead(req.userId!);
  res.json(new ApiResponse(200, result, "All notifications marked as read"));
});

// DELETE /api/v1/notifications/:id
export const deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
  await NotificationService.deleteNotification(req.params.id as string, req.userId!);
  res.json(new ApiResponse(200, null, "Notification deleted successfully"));
});