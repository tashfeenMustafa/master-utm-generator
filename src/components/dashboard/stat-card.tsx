"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  const trendColor = {
    up: "text-indigo-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  }[trend || "neutral"];

  return (
    <div
      className={cn(
        "rounded-[10px] border border-indigo-100 bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-indigo-950">
            {value}
          </p>
          {description && (
            <p className="mt-2 text-xs text-muted-foreground">{description}</p>
          )}
          {trendValue && (
            <p className={cn("mt-2 text-xs font-medium", trendColor)}>
              {trend === "up" && "↑"} {trend === "down" && "↓"} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
