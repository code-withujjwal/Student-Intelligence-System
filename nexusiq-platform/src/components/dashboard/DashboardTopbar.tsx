"use client";

import { motion } from "framer-motion";
import { Search, Bell, Command } from "lucide-react";

interface DashboardTopbarProps {
  title?: string;
  subtitle?: string;
}

export default function DashboardTopbar({ title = "Command Center", subtitle = "Your intelligence hub" }: DashboardTopbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6 bg-[#070d1f]/60 backdrop-blur-md shrink-0"
    >
      <div>
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        <p className="text-[11px] text-white/30">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <button className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white/30 hover:border-white/10 hover:bg-white/[0.06] transition-all group">
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="ml-6 px-1.5 py-0.5 rounded bg-white/5 text-[9px] border border-white/10 font-mono">⌘K</kbd>
        </button>

        <button className="relative p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-glow-sm" />
        </button>

        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer">
          S
        </div>
      </div>
    </motion.header>
  );
}
