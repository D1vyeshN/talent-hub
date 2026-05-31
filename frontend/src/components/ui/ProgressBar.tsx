import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "amber" | "red" | "purple";
  className?: string;
  animated?: boolean;
}

const colorClasses: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

const heightClasses: Record<string, string> = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value, label, showValue = false, size = "md",
  color = "blue", className, animated = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showValue && <span className="text-sm font-medium text-gray-700">{clamped}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-gray-100 rounded-full overflow-hidden", heightClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorClasses[color],
            animated && "animate-pulse"
          )}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
