"use client";

import {
  LayoutDashboard,
  Briefcase,
  Plus,
  Users,
  Search,
  Calendar,
  MessageSquare,
  Bell,
  Building2,
  Settings,
  LogOut,
  Download,
  X,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/features/auth/store/authSlice";
import { useState } from "react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  section?: string;
  badge?: number;
  exact?: boolean;
}

export function RecruiterSidebar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen } = useAppSelector((s) => s.ui);
  const { user } = useAppSelector((s) => s.auth);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: "/recruiter-dashboard",
      exact: true,
      section: "Main",
    },
    {
      label: "My Jobs",
      icon: <Briefcase className="w-5 h-5" />,
      href: "/recruiter-dashboard/jobs",
      section: "Jobs",
    },
    {
      label: "Post a Job",
      icon: <Plus className="w-5 h-5" />,
      href: "/recruiter-dashboard/jobs/post",
      section: "Jobs",
    },
    {
      label: "Applications",
      icon: <Users className="w-5 h-5" />,
      href: "/recruiter-dashboard/applications",
      section: "Candidates",
    },
    {
      label: "Candidates",
      icon: <Search className="w-5 h-5" />,
      href: "/recruiter-dashboard/candidates",
      section: "Candidates",
    },
    {
      label: "Interviews",
      icon: <Calendar className="w-5 h-5" />,
      href: "/recruiter-dashboard/interviews",
      section: "Candidates",
    },
    {
      label: "Messages",
      icon: <MessageSquare className="w-5 h-5" />,
      href: "/recruiter-dashboard/messages",
      section: "Communication",
    },
    {
      label: "Notifications",
      icon: <Bell className="w-5 h-5" />,
      href: "/recruiter-dashboard/notifications",
      section: "Communication",
    },
    {
      label: "Company",
      icon: <Building2 className="w-5 h-5" />,
      href: "/recruiter-dashboard/company",
      section: "Account",
    },
    {
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
      href: "/recruiter-dashboard/settings",
      section: "Account",
    },
    {
      label: "Reports",
      icon: <Download className="w-5 h-5" />,
      href: "/recruiter-dashboard/reports",
      section: "Account",
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    dispatch(logout()).then(() => {
      router.push("/login");
    });
  };

  return (
    <div className={cn("relative w-0 lg:w-fit")}>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "sticky top-[65px] z-35 left-0 h-[calc(100vh-65px)] max-h-screen bg-white border border-t-0 border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
          // Desktop collapsed
          !sidebarOpen && "lg:w-[72px]",
          sidebarOpen && "lg:w-[260px]",
          // Mobile
          mobileOpen
            ? "w-[260px] translate-x-0"
            : "translate-x-0 lg:translate-x-0",
        )}
      >
        {/* Logo / Brand */}
        {/* <div className="flex items-center gap-3 h-16 px-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
              Talent<span className="text-blue-600">Hub</span>
            </span>
          )}

          <button
            onClick={() => dispatch(toggleSidebar())}
            className="flex ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft
              className={cn(
                "w-5 h-5 transition-transform",
                !sidebarOpen && "rotate-180",
              )}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div> */}

        {/* Navigation */}
        <nav
          className={cn(
            "overflow-y-auto py-4 px-3 ",
            mobileOpen ? "flex-1 lg:flex-1" : "hidden lg:block lg:flex-1",
          )}
          aria-label="Recruiter sidebar"
        >
          {(() => {
            let lastSection: string | null = null;
            const items: React.ReactNode[] = [];
            navItems.forEach((item) => {
              if (item.section && item.section !== lastSection) {
                lastSection = item.section;
                if (sidebarOpen) {
                  items.push(
                    <p
                      key={item.section}
                      className="px-3 mt-0 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 select-none"
                    >
                      {item.section}
                    </p>,
                  );
                }
              }
              const active = isActive(item.href, item.exact);
              items.push(
                <button
                  key={item.href}
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    "w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-1 group relative",
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <span
                    className={cn(
                      "flex-shrink-0",
                      active
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600",
                    )}
                  >
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}
                  {item.badge !== undefined && sidebarOpen && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold">
                      {item.badge}
                    </span>
                  )}
                  {/* Tooltip for collapsed state */}
                  {!sidebarOpen && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                    </span>
                  )}
                </button>,
              );
            });
            return items;
          })()}
        </nav>
        <div className="absolute -right-8 bottom-10 z-50 bg-white border border-gray-600 rounded-lg">
          <button
            onClick={() => {
              setMobileOpen(!mobileOpen);
            }}
            className="flex lg:hidden ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft
              className={cn(
                "w-5 h-5 transition-transform",
                !mobileOpen && "rotate-180",
              )}
            />
          </button>
        </div>
      </aside>
    </div>
  );
}
