/**
 * Notification service — typed wrappers around apiClient.
 *
 * Matches backend endpoints:
 *  - GET /api/notification — get user notifications
 *  - GET /api/notification/unread-count — get unread count
 *  - PATCH /api/notification/:id/read — mark as read
 *  - PATCH /api/notification/read-all — mark all as read
 *  - DELETE /api/notification/:id — delete notification
 */

import { apiClient } from "@/shared/lib/apiClient";
import type { Notification } from "@/types";

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const notificationService = {
  /** GET /api/notification — get user notifications */
  getNotifications: (params?: { page?: number; pageSize?: number }): Promise<PaginatedNotifications> => {
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([, value]) => value !== undefined)
    );
    return apiClient.get<PaginatedNotifications>("/api/notification", filteredParams as any);
  },

  /** GET /api/notification/unread-count — get unread count */
  getUnreadCount: (): Promise<UnreadCountResponse> =>
    apiClient.get<UnreadCountResponse>("/api/notification/unread-count"),

  /** PATCH /api/notification/:id/read — mark as read */
  markAsRead: (notificationId: string): Promise<Notification> =>
    apiClient.patch<Notification>(`/api/notification/${notificationId}/read`, {}),

  /** PATCH /api/notification/read-all — mark all as read */
  markAllAsRead: (): Promise<{ message: string }> =>
    apiClient.patch<{ message: string }>("/api/notification/read-all", {}),

  /** DELETE /api/notification/:id — delete notification */
  deleteNotification: (notificationId: string): Promise<void> =>
    apiClient.delete<void>(`/api/notification/${notificationId}`),
};
