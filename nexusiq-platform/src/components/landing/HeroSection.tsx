"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Image from "next/image";
import GlassCard from "@/components/ui/GlassCard";
import NeuralOrb from "@/components/ui/NeuralOrb";
import { TrendingUp, Brain, Shield, Target, Zap, Trophy, Sparkles, Activity } from "lucide-react";

const floatingCards = [
  {
    icon: TrendingUp,
    label: "Accuracy",
    value: "94.7%",
    sub: "+12% this week",
    color: "text-indigo-400",
    glow: "rgba(99,102,241,0.2)",
    border: "border-indigo-500/20",
    position: "top-4 -left-4 md:top-8 md:-left-28",
    delay: 0.65,
    badge: "↑",
    badgeColor: "text-green-400",
  },
  {
    icon: Brain,
    label: "AI Coach",
    value: "Active",
    sub: "3 insights ready",
    color: "text-purple-400",
    glow: "rgba(139,92,246,0.2)",
    border: "border-purple-500/20",
    position: "top-4 -right-4 md:top-8 md:-right-28",
    delay: 0.85,
    badge: "●",
    badgeColor: "text-purple-400",
  },
  {
    icon: Trophy,
    label: "Global Rank",
    value: "#142",
    sub: "Top 2% nationwide",
    color: "text-yellow-400",
    glow: "rgba(250,204,21,0.2)",
    border: "border-yellow-500/20",
    position: "bottom-12 -left-4 md:bottom-16 md:-left-28",
    delay: 1.05,
    badge: "🏆",
    badgeColor: "",
  },
  {
    icon: Target,
    label: "Daily Goal",
    value: "80%",
    sub: "4/5 tasks done",
    color: "text-cyan-400",
    glow: "rgba(6,182,212,0.2)",
    border: "border-cyan-500/20",
    position: "bottom-12 -right-4 md:bottom-16 md:-right-28",
    delay: 1.25,
    badge: "◎",
    badgeColor: "text-cyan-400",
  },
];

const stats = [
  { value: "2.4M+", label: "Questions Solved", color: "from-indigo-400 to-purple-400" },
  { value: "98K+", label: "Active Learners", color: "from-purple-400 to-cyan-400" },
  { value: "99.2%", label: "Uptime SLA", color: "from-cyan-400 to-indigo-400" },
];

const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif";
const FONT_HEADING = "'Syne', 'Space Grotesk', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 hero-mesh" />
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute inset-0 noise-overlay" />

      {/* Ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px] animate-float-slow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-7"
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs tracking-wider uppercase shadow-glow-sm"
            style={{ fontFamily: FONT_DISPLAY, fontWeight: 600 }}
          >
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Sparkles className="w-3 h-3" />
            </motion.span>
            AI-Powered Intelligence Platform
            <span className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-400" style={{ fontFamily: FONT_MONO }}>LIVE</span>
            </span>
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.04] mb-6 max-w-5xl"
          style={{ fontFamily: FONT_HEADING }}
        >
          <span className="gradient-text-warm">Your Intelligence</span>
          <br />
          <span className="gradient-text">Has Patterns.</span>
          <br />
          <motion.span
            className="gradient-text-brand glow-text-indigo relative inline-block"
            animate={{
              backgroundPosition: ["0% center", "200% center"],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{
              backgroundImage: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #06B6D4 70%, #6366F1 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            We Reveal Them.
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mb-10 leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
        >
          The next-generation AI performance intelligence operating system.
          Adaptive quizzes, behavioral analytics, live battles, and a personal
          AI coach — all in one cinematic platform.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20"
        >
          <Link to="/auth/signup"
            className="btn-primary px-8 py-4 rounded-xl text-white font-semibold text-sm flex items-center gap-2 group shadow-glow-md"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            Start for Free
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="inline-block"
            >
              →
            </motion.span>
          </Link>
          <Link to="#features"
            className="btn-ghost px-8 py-4 rounded-xl text-white/70 hover:text-white font-medium text-sm group"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
              See how it works
            </span>
          </Link>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl mx-auto"
        >
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-indigo-500/25 via-purple-500/20 to-cyan-500/20 blur-sm" />

            <GlassCard className="relative p-6 md:p-10 rounded-3xl overflow-hidden" animate={false}>
              {/* Scan line */}
              <div className="scan-line" />

              {/* Inner gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/10 pointer-events-none" />

              {/* Central Neural Orb */}
              <div className="relative flex items-center justify-center py-4">
                <NeuralOrb />
              </div>

              {/* Subject Mastery Grid */}
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { label: "Physics", val: 87, color: "#6366F1", bg: "rgba(99,102,241,0.12)" },
                  { label: "Math", val: 92, color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
                  { label: "Chemistry", val: 74, color: "#06B6D4", bg: "rgba(6,182,212,0.12)" },
                  { label: "Biology", val: 95, color: "#10B981", bg: "rgba(16,185,129,0.12)" },
                ].map((subject, i) => (
                  <motion.div
                    key={subject.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-card rounded-xl p-3 group hover:scale-[1.03] transition-transform duration-300"
                    style={{ background: subject.bg, borderColor: `${subject.color}30` }}
                  >
                    <div className="text-xs text-white/55 mb-2 font-medium" style={{ fontFamily: FONT_DISPLAY }}>
                      {subject.label}
                    </div>
                    <div
                      className="text-lg font-bold text-white mb-2"
                      style={{ fontFamily: FONT_DISPLAY, color: subject.color }}
                    >
                      {subject.val}%
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.val}%` }}
                        transition={{ duration: 1.8, delay: 1.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${subject.color}99, ${subject.color})` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom status bar */}
              <div className="relative flex items-center justify-between mt-5 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                  <span className="text-[10px] text-emerald-400/80 font-medium" style={{ fontFamily: FONT_MONO }}>
                    AI Coach Online
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="data-bar">
                    <span style={{ height: '40%' }} />
                    <span style={{ height: '60%', animationDelay: '0.15s' }} />
                    <span style={{ height: '100%', animationDelay: '0.3s' }} />
                    <span style={{ height: '75%', animationDelay: '0.45s' }} />
                  </div>
                  <span className="text-[10px] text-white/30" style={{ fontFamily: FONT_MONO }}>Processing</span>
                </div>
                <span className="text-[10px] text-white/30" style={{ fontFamily: FONT_MONO }}>NexusIQ v2.4</span>
              </div>
            </GlassCard>

            {/* Floating Stat Cards */}
            {floatingCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, scale: 0.75, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: card.delay, ease: [0.16, 1, 0.3, 1] }}
                  className={`absolute ${card.position} z-20 hidden md:block`}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: card.delay }}
                  >
                    <div
                      className={`glass-card rounded-2xl p-4 min-w-[148px] border ${card.border} cursor-default`}
                      style={{ boxShadow: `0 0 30px ${card.glow}, 0 8px 32px rgba(0,0,0,0.5)` }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                          <span
                            className="text-[10px] text-white/50 uppercase tracking-wider"
                            style={{ fontFamily: FONT_MONO, fontWeight: 500 }}
                          >
                            {card.label}
                          </span>
                        </div>
                        <span className={`text-[11px] ${card.badgeColor}`}>{card.badge}</span>
                      </div>
                      <div
                        className={`text-xl font-bold ${card.color}`}
                        style={{ fontFamily: FONT_DISPLAY }}
                      >
                        {card.value}
                      </div>
                      <div className="text-[11px] text-white/35 mt-0.5" style={{ fontFamily: FONT_MONO }}>
                        {card.sub}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-8 md:gap-16 mt-16 pt-8 border-t border-white/[0.06]"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span
                className="text-2xl md:text-3xl font-extrabold tracking-tight"
                style={{
                  fontFamily: FONT_DISPLAY,
                  backgroundImage: `linear-gradient(135deg, ${stat.color.split(' ').join(', ')})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </span>
              <span
                className="text-xs text-white/35 mt-1 font-medium tracking-wide"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
