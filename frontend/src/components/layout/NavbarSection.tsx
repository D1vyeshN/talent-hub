"use client";
import { useState } from "react";
import {
  Bell,
  Briefcase,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  toggleDarkMode,
  toggleNotificationPanel,
} from "@/store/slices/uiSlice";
import { MOCK_NOTIFICATIONS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { redirect, usePathname } from "next/navigation";
import { logout } from "@/features/auth/store/authSlice";

export type Page =
  | "/"
  | "jobs"
  | "job-detail"
  | "companies"
  | "company-profile"
  | "candidate-dashboard"
  | "recruiter-dashboard"
  | "admin-dashboard"
  | "login"
  | "register"
  | "messages"
  | "settings"
  | "salaries"
  | "resources";

export function NavbarSection() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const currentPage = pathname?.replace(/^\//, "");
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { isDarkMode } = useAppSelector((s) => s.ui);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  const navLinks = [
    { label: "Find Jobs", page: "jobs" as Page },
    { label: "Companies", page: "companies" as Page },
    {
      label: "Dashboard",
      page:
        user?.role === "recruiter"
          ? ("recruiter-dashboard" as Page)
          : user?.role === "admin" ? "admin-dashboard" as Page : ("candidate-dashboard" as Page),
      authOnly: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => redirect("/")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Talent<span className="text-blue-600">Hub</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const isActive =
                currentPage === link.page ||
                currentPage.startsWith(`${link.page}/`);
              return (
                <button
                  key={link.page}
                  onClick={() => redirect("/" + link.page)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  )}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated && user ? (
              <>
                {/* Notifications */}
                <button
                  onClick={() => dispatch(toggleNotificationPanel())}
                  className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label={`Notifications (${unreadCount} unread)`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                    aria-expanded={profileDropdownOpen}
                    aria-haspopup="true"
                  >
                    <Avatar name={user.name} size="sm" />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-800 leading-tight">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {profileDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-20">
                        <div className="px-4 py-2.5 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            redirect(
                              user.role === "recruiter"
                                ? "/recruiter-dashboard"
                                : user.role === "admin" ? "/admin-dashboard" : "/candidate-dashboard",
                            );
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <User className="w-4 h-4" /> My Dashboard
                        </button>
                        <button
                          onClick={() => {
                            redirect("/settings");
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4" /> Settings
                        </button>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              dispatch(logout()).then(() => redirect("/"));
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => redirect("/login")}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => redirect("/register")}
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 py-3 space-y-1">
          {navLinks.map((link) => {
            if (link.authOnly && !isAuthenticated) return null;
            return (
              <button
                key={link.page}
                onClick={() => {
                  redirect("/" + link.page);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                {link.label}
              </button>
            );
          })}
          {!isAuthenticated && (
            <div className="pt-2 flex gap-2 px-4">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  redirect("/login");
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => {
                  redirect("/register");
                  setMobileMenuOpen(false);
                }}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
