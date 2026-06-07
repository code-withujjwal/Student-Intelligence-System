"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import {
  Brain, Zap, BarChart3, Shield, Users, Target,
  Cpu, Globe, Flame, ArrowUpRight
} from "lucide-react";

const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const FONT_HEADING = "'Syne', 'Space Grotesk', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const features = [
  {
    icon: Brain,
    title: "AI Performance Coach",
    description: "Real-time behavioral analysis. The AI identifies careless mistakes, fatigue patterns, and guessing tendencies before you do.",
    gradient: "from-indigo-500/15 to-purple-500/8",
    iconBg: "bg-indigo-500/15 border-indigo-500/30",
    iconColor: "text-indigo-400",
    border: "border-indigo-500/20",
    glow: "indigo" as const,
    badge: "Neural AI",
    badgeColor: "text-indigo-300 bg-indigo-500/10 border-indigo-500/20",
    span: "lg:col-span-2",
    highlight: true,
  },
  {
    icon: BarChart3,
    title: "Intelligence Analytics",
    description: "Heatmaps, radar charts, time-per-question analysis, and behavioral tracking across 50+ performance dimensions.",
    gradient: "from-cyan-500/15 to-indigo-500/8",
    iconBg: "bg-cyan-500/15 border-cyan-500/30",
    iconColor: "text-cyan-400",
    border: "border-cyan-500/20",
    glow: "cyan" as const,
    badge: "Deep Analytics",
    badgeColor: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20",
    span: "lg:col-span-2",
    highlight: true,
  },
  {
    icon: Zap,
    title: "Live Quiz Battles",
    description: "Multiplayer real-time battles with WebSocket-powered leaderboards. Compete globally in tournament brackets.",
    gradient: "from-purple-500/15 to-pink-500/8",
    iconBg: "bg-purple-500/15 border-purple-500/30",
    iconColor: "text-purple-400",
    border: "border-purple-500/20",
    glow: "purple" as const,
    badge: "Real-Time",
    badgeColor: "text-purple-300 bg-purple-500/10 border-purple-500/20",
    span: "",
    highlight: false,
  },
  {
    icon: Shield,
    title: "AI Proctoring Engine",
    description: "Tab-switch detection, eye-tracking analysis, and behavioral biometrics ensure integrity without friction.",
    gradient: "from-red-500/10 to-orange-500/8",
    iconBg: "bg-red-500/10 border-red-500/30",
    iconColor: "text-red-400",
    border: "border-red-500/20",
    glow: "none" as const,
    badge: "Enterprise",
    badgeColor: "text-red-300 bg-red-500/10 border-red-500/20",
    span: "",
    highlight: false,
  },
  {
    icon: Target,
    title: "Adaptive Quiz Engine",
    description: "Dynamic difficulty adjustment based on your live performance. Questions evolve with your knowledge state.",
    gradient: "from-green-500/10 to-emerald-500/8",
    iconBg: "bg-green-500/10 border-green-500/30",
    iconColor: "text-green-400",
    border: "border-green-500/20",
    glow: "none" as const,
    badge: "Adaptive AI",
    badgeColor: "text-green-300 bg-green-500/10 border-green-500/20",
    span: "",
    highlight: false,
  },
  {
    icon: Flame,
    title: "Gamification System",
    description: "XP system, levels, achievements, daily streaks, seasonal events, and skill trees that make learning addictive.",
    gradient: "from-orange-500/10 to-yellow-500/8",
    iconBg: "bg-orange-500/10 border-orange-500/30",
    iconColor: "text-orange-400",
    border: "border-orange-500/20",
    glow: "none" as const,
    badge: "Engagement",
    badgeColor: "text-orange-300 bg-orange-500/10 border-orange-500/20",
    span: "",
    highlight: false,
  },
  {
    icon: Users,
    title: "Organization Platform",
    description: "Classroom management, coaching institute dashboards, corporate assessments, and recruiter portals.",
    gradient: "from-blue-500/10 to-cyan-500/8",
    iconBg: "bg-blue-500/10 border-blue-500/30",
    iconColor: "text-blue-400",
    border: "border-blue-500/20",
    glow: "none" as const,
    badge: "Enterprise",
    badgeColor: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    span: "",
    highlight: false,
  },
  {
    icon: Cpu,
    title: "Coding Evaluator",
    description: "In-browser IDE with AI code review, unit test generation, efficiency scoring, and multi-language support.",
    gradient: "from-violet-500/10 to-indigo-500/8",
    iconBg: "bg-violet-500/10 border-violet-500/30",
    iconColor: "text-violet-400",
    border: "border-violet-500/20",
    glow: "none" as const,
    badge: "Dev Tools",
    badgeColor: "text-violet-300 bg-violet-500/10 border-violet-500/20",
    span: "",
    highlight: false,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/8 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs tracking-wider uppercase mb-6 shadow-glow-sm"
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}
          >
            <Globe className="w-3 h-3" />
            Platform Capabilities
          </span>
          <h2
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
            style={{ fontFamily: FONT_HEADING }}
          >
            <span className="gradient-text">Everything You Need</span>
            <br />
            <span className="gradient-text-brand">To Become Elite</span>
          </h2>
          <p
            className="text-white/45 text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
          >
            Built for students, teachers, coaching institutes, companies, and
            recruiters — the most comprehensive intelligence platform ever built.
          </p>
        </motion.div>

        {/* Feature Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <GlassCard
                key={feature.title}
                delay={i * 0.06}
                glowColor={feature.glow}
                magnetic
                className={`p-6 group cursor-pointer border ${feature.border} hover:border-opacity-60 transition-all duration-500 relative overflow-hidden ${feature.span}`}
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                {/* Shimmer on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 shimmer-line" />
                </div>

                <div className="relative">
                  {/* Top row: icon + badge */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`p-2.5 rounded-xl border ${feature.iconBg} transition-all duration-300 group-hover:scale-110`}>
                      <Icon className={`w-5 h-5 ${feature.iconColor}`} strokeWidth={1.5} />
                    </div>
                    <span
                      className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border ${feature.badgeColor}`}
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-base font-semibold text-white mb-2.5 group-hover:text-white transition-colors"
                    style={{ fontFamily: FONT_DISPLAY }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm text-white/45 leading-relaxed group-hover:text-white/60 transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {feature.description}
                  </p>

                  {/* CTA Link */}
                  <div className="mt-5 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                    <span className={feature.iconColor} style={{ fontFamily: FONT_DISPLAY }}>
                      Explore feature
                    </span>
                    <ArrowUpRight className={`w-3.5 h-3.5 ${feature.iconColor}`} />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
