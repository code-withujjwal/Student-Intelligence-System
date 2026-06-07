"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  pulse?: boolean;
}

export function Skeleton({ className, pulse = true }: SkeletonProps) {
  return (
    <motion.div
      animate={pulse ? { opacity: [0.5, 0.8, 0.5] } : undefined}
      transition={pulse ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
      className={cn("bg-white/[0.06] rounded-lg", className)}
    />
  );
}

interface SkeletonLoaderProps {
  variant?: "stat" | "chart" | "card" | "grid";
  count?: number;
}

export function SkeletonLoader({ variant = "stat", count = 1 }: SkeletonLoaderProps) {
  const containerClass = "space-y-3";

  if (variant === "stat") {
    return (
      <div className={containerClass}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 flex-1" />
          ))}
        </div>
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {Array.from({ length: count || 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
}
