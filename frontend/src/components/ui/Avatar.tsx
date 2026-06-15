import { cn, getInitials } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
  shape?: "circle" | "squre";
}

const sizeClasses: Record<string, string> = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const imageSize = {
  xs: { width: 24, height: 24 },
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
};

const statusColors: Record<string, string> = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-amber-500",
};

// Generate consistent color from name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-amber-500",
    "bg-red-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function Avatar({
  name = "Unknown", src, size = "md", className, showStatus = false, status = "offline", shape = "circle",
}: AvatarProps) {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);
  return (
    <div className={cn("relative inline-flex flex-shrink-0", className)}>
      {src && /^https?:\/\/.+/i.test(src) ? (
        <Image
          src={src}
          alt={name}
          className={cn("object-cover", sizeClasses[size], shape === "squre" ? "rounded-lg" : "rounded-full")}
          width={imageSize[size].width}
          height={imageSize[size].height}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center font-semibold text-white",
            shape === "squre" ? "rounded-lg" : "rounded-full",
            sizeClasses[size],
            colorClass
          )}
          aria-label={name}
        >
          {initials}
        </div>
      )}
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            size === "xs" ? "w-1.5 h-1.5" : "w-2.5 h-2.5",
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}
