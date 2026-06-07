"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  trend?: number;
  glowColor?: string;
  className?: string;
  delay?: number;
}

export function StatCard({ label, value, sub, icon, trend, glowColor = "rgba(99,102,241,0.1)", className, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "glass-card rounded-2xl p-5 relative overflow-hidden group cursor-default",
        className
      )}
      style={{ boxShadow: `0 0 40px ${glowColor}` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start justify-between mb-3">
        <span className="text-[11px] text-white/40 font-medium uppercase tracking-widest">{label}</span>
        {icon && <div className="text-white/30">{icon}</div>}
      </div>

      <div className="relative">
        <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
        {sub && <div className="text-[11px] text-white/35 mt-1">{sub}</div>}
        {typeof trend === "number" && (
          <div className={cn("text-[11px] font-semibold mt-1.5 flex items-center gap-1", trend >= 0 ? "text-emerald-400" : "text-red-400")}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs last week
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ActivityFeedItem {
  label: string;
  time: string;
  type: "quiz" | "achievement" | "battle" | "ai";
}

const typeColors = {
  quiz: "bg-indigo-500",
  achievement: "bg-yellow-500",
  battle: "bg-purple-500",
  ai: "bg-cyan-500",
};

interface ActivityFeedProps {
  items: ActivityFeedItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", typeColors[item.type])} />
          <span className="text-xs text-white/60 flex-1">{item.label}</span>
          <span className="text-[10px] text-white/25 shrink-0">{item.time}</span>
        </motion.div>
      ))}
    </div>
  );
}
