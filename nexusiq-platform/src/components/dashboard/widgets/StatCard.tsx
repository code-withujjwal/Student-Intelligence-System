"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  glowColor?: "indigo" | "purple" | "cyan" | "none";
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  glowColor = "indigo",
  onClick,
}: StatCardProps) {
  return (
    <GlassCard
      glowColor={glowColor}
      animate
      magnetic
      className={cn("p-4 md:p-6 cursor-pointer", onClick && "hover:scale-105")}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm text-white/50 font-medium uppercase tracking-wider mb-2">
            {title}
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-baseline gap-2 mb-3"
          >
            <span className="text-2xl md:text-3xl font-bold text-white font-display">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.isPositive ? "text-emerald-400" : "text-red-400"
                )}
              >
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </motion.div>
          {subtitle && (
            <p className="text-[11px] md:text-xs text-white/40">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center"
          >
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" strokeWidth={1.5} />
          </motion.div>
        )}
      </div>

      {/* Micro progress bar */}
      <motion.div
        className="h-1 bg-white/[0.06] rounded-full overflow-hidden mt-3"
        initial={{ width: 0 }}
        whileInView={{ width: "100%" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          whileInView={{ width: "65%" }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
      </motion.div>
    </GlassCard>
  );
}
