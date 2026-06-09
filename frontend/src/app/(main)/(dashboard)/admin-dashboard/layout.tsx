"use client";

import { AdminSidebar } from "@/components/dashboard/AdminSidebar";
import { useAppSelector } from "@/store/hooks";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);

  return (
    <div className="h-[calc(100vh - 64px)] bg-gray-50 flex lg:gap-2 lg:mx-28">
      <AdminSidebar />
      {/* Main panel — offset for sidebar */}
      <div
        className="w-full"
        style={{ transition: "margin-left 300ms ease-in-out" }}
      >
        <main className="p-4 lg:p-6 overflow-auto"
        >{children}</main>
      </div>
    </div>
  );
}
