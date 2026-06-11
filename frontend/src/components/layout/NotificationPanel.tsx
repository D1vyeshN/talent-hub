import { Bell, BellOff, Check, CheckCheck, MessageCircle, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeNotificationPanel } from "@/store/slices/uiSlice";
import { notificationService } from "@/features/notifications/services/notification.service";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  application_update: <Check className="w-4 h-4 text-blue-600" />,
  new_message: <MessageCircle className="w-4 h-4 text-purple-600" />,
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

export function NotificationPanel() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { notificationPanelOpen } = useAppSelector((s) => s.ui);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications({ page: 1, pageSize: 10 });
      setNotifications(data.data);
      const unreadData = await notificationService.getUnreadCount();
      setUnreadCount(unreadData.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (notificationPanelOpen) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        fetchNotifications();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [notificationPanelOpen, fetchNotifications]);

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
        dispatch(closeNotificationPanel());
        router.push(actionUrl);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  if (!notificationPanelOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={() => dispatch(closeNotificationPanel())}
      />
      <div className="fixed right-4 top-20 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {unreadCount} unread
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleMarkAllRead}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs"
            >
              Mark all read
            </button>
            <button
              onClick={() => dispatch(closeNotificationPanel())}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification: any) => (
              <div
                key={notification._id}
                onClick={() => handleMarkAsRead(notification._id, notification.actionUrl)}
                className={cn(
                  "flex gap-3 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0",
                  !notification.read && "bg-blue-50/50"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  notificationIconBg[notification.type as NotificationType]
                )}>
                  {notificationIcons[notification.type as NotificationType]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-snug">{notification.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">{timeAgo(notification.createdAt)}</p>
                </div>

                {/* Unread Dot */}
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100">
          <button className="w-full text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}
