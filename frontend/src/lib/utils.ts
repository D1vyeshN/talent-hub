import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format salary in Indian currency notation (Lakhs/Crores)
 */
export function formatSalary(amount: number, currency = "INR"): string {
  if (currency === "INR") {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

/**
 * Format salary range
 */
export function formatSalaryRange(min: number, max: number, currency = "INR"): string {
  return `${formatSalary(min, currency)} – ${formatSalary(max, currency)}`;
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  return `${Math.floor(diffInDays / 30)} months ago`;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format number with K/M suffix
 */
export function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Calculate profile completeness color
 */
export function getCompletionColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 50) return "text-amber-600";
  return "text-red-500";
}

/**
 * Get job type badge color
 */
export function getJobTypeBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    "full-time": "bg-blue-50 text-blue-700 border-blue-200",
    "part-time": "bg-purple-50 text-purple-700 border-purple-200",
    "contract": "bg-amber-50 text-amber-700 border-amber-200",
    "internship": "bg-green-50 text-green-700 border-green-200",
    "remote": "bg-teal-50 text-teal-700 border-teal-200",
  };
  return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
}

/**
 * Get experience level label
 */
export function getExperienceLabel(level: string): string {
  const labels: Record<string, string> = {
    entry: "0–2 yrs",
    mid: "3–5 yrs",
    senior: "5–8 yrs",
    lead: "8–12 yrs",
    executive: "12+ yrs",
  };
  return labels[level] || level;
}
