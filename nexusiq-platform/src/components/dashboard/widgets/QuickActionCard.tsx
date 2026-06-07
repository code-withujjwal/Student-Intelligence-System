"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import { LucideIcon, ArrowRight } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: "indigo" | "purple" | "cyan";
  action: {
    label: string;
    onClick: () => void;
  };
  glowColor?: "indigo" | "purple" | "cyan" | "none";
}

const colorClasses = {
  indigo: {
    bg: "from-indigo-500/20 to-indigo-600/10",
    icon: "text-indigo-400",
    gradient: "from-indigo-500 to-indigo-600",
  },
  purple: {
    bg: "from-purple-500/20 to-purple-600/10",
    icon: "text-purple-400",
    gradient: "from-purple-500 to-purple-600",
  },
  cyan: {
    bg: "from-cyan-500/20 to-cyan-600/10",
    icon: "text-cyan-400",
    gradient: "from-cyan-500 to-cyan-600",
  },
};

export default function QuickActionCard({
  title,
  description,
  icon: Icon,
  color = "indigo",
  action,
  glowColor = "indigo",
}: QuickActionCardProps) {
  const colors = colorClasses[color];

  return (
    <GlassCard glowColor={glowColor} animate className="p-5 md:p-6 relative overflow-hidden">
      {/* Background gradient orb */}
      <motion.div
        className={cn(
          "absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20",
          `bg-gradient-to-br ${colors.bg}`
        )}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
              `${colors.bg}`
            )}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Icon className={cn("w-5 h-5 md:w-6 md:h-6", colors.icon)} strokeWidth={1.5} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-white">{title}</h3>
            <p className="text-xs md:text-sm text-white/50 mt-1">{description}</p>
          </div>
        </div>

        <MagneticButton
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="w-full text-xs md:text-sm"
        >
          <span>{action.label}</span>
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2} />
        </MagneticButton>
      </div>
    </GlassCard>
  );
}
