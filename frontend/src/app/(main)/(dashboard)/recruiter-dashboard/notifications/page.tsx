"use client";

import { notificationService } from "@/features/notifications/services/notification.service";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";
import { Check, CheckCheck, Bell, BellOff, Trash2 } from "lucide-react";
import type { NotificationType, Notification } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  application_update: <Check className="w-4 h-4 text-blue-600" />,
  new_message: <Bell className="w-4 h-4 text-purple-600" />,
  job_alert: <Bell className="w-4 h-4 text-amber-600" />,
  profile_view: <Bell className="w-4 h-4 text-green-600" />,
  interview_scheduled: <CheckCheck className="w-4 h-4 text-emerald-600" />,
};

const notificationIconBg: Record<NotificationType, string> = {
  application_update: "bg-blue-100",
  new_message: "bg-purple-100",
  job_alert: "bg-amber-100",
  profile_view: "bg-green-100",
  interview_scheduled: "bg-emerald-100",
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({ page, pageSize: 10 });
      setNotifications(data.data);
      setTotalPages(data.totalPages);
      const unreadData = await notificationService.getUnreadCount();
      setUnreadCount(unreadData.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string, actionUrl?: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map((n) => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
      
      // Navigate to actionUrl if provided
      if (actionUrl) {
        router.push(actionUrl);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
      const unreadData = await notificationService.getUnreadCount();
      setUnreadCount(unreadData.unreadCount);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">
          Stay updated on candidate activity and job alerts
        </p>
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <CardTitle>All Notifications</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button 
            onClick={handleMarkAllRead}
            className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            Mark all read
          </button>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <BellOff className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={cn(
                  "flex gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors",
                  !n.read && "bg-blue-50/50",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    notificationIconBg[n.type],
                  )}
                >
                  {notificationIcons[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      className="flex-1"
                      onClick={() => handleMarkAsRead(n._id, n.actionUrl)}
                    >
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(n._id);
                        }}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}