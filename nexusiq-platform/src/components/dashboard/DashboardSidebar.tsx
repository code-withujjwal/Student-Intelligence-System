import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Brain, Target, Trophy, Zap, Users,
  Settings, LogOut, ChevronLeft, BarChart3, Sword, BookOpen,
  FlaskConical, PanelLeftClose, PanelLeftOpen, Sparkles
} from "lucide-react";


const navGroups = [
  {
    label: "Core",
    items: [
      { icon: LayoutDashboard, label: "Command Center", href: "/dashboard" },
      { icon: Brain, label: "AI Coach", href: "/dashboard/ai-coach", badge: "AI" },
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    ],
  },
  {
    label: "Learn",
    items: [
      { icon: Target, label: "Quiz Arena", href: "/quiz" },
      { icon: Sparkles, label: "AI Generate", href: "/quiz/create", badge: "AI" },
      { icon: BookOpen, label: "Karl-Log", href: "/dashboard/mistakes" },
      { icon: FlaskConical, label: "Practice", href: "/dashboard/practice" },
    ],
  },
  {
    label: "Compete",
    items: [
      { icon: Sword, label: "Battles", href: "/dashboard/battles", badge: "Live" },
      { icon: Trophy, label: "Leaderboard", href: "/dashboard/leaderboard" },
    ],
  },
  {
    label: "Social",
    items: [
      { icon: Users, label: "Classroom", href: "/dashboard/classroom" },
    ],
  },
];

interface DashboardSidebarProps {
  userName?: string;
  userLevel?: number;
  userXP?: number;
  userRole?: string;
}

export default function DashboardSidebar({ userName = "Student", userLevel = 1, userXP = 0, userRole = "STUDENT" }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const xpProgress = (userXP % 1000) / 10;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex-shrink-0 h-screen bg-[#070d1f] border-r border-white/[0.06] flex flex-col overflow-hidden"
    >
      <div className={cn("flex items-center p-4 border-b border-white/[0.06]", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow-sm">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-white">Nexus<span className="gradient-text-brand">IQ</span></span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {userName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{userName}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">{userRole}</div>
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-medium mb-1.5">
            <span className="text-indigo-300">Level {userLevel}</span>
            <span className="text-white/30">{userXP} XP</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-2 mb-1 text-[10px] text-white/25 font-semibold uppercase tracking-widest">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 group relative",
                      active
                        ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                        : "text-white/45 hover:text-white hover:bg-white/[0.05]",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("shrink-0", active ? "text-indigo-400" : "text-white/40 group-hover:text-white/70")} style={{ width: 15, height: 15 }} strokeWidth={active ? 2 : 1.5} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold tracking-wide">
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-indigo-500/10"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("p-2 border-t border-white/[0.06] space-y-0.5")}>
        <Link to="/dashboard/settings"
          className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <Settings style={{ width: 15, height: 15 }} strokeWidth={1.5} />
          {!collapsed && "Settings"}
        </Link>
        <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
          <LogOut style={{ width: 15, height: 15 }} strokeWidth={1.5} />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </motion.aside>
  );
}
