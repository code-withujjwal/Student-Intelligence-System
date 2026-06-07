import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import {
  Award, Shield, Zap, Target, Lock, CheckCircle2, ChevronRight,
  TrendingUp, Award as AwardIcon, Gift, Play, Settings, Bell, ArrowLeft, Cpu, Activity, Database
} from 'lucide-react';

interface BadgeStyle {
  border: string;
  text: string;
  glow: string;
}

interface Badge {
  id: string;
  name: string;
  category: string;
  requirement: string;
  description: string;
  minLevel: number;
  style: BadgeStyle;
  isUnlocked?: boolean;
}

interface CadetTelemetry {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  domainTokens: Record<string, number>;
  badges: Badge[];
}

const STATIC_BADGES: Badge[] = [
  { id: "TIER_01", name: "LOGIC CADET", category: "Level 01-05", requirement: "Unlocked at Level 1. Base initialization phase.", description: "Foundational syntax patterns compiled. Systems online.", minLevel: 1, style: { border: "border-slate-500/30", text: "text-slate-400", glow: "shadow-[0_0_10px_rgba(148,163,184,0.1)]" } },
  { id: "TIER_02", name: "STACK ARBITER", category: "Level 06-10", requirement: "Requires Level 6 + Linear Structures mastery >= 70%.", description: "Successfully calibrated sequential stacks, pointers, and queues.", minLevel: 6, style: { border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-[0_0_12px_rgba(59,130,246,0.15)]" } },
  { id: "TIER_03", name: "REMEDIATION REAPER", category: "Level 11-15", requirement: "Requires Level 11 + Patching 15 historical quiz errors.", description: "Isolates and systematically obliterates concept vulnerabilities via the Re-Calibration console.", minLevel: 11, style: { border: "border-cyan-500/40", text: "text-cyan-400", glow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]" } },
  { id: "TIER_04", name: "ALGORITHMIC VISCOUNT", category: "Level 16-20", requirement: "Requires Level 16 + Global Subject Health >= 75%.", description: "Maintains balanced multi-subject cross-compilation execution under timeline pressure.", minLevel: 16, style: { border: "border-amber-500/40", text: "text-amber-400", glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]" } },
  { id: "TIER_05", name: "VELOCITY KERNEL", category: "Level 21-25", requirement: "Requires Level 21 + 5 'Zero-G Sprint' flawless submissions.", description: "Achieved absolute cognitive velocity. Resolves complex algorithmic nodes under 15s.", minLevel: 21, style: { border: "border-purple-500/40", text: "text-purple-400", glow: "shadow-[0_0_15px_rgba(168,85,247,0.2)]" } },
  { id: "TIER_06", name: "SYSTEM ARCHITECT", category: "Level 26+", requirement: "Requires Level 26 + Absolute Syllabus Master Status (90%+ All Core Tracks).", description: "Peak cognitive optimization. Full network control established. Ultimate platform clearance.", minLevel: 26, style: { border: "border-emerald-500/60 animate-pulse", text: "text-emerald-400 font-extrabold", glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]" } }
];

const CADET_TELEMETRY: CadetTelemetry = {
  currentLevel: 14,
  currentXP: 4850,
  nextLevelXP: 6000,
  domainTokens: { DSA: 120, DBMS: 85, OS: 40, CN: 10, OOP: 95 },
  badges: STATIC_BADGES
};

const MICRO_TOKEN_LOGS = [
  { id: "LOG_01", type: "XP_BOOST", change: "+150 XP", description: "Obliterated AVL Rotation Anomaly", timestamp: "03 mins ago", color: "text-[#34d399]" },
  { id: "LOG_02", type: "DSA_TOKENS", change: "+15 DSA", description: "Completed Unit 3 Sessional Paper", timestamp: "12 mins ago", color: "text-[#6366F1]" },
  { id: "LOG_03", type: "XP_BOOST", change: "+50 XP", description: "System Diagnostic Run Nominal", timestamp: "1 hr ago", color: "text-[#22d3ee]" },
  { id: "LOG_04", type: "OOP_TOKENS", change: "+10 OOP", description: "Resolved Exception Hierarchy Node", timestamp: "4 hrs ago", color: "text-[#f59e0b]" },
  { id: "LOG_05", type: "DBMS_TOKENS", change: "+25 DBMS", description: "Corrected Transaction Serialization", timestamp: "1 day ago", color: "text-[#22d3ee]" }
];

const DOMAIN_DETAILS: Record<string, { label: string; color: string; maxVal: number }> = {
  DSA: { label: 'Data Structures & Algos', color: '#6366F1', maxVal: 150 },
  DBMS: { label: 'Database Systems', color: '#22d3ee', maxVal: 100 },
  OS: { label: 'Operating Systems', color: '#a78bfa', maxVal: 80 },
  CN: { label: 'Computer Networks', color: '#34d399', maxVal: 50 },
  OOP: { label: 'Object Oriented Java', color: '#f59e0b', maxVal: 100 },
};

export default function AegisAchievements() {
  const navigate = useNavigate();

  const [telemetry, setTelemetry] = useState<CadetTelemetry | null>(null);
  const [loading, setLoading] = useState(true);

  const [sandboxOverrides, setSandboxOverrides] = useState<Record<string, boolean>>({
    THEME_MONOCHROME_OVERRIDE: false,
    '3D_MESH_CANVAS_BOOST': true,
    FAST_VELOCITY_PROCTOR: false,
  });

  const toggleOverride = (key: string) => {
    setSandboxOverrides(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await axiosInstance.get('/user/profile/achievements');
        const data = res.data.data;
        const fetchedBadges = STATIC_BADGES.map(badge => ({
          ...badge,
          isUnlocked: data.unlockedBadges.includes(badge.id)
        }));
        setTelemetry({
          currentLevel: data.currentLevel,
          currentXP: data.currentXP,
          nextLevelXP: data.nextLevelXP,
          domainTokens: data.domainTokens || { DSA: 10, DBMS: 5, OS: 5, CN: 5, OOP: 10 },
          badges: fetchedBadges
        });
      } catch (error) {
        console.error("Failed to load achievements from backend", error);
        const fallbackBadges = STATIC_BADGES.map(badge => ({
          ...badge,
          isUnlocked: 14 >= badge.minLevel
        }));
        setTelemetry({
          ...CADET_TELEMETRY,
          badges: fallbackBadges
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTelemetry();
  }, []);

  const activeTelemetry = telemetry || CADET_TELEMETRY;
  const levelProgressPct = Math.round((activeTelemetry.currentXP / activeTelemetry.nextLevelXP) * 100);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-slate-100"
      style={{ background: '#060912', fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 10% 80%, rgba(34,211,238,0.03) 0%, transparent 55%)'
        }}
      />

      <header
        className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(6,9,18,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/features')}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5 mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="tracking-widest font-extrabold uppercase text-[0.6rem] text-[#6366F1] flex items-center gap-1.5 font-mono">
                <Shield className="w-3 h-3 text-[#6366F1]" /> Security Core [ACT_02]
              </p>
              <h1 className="text-sm font-bold text-white tracking-wide mt-0.5 font-mono">
                OPERATIVE PERFORMANCE HUB
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="font-mono text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[0.65rem] font-bold text-[#10b981]">SYSTEM_OPTIMAL</span>
            </div>
            <div className="relative w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" className="animate-spin" style={{ animationDuration: '6s', color: '#6366F1' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" fill="none" opacity="0.4" />
                <circle cx="12" cy="12" r="6" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 4" fill="none" opacity="0.6" />
              </svg>
              <div className="absolute w-1.5 h-1.5 rounded-full bg-[#6366F1] shadow-[0_0_8px_#6366F1]" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 14 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          <section className="lg:col-span-4 flex flex-col gap-6">
            <div className="p-1 rounded-lg bg-slate-900/60 border border-white/5 w-fit">
              <span className="font-mono text-[0.6rem] font-extrabold uppercase text-slate-500 px-2 py-1 block">
                [ LEVEL TELEMETRY ENGINE ]
              </span>
            </div>

            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Cpu className="w-32 h-32 text-white" />
              </div>

              <div>
                <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest font-mono">
                  Cadet Classification
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white font-mono mt-1 uppercase">
                  LEVEL {activeTelemetry.currentLevel} ARCHITECT
                </h2>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-2">
                  <span className="text-slate-400">PROGRESSION RATION</span>
                  <span className="text-[#6366F1]">{activeTelemetry.currentXP} / {activeTelemetry.nextLevelXP} XP</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-950 border border-white/5 overflow-hidden p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgressPct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#22d3ee] shadow-[0_0_8px_#6366F1]"
                  />
                </div>

                <span className="text-[0.58rem] font-mono text-slate-600 mt-2 block text-right font-semibold">
                  {levelProgressPct}% UNLOCKED TO NEXT LEVEL
                </span>
              </div>
            </div>

            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest font-mono block mb-5">
                  Active Domain Matrix Tickers
                </span>

                <div className="space-y-4">
                  {Object.entries(activeTelemetry.domainTokens).map(([key, val]) => {
                    const info = DOMAIN_DETAILS[key];
                    const maxVal = info ? info.maxVal : 100;
                    const pct = Math.min(100, Math.round((val / maxVal) * 100));

                    return (
                      <div key={key} className="space-y-1.5 group">
                        <div className="flex items-center justify-between font-mono text-[0.65rem] font-bold">
                          <span
                            className="px-1.5 py-0.5 rounded tracking-wide transition-all"
                            style={{
                              background: `${info?.color || '#6366F1'}15`,
                              color: info?.color || '#6366F1',
                              border: `1px solid ${info?.color || '#6366F1'}30`
                            }}
                          >
                            {key}
                          </span>
                          <span
                            className="font-mono font-bold transition-all"
                            style={{ color: info?.color || '#cbd5e1' }}
                          >
                            {val} <span className="text-slate-600">/ {maxVal} TOKENS</span>
                          </span>
                        </div>

                        <div className="w-full h-1.5 bg-slate-950/80 border border-white/5 rounded-full overflow-hidden p-0.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                            className="h-full rounded-full transition-all group-hover:brightness-110"
                            style={{
                              background: info?.color || '#6366F1',
                              boxShadow: `0 0 6px ${info?.color || '#6366F1'}`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between font-mono text-[0.6rem] font-bold text-slate-600">
                <span>Domain Status Check</span>
                <span className="text-[#34d399] flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#34d399]" /> Live Stream Active
                </span>
              </div>
            </div>
          </section>

          <section className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-1 rounded-lg bg-slate-900/60 border border-white/5 w-fit">
              <span className="font-mono text-[0.6rem] font-extrabold uppercase text-slate-500 px-2 py-1 block">
                [ MILESTONE COMPILATION MATRIX ]
              </span>
            </div>

            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex-1 space-y-4 max-h-[820px] overflow-y-auto scrollbar-hide">
              {activeTelemetry.badges.map(badge => {
                const isUnlocked = badge.isUnlocked !== undefined ? badge.isUnlocked : activeTelemetry.currentLevel >= badge.minLevel;

                return (
                  <div key={badge.id} className="relative">
                    {!isUnlocked ? (
                      <div
                        className="absolute inset-0 rounded-xl z-20 flex flex-col items-center justify-center gap-1.5 select-none"
                        style={{
                          background: 'rgba(6,9,18,0.75)',
                          backdropFilter: 'blur(5px)',
                          border: '1px dashed rgba(255,255,255,0.06)'
                        }}
                      >
                        <Lock className="w-5 h-5 text-slate-500" />
                        <span className="font-mono text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">
                          TIER_LOCKED
                        </span>
                        <span className="font-mono text-[0.52rem] text-slate-600 font-semibold uppercase">
                          Target: Level {badge.minLevel} Required
                        </span>
                      </div>
                    ) : null}

                    <div
                      className={`rounded-xl p-4.5 border transition-all duration-300 relative group flex items-start gap-4 ${
                        isUnlocked
                          ? `${badge.style.border} bg-[#0b0f19]/30 hover:scale-[1.01] ${badge.style.glow}`
                          : 'opacity-35 border-dashed border-slate-800'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                          isUnlocked
                            ? `bg-slate-950 ${badge.style.border}`
                            : 'bg-slate-950/20 border-slate-900'
                        }`}
                      >
                        <AwardIcon
                          className={`w-5 h-5 transition-transform group-hover:scale-110 duration-300 ${
                            isUnlocked ? badge.style.text : 'text-slate-600'
                          }`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <h4
                            className={`text-xs font-bold font-mono tracking-wide ${
                              isUnlocked ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            {badge.name}
                          </h4>
                          <span
                            className="font-mono text-[0.55rem] font-bold text-slate-500 uppercase tracking-wider block"
                          >
                            {badge.category}
                          </span>
                        </div>

                        <p
                          className={`text-[0.65rem] leading-relaxed mt-1 font-semibold ${
                            isUnlocked ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {badge.description}
                        </p>

                        <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[0.58rem] font-mono font-bold">
                          <span className={isUnlocked ? 'text-slate-500' : 'text-slate-700'}>
                            Requirement vector
                          </span>
                          <span
                            className={`uppercase px-2 py-0.5 rounded ${
                              isUnlocked
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-900 text-slate-600 border border-white/5'
                            }`}
                          >
                            {isUnlocked ? 'UNLOCKED' : 'LOCKED'}
                          </span>
                        </div>

                        <div
                          className={`mt-2 p-2 rounded bg-slate-950/60 border text-[0.58rem] font-mono leading-normal ${
                            isUnlocked ? 'border-white/5 text-[#a5b4fc]' : 'border-slate-950 text-slate-600'
                          }`}
                        >
                          [ PROGRESS TARGET: {badge.requirement} ]
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-3 flex flex-col gap-6">
            <div className="p-1 rounded-lg bg-slate-900/60 border border-white/5 w-fit">
              <span className="font-mono text-[0.6rem] font-extrabold uppercase text-slate-500 px-2 py-1 block">
                [ MODIFIER SANDBOX CONFIG ]
              </span>
            </div>

            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 space-y-4">
              <div>
                <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest font-mono block">
                  Parameters Configuration
                </span>
              </div>

              <div className="space-y-3.5">
                {[
                  { key: 'THEME_MONOCHROME_OVERRIDE', desc: 'Forces structural interface layouts to grayscale telemetry tones.', label: 'Mono Interface Override' },
                  { key: '3D_MESH_CANVAS_BOOST', desc: 'Boosts structural GPU accelerators under dense visualization pipelines.', label: '3D Mesh Accelerator' },
                  { key: 'FAST_VELOCITY_PROCTOR', desc: 'Limits core question evaluation parameters strictly below 15s limits.', label: 'Velocity Proctored Limits' },
                ].map(item => {
                  const isActive = sandboxOverrides[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleOverride(item.key)}
                      className="p-3.5 rounded-xl border text-left cursor-pointer transition-all duration-300 relative select-none"
                      style={{
                        background: isActive ? 'rgba(34,211,238,0.06)' : 'rgba(255,255,255,0.01)',
                        border: isActive ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(255,255,255,0.05)',
                        boxShadow: isActive ? '0 0 14px rgba(34,211,238,0.08)' : 'none'
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[0.58rem] font-extrabold text-[#22d3ee] uppercase tracking-wider block">
                          {item.key}
                        </span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-[#22d3ee] border-[#22d3ee] shadow-[0_0_8px_#22d3ee]'
                              : 'border-slate-700 bg-transparent'
                          }`}
                        >
                          {isActive && <CheckCircle2 className="w-2.5 h-2.5 text-slate-900" />}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-2 tracking-wide font-mono">
                        {item.label}
                      </h4>
                      <p className="text-[0.65rem] text-slate-500 font-semibold leading-relaxed mt-1 font-mono">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest font-mono block mb-4">
                  Micro-Token Accrual Registry
                </span>

                <div className="space-y-3.5 max-h-[300px] overflow-y-auto scrollbar-hide">
                  {MICRO_TOKEN_LOGS.map(log => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl border border-white/5 bg-[#070b16]/30 flex flex-col justify-between gap-1"
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <span className="font-mono text-[0.55rem] text-slate-500 font-bold bg-[#090d16] px-1 py-0.5 rounded border border-white/5">
                            {log.id}
                          </span>
                          <h5 className="text-[0.68rem] font-bold text-white mt-1.5 leading-snug font-mono truncate uppercase">
                            {log.description}
                          </h5>
                        </div>

                        <span className={`text-[0.65rem] font-bold font-mono shrink-0 ${log.color}`}>
                          {log.change}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[0.52rem] font-mono text-slate-600 mt-1 border-t border-white/5 pt-1.5">
                        <span className="font-semibold">{log.type}</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-white/5 mt-5 text-center font-mono">
                <p className="text-[0.58rem] font-bold text-slate-600 uppercase tracking-widest">
                  Performance Synchronization
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[0.58rem] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 animate-pulse" /> operational data linked
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
