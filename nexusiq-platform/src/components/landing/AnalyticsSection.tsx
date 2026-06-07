"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import GlassCard from "@/components/ui/GlassCard";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip
} from "recharts";
import { TrendingUp, Brain, Target, Zap, Activity, ArrowUpRight } from "lucide-react";

const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const FONT_HEADING = "'Syne', 'Space Grotesk', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const radarData = [
  { subject: "Physics", value: 87 },
  { subject: "Math", value: 92 },
  { subject: "Chem", value: 74 },
  { subject: "Biology", value: 95 },
  { subject: "Speed", value: 78 },
  { subject: "Accuracy", value: 89 },
];

const trendData = [
  { day: "Mon", score: 68 },
  { day: "Tue", score: 74 },
  { day: "Wed", score: 71 },
  { day: "Thu", score: 82 },
  { day: "Fri", score: 79 },
  { day: "Sat", score: 88 },
  { day: "Sun", score: 94 },
];

const insights = [
  {
    icon: Brain,
    text: "Confusion spikes detected in Organic Chemistry — 3 revision cards generated",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    icon: Target,
    text: "You perform 23% better in Physics between 9–11 AM — schedule accordingly",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: TrendingUp,
    text: "Burnout risk: Low. Streak is consistent for 7 days. Keep momentum going.",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
];

const metrics = [
  { label: "Questions Attempted", value: "1,240", delta: "+18%", color: "text-indigo-400" },
  { label: "Avg. Accuracy", value: "89.4%", delta: "+5.2%", color: "text-purple-400" },
  { label: "Study Hours", value: "42h", delta: "this week", color: "text-cyan-400" },
];

export default function AnalyticsSection() {
  return (
    <section id="analytics" className="py-32 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-600/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs tracking-wider uppercase mb-6 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}
          >
            <Brain className="w-3 h-3" />
            Intelligence Analytics
          </span>
          <h2
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
            style={{ fontFamily: FONT_HEADING }}
          >
            <span className="gradient-text">Your Performance,</span>
            <br />
            <span className="gradient-text-brand">Decoded by AI</span>
          </h2>
          <p
            className="text-white/45 text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
          >
            50+ behavioral dimensions. Radar analysis. Heatmaps. Confusion tracking.
            Time analytics. All beautifully visualized.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Mastery Radar */}
          <GlassCard delay={0} className="p-8 lg:col-span-1 border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div
                className="text-sm text-white/50 uppercase tracking-widest font-bold"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Mastery Radar
              </div>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ fontFamily: FONT_MONO }}>
                Live
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{
                    fill: "rgba(255,255,255,0.6)",
                    fontSize: 10,
                    fontFamily: FONT_MONO,
                    fontWeight: 600
                  }}
                />
                <Radar
                  dataKey="value"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Trend Chart */}
          <GlassCard delay={0.1} className="p-8 lg:col-span-2 border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <div
                className="text-sm text-white/50 uppercase tracking-widest font-bold"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Performance Trend
              </div>
              <span
                className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full font-bold tracking-wider"
                style={{ fontFamily: FONT_MONO }}
              >
                +38% this week
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10, fontFamily: FONT_MONO, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[50, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(11, 16, 32, 0.9)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                    fontFamily: FONT_MONO,
                    fontWeight: 600
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                  itemStyle={{ color: "#6366F1" }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fill="url(#scoreGrad)"
                  dot={{ fill: "#6366F1", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#8B5CF6", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Mastery Metrics Tile */}
          <GlassCard delay={0.15} className="p-8 lg:col-span-1 border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl flex flex-col justify-between">
            <div
              className="text-sm text-white/50 uppercase tracking-widest font-bold mb-6"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Mastery Metrics
            </div>
            <div className="flex flex-col gap-5">
              {metrics.map((m) => (
                <div key={m.label} className="flex flex-col gap-1.5 pb-4 border-b border-white/[0.04] last:border-0 last:pb-0">
                  <span className="text-white/40 text-xs font-medium uppercase tracking-wider" style={{ fontFamily: FONT_DISPLAY }}>
                    {m.label}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${m.color}`} style={{ fontFamily: FONT_DISPLAY }}>
                      {m.value}
                    </span>
                    <span className="text-[10px] font-bold text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full" style={{ fontFamily: FONT_MONO }}>
                      {m.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* AI Coach Insights */}
          <GlassCard delay={0.2} className="p-8 lg:col-span-4 border border-white/10 bg-white/5 backdrop-blur-md rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-indigo-400 animate-ping opacity-40" />
              </div>
              <div
                className="text-sm text-white/50 uppercase tracking-widest font-bold"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                AI Coach Insights
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider" style={{ fontFamily: FONT_MONO }}>3 new insights</span>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {insights.map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.02 }}
                    className={`flex gap-4 p-5 rounded-2xl border ${insight.bg} ${insight.border} cursor-default transition-all duration-300 group`}
                  >
                    <div className={`p-2.5 rounded-xl ${insight.bg} border ${insight.border} shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-4 h-4 ${insight.color}`} strokeWidth={2} />
                    </div>
                    <p
                      className="text-sm text-white/70 leading-relaxed font-medium group-hover:text-white transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {insight.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Analytics Preview Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 relative group"
        >
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-cyan-500/10 blur-sm" />
          <div className="relative glass-card rounded-3xl overflow-hidden border border-white/[0.06] group-hover:border-indigo-500/20 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050816]/80 via-transparent to-transparent z-10 pointer-events-none" />
            <Image
              src="/analytics-preview.png"
              alt="NexusIQ Analytics Dashboard — AI-powered performance visualization"
              width={1200}
              height={600}
              className="w-full h-auto object-cover opacity-75 group-hover:opacity-90 transition-opacity duration-500"
              priority={false}
            />
            <div className="absolute bottom-6 left-6 z-20 flex items-center gap-3">
              <div className="glass-card rounded-xl px-4 py-2.5 border border-white/10 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs text-white/70 font-medium" style={{ fontFamily: FONT_DISPLAY }}>
                  Live Analytics Preview
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
