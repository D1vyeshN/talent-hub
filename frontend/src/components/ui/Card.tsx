import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

const variantClasses: Record<string, string> = {
  default: "bg-white border border-gray-200 shadow-sm",
  bordered: "bg-white border border-gray-300",
  elevated: "bg-white border border-gray-100 shadow-md",
  flat: "bg-gray-50",
};

const paddingClasses: Record<string, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  hoverable = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-xl transition-all duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        hoverable && "cursor-pointer hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3 className={cn("text-base font-semibold text-gray-900", className)} {...props}>
      {children}
    </h3>
  );
}
