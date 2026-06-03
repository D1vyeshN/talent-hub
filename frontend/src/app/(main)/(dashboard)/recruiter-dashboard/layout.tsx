"use client";

import { RecruiterSidebar } from "@/components/dashboard/RecruiterSidebar";
import { useAppSelector } from "@/store/hooks";

export default function RecruiterDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);

  return (
    <div className="h-[calc(100vh - 64px)] bg-gray-50 flex lg:gap-2 lg:mx-28">
      <RecruiterSidebar />
      {/* Main panel — offset for sidebar */}
      <div
        // className={sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[72px]"}
        className="w-full"
        style={{ transition: "margin-left 300ms ease-in-out" }}
      >
        <main className="p-4 lg:p-6 overflow-auto"
        >{children}</main>
      </div>
    </div>
  );
}
