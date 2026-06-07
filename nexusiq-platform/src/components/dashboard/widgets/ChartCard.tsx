"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import { LucideIcon } from "lucide-react";

interface ChartBarProps {
  label: string;
  value: number;
  max?: number;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  bars: ChartBarProps[];
  glowColor?: "indigo" | "purple" | "cyan" | "none";
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function ChartCard({
  title,
  subtitle,
  icon: Icon,
  bars,
  glowColor = "purple",
  action,
}: ChartCardProps) {
  const maxValue = Math.max(...bars.map((b) => b.value));

  return (
    <GlassCard glowColor={glowColor} animate className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3 flex-1">
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Icon className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            {subtitle && (
              <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="px-3 py-1.5 text-xs font-medium text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.12] rounded-lg transition-all"
          >
            {action.label}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {bars.map((bar, idx) => (
          <motion.div
            key={bar.label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-white/70">{bar.label}</span>
              <span className="text-xs font-semibold text-white">{bar.value}</span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500"
                initial={{ width: 0 }}
                whileInView={{ width: `${(bar.value / maxValue) * 100}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-4 pt-4 border-t border-white/[0.06] text-[11px] text-white/40 flex items-center justify-between"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <span>Last updated today</span>
        <span className="text-white/20">•</span>
        <span className="text-indigo-400/80">Real-time</span>
      </motion.div>
    </GlassCard>
  );
}
