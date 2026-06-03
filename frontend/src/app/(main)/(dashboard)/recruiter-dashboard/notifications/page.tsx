"use client";

import { MOCK_NOTIFICATIONS } from "@/lib/mockData";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, CheckCheck, Bell, BellOff } from "lucide-react";
import type { NotificationType } from "@/types";

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
  const notifications = MOCK_NOTIFICATIONS;
  const unread = notifications.filter((n) => !n.read).length;

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
              {unread} unread notification{unread !== 1 ? "s" : ""}
            </p>
          </div>
          <button className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors">
            Mark all read
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <BellOff className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div
                key={n.id}
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
                    <div>
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}