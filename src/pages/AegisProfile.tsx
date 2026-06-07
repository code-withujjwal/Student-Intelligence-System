import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, Github, Linkedin, Award, Trophy, Calendar, Loader2, 
  Download, Zap, Brain, Target, Flame, Clock, BookOpen, BarChart3, AlertCircle 
} from 'lucide-react';
import axiosInstance from '../api/axios';
import confetti from 'canvas-confetti';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface CellData {
  date: string;
  count: number;
}

interface SubjectMasteryEntry {
  subject: string;
  mastery: number;
  correctCount: number;
  totalCount: number;
}

interface BadgeEntry {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface TimelineEntry {
  date: string;
  title: string;
  description: string;
}

interface RecentActivityEntry {
  type: string;
  description: string;
  date: string;
}

interface IntelligenceData {
  fullName: string;
  username: string;
  academicStatus: string;
  institution: string;
  level: number;
  xp: number;
  title: string;
  globalRank: number;
  collegeRank: number;
  departmentRank: number;
  quizzesCompleted: number;
  quizzesAttempted: number;
  averageAccuracy: number;
  currentStreak: number;
  studyHours: number;
  subjectsMastered: number;
  subjectMastery: SubjectMasteryEntry[];
  heatmapData: CellData[];
  achievements: BadgeEntry[];
  timeline: TimelineEntry[];
  aiInsight: string;
  placementReadinessScore: number;
  recommendedNextFocus: string[];
  recentActivities: RecentActivityEntry[];
  knowledgeDNA: Record<string, number>;
}

function StreamingInsight({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    if (!text) {
      setDisplayed('');
      return;
    }
    
    let index = 0;
    setDisplayed('');
    
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 12);
    
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="font-mono text-xs text-cyan-300 leading-relaxed border border-cyan-500/20 bg-cyan-950/20 rounded-xl p-4.5 relative overflow-hidden shadow-[inset_0_0_12px_rgba(34,211,238,0.05)]">
      <div className="absolute top-0 right-0 p-2 text-[0.5rem] text-cyan-500/40 uppercase tracking-widest select-none">
        Gemini AI Agent Stream
      </div>
      <p className="pr-4">
        {displayed}
        {displayed.length < text.length && (
          <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse ml-0.5" />
        )}
      </p>
    </div>
  );
}

export default function AegisProfile() {
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  // Editable Profile States
  const [handle, setHandle] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [academicStatus, setAcademicStatus] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Intelligence Payload State
  const [profileData, setProfileData] = useState<IntelligenceData | null>(null);
  const [hoveredCell, setHoveredCell] = useState<CellData | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/user/profile/intelligence');
      const data = res.data.data;
      setProfileData(data);
      setHandle(data.username || '');
      setFullName(data.fullName || '');
      setInstitution(data.institution || '');
      setAcademicStatus(data.academicStatus || '');
      setGithubUrl(data.githubUrl || '');
      setLinkedinUrl(data.linkedinUrl || '');
    } catch (error) {
      console.error("Failed to load intelligence profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsEditMode(false);
    try {
      await axiosInstance.put('/user/profile', {
        username: handle,
        fullName,
        institution,
        academicStatus,
        githubUrl,
        linkedinUrl
      });
      fetchProfile();
    } catch (error) {
      console.error("Failed to save profile", error);
    }
  };

  const downloadReport = async (type: string) => {
    try {
      setDownloadingType(type);
      const res = await axiosInstance.get(`/user/profile/report/${type}`, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_readiness_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download report", error);
    } finally {
      setDownloadingType(null);
    }
  };

  const handleBadgeHover = (unlocked: boolean) => {
    if (unlocked) {
      confetti({
        particleCount: 35,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22d3ee', '#a855f7', '#10b981']
      });
      confetti({
        particleCount: 35,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22d3ee', '#a855f7', '#10b981']
      });
    }
  };

  const heatmapLookup = React.useMemo(() => {
    const map: Record<string, number> = {};
    if (profileData?.heatmapData) {
      profileData.heatmapData.forEach((item) => {
        map[item.date] = item.count;
      });
    }
    return map;
  }, [profileData]);

  const getCellData = (c: number, r: number): CellData => {
    const today = new Date();
    const daysAgo = 364 - (c * 7 + r);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - daysAgo);
    const dateStr = targetDate.toISOString().split('T')[0];
    const count = heatmapLookup[dateStr] || 0;
    return { date: dateStr, count };
  };

  const radarData = React.useMemo(() => {
    if (!profileData?.subjectMastery) return [];
    return profileData.subjectMastery.map((item) => ({
      subject: item.subject,
      A: item.mastery,
      fullMark: 100,
    }));
  }, [profileData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#060912' }}>
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const currentLevel = profileData?.level || 1;
  const currentXP = profileData?.xp || 0;
  const xpInCurrentLevel = currentXP % 1000;
  const levelProgressPct = (xpInCurrentLevel / 1000) * 100;

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-slate-100 p-6 lg:p-8"
      style={{
        background: '#060912',
        fontFamily: '"Space Mono", "JetBrains Mono", "Fira Code", monospace',
        letterSpacing: '0.05em'
      }}
    >
      {/* Background Decorative Gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,211,238,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(168,85,247,0.05) 0%, transparent 50%)'
        }}
      />

      {/* Header Section */}
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/features')}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5 mr-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="tracking-widest font-extrabold uppercase text-[0.6rem] text-[#22d3ee] flex items-center gap-1.5 animate-pulse">
              <Shield className="w-3.5 h-3.5 text-[#22d3ee]" /> STUDENT_INTELLIGENCE_PROFILE // SYSTEM_IDENTITY_V2
            </p>
            <h1 className="text-sm font-bold text-white tracking-wider mt-0.5 uppercase">
              STUDENT INTELLIGENCE PROTOCOL
            </h1>
          </div>
        </div>

        <div>
          {isEditMode ? (
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest uppercase transition-all shadow-lg shadow-emerald-500/5 hover:brightness-110 cursor-pointer"
            >
              [ Save Identity Profile ]
            </button>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold tracking-widest uppercase transition-all cursor-pointer"
            >
              [ Edit Profile ]
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Layout */}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* Left Column (Sidebar widget stack) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* SECTION 1: HERO PROFILE CARD */}
          <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-6 relative overflow-hidden">
            {/* Neural Scan Scanning Line Animation */}
            <motion.div
              className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent pointer-events-none"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            />

            <AnimatePresence mode="wait">
              {isEditMode ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 font-mono text-left"
                >
                  <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block">
                    [ EDIT MANIFEST ]
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        OPERATIVE HANDLE
                      </label>
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 transition-colors font-mono w-full uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        FULL OPERATIVE NAME
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 transition-colors font-mono w-full uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        ACADEMIC TARGET STATUS
                      </label>
                      <input
                        type="text"
                        value={academicStatus}
                        onChange={(e) => setAcademicStatus(e.target.value)}
                        className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 transition-colors font-mono w-full uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        AFFILIATION INSTITUTION
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 transition-colors font-mono w-full uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        GITHUB MANIFEST URL
                      </label>
                      <input
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 transition-colors font-mono w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        LINKEDIN RECOGNITION URL
                      </label>
                      <input
                        type="text"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 transition-colors font-mono w-full"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="read"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 text-left"
                >
                  <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block">
                    [ ACADEMIC IDENTITY ]
                  </span>

                  {/* Level Ring Animation Wrapper */}
                  <div className="flex items-center gap-5">
                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                      {/* SVG Level Ring Animation */}
                      <svg className="w-24 h-24 transform -rotate-90 absolute">
                        <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                        <motion.circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#22d3ee"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - levelProgressPct / 100) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_6px_#22d3ee]"
                        />
                      </svg>
                      <div className="text-center font-mono select-none z-10">
                        <span className="text-[0.55rem] font-bold text-slate-400 block uppercase">LVL</span>
                        <span className="text-2xl font-extrabold text-white block -mt-1 leading-none">{currentLevel}</span>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-extrabold text-[#22d3ee] tracking-widest uppercase truncate max-w-[200px]">
                        {fullName || 'SECURE OPERATIVE'}
                      </h2>
                      <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
                        @{handle || 'anonymous'}
                      </p>
                      <div className="inline-block mt-2 px-3 py-1 rounded bg-[#a855f7]/10 border border-[#a855f7]/20 text-[0.6rem] font-bold text-[#d8b4fe] uppercase tracking-wider">
                        🛡️ {profileData?.title || 'Fresh Learner'}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 my-4" />

                  <div className="space-y-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider leading-relaxed">
                    <p className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" /> {academicStatus || 'CSE • Semester 4'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> {institution || 'Default Institute'}
                    </p>
                    <p className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {profileData?.quizzesCompleted || 0} Quizzes Completed
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-3">
                    <a
                      href={githubUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#090d16]/80 border border-white/5 hover:border-white/10 text-[0.65rem] font-bold text-[#a855f7] hover:text-[#d8b4fe] transition-all flex items-center gap-1.5 tracking-widest uppercase cursor-pointer"
                    >
                      <Github className="w-3.5 h-3.5 text-[#a855f7]" /> GITHUB
                    </a>
                    <a
                      href={linkedinUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#090d16]/80 border border-white/5 hover:border-white/10 text-[0.65rem] font-bold text-[#22d3ee] hover:text-[#a5f3fc] transition-all flex items-center gap-1.5 tracking-widest uppercase cursor-pointer"
                    >
                      <Linkedin className="w-3.5 h-3.5 text-[#22d3ee]" /> LINKEDIN
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SECTION 10: RANKING SYSTEM */}
          <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
            <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left">
              [ CALIBRATED LEADERSHIP RANKS ]
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-center">
                <span className="text-[0.45rem] font-bold text-slate-500 block uppercase">GLOBAL</span>
                <span className="text-sm font-extrabold text-cyan-400 block mt-1">#{profileData?.globalRank || 1}</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-center">
                <span className="text-[0.45rem] font-bold text-slate-500 block uppercase">COLLEGE</span>
                <span className="text-sm font-extrabold text-purple-400 block mt-1">#{profileData?.collegeRank || 1}</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-center">
                <span className="text-[0.45rem] font-bold text-slate-500 block uppercase">DEPT</span>
                <span className="text-sm font-extrabold text-amber-500 block mt-1">#{profileData?.departmentRank || 1}</span>
              </div>
            </div>
          </div>

          {/* SECTION 12: KNOWLEDGE DNA (TELEMETRY) */}
          <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-5">
            <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left">
              [ COGNITIVE DNA TELEMETRY ]
            </span>

            <div className="space-y-4">
              {[
                { key: "problem_solving", label: "Problem Solving", color: "bg-emerald-500", glow: "shadow-[0_0_8px_#10b981]" },
                { key: "theory", label: "Theoretical Mastery", color: "bg-cyan-500", glow: "shadow-[0_0_8px_#06b6d4]" },
                { key: "speed", label: "Cognitive Velocity", color: "bg-amber-500", glow: "shadow-[0_0_8px_#f59e0b]" },
                { key: "consistency", label: "Consistency Factor", color: "bg-purple-500", glow: "shadow-[0_0_8px_#a855f7]" },
                { key: "retention", label: "Topic Retention", color: "bg-red-500", glow: "shadow-[0_0_8px_#ef4444]" }
              ].map((item) => {
                const value = profileData?.knowledgeDNA?.[item.key] || 50;
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex justify-between text-[0.6rem] font-bold font-mono uppercase tracking-wider">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-slate-400">{value}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-950/60 border border-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`h-full rounded-full ${item.color} ${item.glow}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 13: CERTIFICATIONS & REPORTS */}
          <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
            <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left">
              [ TELEMETRY EXPORT PROTOCOLS ]
            </span>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "academic", label: "Academic PDF" },
                { type: "subject", label: "Subject PDF" },
                { type: "performance", label: "History PDF" },
                { type: "placement", label: "Placement PDF" }
              ].map((btn) => (
                <button
                  key={btn.type}
                  disabled={downloadingType !== null}
                  onClick={() => downloadReport(btn.type)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/5 hover:border-[#22d3ee]/30 hover:bg-slate-800 text-slate-300 hover:text-white text-[0.55rem] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {downloadingType === btn.type ? (
                    <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Main content layouts) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* SECTION 2: ACADEMIC OVERVIEW */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: "Attempts Secure", val: profileData?.quizzesAttempted || 0, icon: <BookOpen className="w-4 h-4 text-cyan-400" />, border: "border-cyan-500/20" },
              { label: "Avg Accuracy", val: `${profileData?.averageAccuracy || 0}%`, icon: <Target className="w-4 h-4 text-emerald-400" />, border: "border-emerald-500/20" },
              { label: "Active Streak", val: `${profileData?.currentStreak || 0} Days`, icon: <Flame className="w-4 h-4 text-amber-400" />, border: "border-amber-500/20" },
              { label: "Calibrated Hours", val: `${profileData?.studyHours || 0}H`, icon: <Clock className="w-4 h-4 text-purple-400" />, border: "border-purple-500/20" },
              { label: "Domains Mastered", val: profileData?.subjectsMastered || 0, icon: <Trophy className="w-4 h-4 text-red-400" />, border: "border-red-500/20" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                className={`p-4 bg-[#0e1322]/40 backdrop-blur-md border ${stat.border} rounded-2xl flex flex-col justify-between text-left`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[0.48rem] font-bold text-slate-500 uppercase tracking-widest leading-normal">
                    {stat.label}
                  </span>
                  {stat.icon}
                </div>
                <div className="text-base font-extrabold text-white tracking-widest font-mono mt-3 select-all">
                  {stat.val}
                </div>
              </motion.div>
            ))}
          </div>

          {/* SECTION 6: AI ACADEMIC INSIGHT */}
          <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
            <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left">
              [ COGNITIVE AI FEEDBACK INSIGHT ]
            </span>
            <StreamingInsight text={profileData?.aiInsight || ''} />
          </div>

          {/* Radar and Mastery Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECTION 3: ENGINEERING RADAR CHART */}
            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
              <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left mb-3">
                [ CORE ACADEMIC RADAR MAP ]
              </span>
              
              <div className="flex items-center justify-center">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569' }} />
                      <Radar name="Mastery" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                    No subject metrics calibrated.
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: SUBJECT MASTERY MATRIX */}
            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4.5 flex flex-col justify-between">
              <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left">
                [ SUBJECT MASTERING MATRIX ]
              </span>

              <div className="space-y-3">
                {profileData?.subjectMastery && profileData.subjectMastery.length > 0 ? (
                  profileData.subjectMastery.map((sub) => {
                    // Color code subject mastery based on accuracy
                    let barColor = "bg-red-500";
                    let glowColor = "shadow-[0_0_8px_#ef4444]";
                    let textColor = "text-red-400";
                    if (sub.mastery >= 85) {
                      barColor = "bg-emerald-500";
                      glowColor = "shadow-[0_0_8px_#10b981]";
                      textColor = "text-emerald-400";
                    } else if (sub.mastery >= 70) {
                      barColor = "bg-amber-500";
                      glowColor = "shadow-[0_0_8px_#f59e0b]";
                      textColor = "text-amber-400";
                    }
                    return (
                      <div key={sub.subject} className="space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-[0.6rem] font-bold font-mono">
                          <span className="text-slate-200">{sub.subject}</span>
                          <span className={`${textColor}`}>{sub.mastery}% ({sub.correctCount}/{sub.totalCount})</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-950/60 border border-white/5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${sub.mastery}%` }}
                            transition={{ duration: 1.0, ease: "easeOut" }}
                            className={`h-full rounded-full ${barColor} ${glowColor}`}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-500 text-xs text-center py-10">
                    Attempt subject quizzes to register metrics.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 9: PLACEMENT READINESS */}
          <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
            <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left">
              [ PLACEMENT READINESS SCORE ]
            </span>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90 absolute">
                  <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - (profileData?.placementReadinessScore || 0) / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_6px_#10b981]"
                  />
                </svg>
                <div className="text-center font-mono select-none z-10">
                  <span className="text-[0.55rem] font-bold text-slate-400 block uppercase">READINESS</span>
                  <span className="text-xl font-extrabold text-white block leading-none">{profileData?.placementReadinessScore || 0}%</span>
                </div>
              </div>

              <div className="text-left space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Recommended Priority Sprints:</h4>
                <ul className="space-y-1.5">
                  {profileData?.recommendedNextFocus && profileData.recommendedNextFocus.map((rec, i) => (
                    <li key={i} className="text-[0.68rem] text-slate-400 leading-normal flex items-start gap-1.5 font-mono">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 5: LEARNING HEATMAP */}
          <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">
                [ 365-DAY CONCEPT CALIBRATION HEATMAP ]
              </span>
              <span className="text-[0.55rem] font-bold text-slate-400 font-mono tracking-wider uppercase">
                {hoveredCell ? `${hoveredCell.date} · ${hoveredCell.count} CALIBRATIONS SECURED` : 'HOVER BLOCK TO EXTRACT TELEMETRY'}
              </span>
            </div>

            <div className="bg-[#090d16]/40 border border-white/5 rounded-xl p-4 flex justify-between gap-1 overflow-x-auto scrollbar-hide select-none h-[116px]">
              {Array.from({ length: 53 }).map((_, cIdx) => (
                <div key={cIdx} className="flex flex-col justify-between gap-1 h-full shrink-0">
                  {Array.from({ length: 7 }).map((__, rIdx) => {
                    const cell = getCellData(cIdx, rIdx);
                    const hasActivity = cell.count > 0;
                    
                    // calculate dynamic heat colors
                    let cellBg = "bg-slate-900";
                    let cellGlow = "";
                    if (cell.count > 0) {
                      if (cell.count >= 5) {
                        cellBg = "bg-emerald-400";
                        cellGlow = "shadow-[0_0_6px_#34d399]";
                      } else if (cell.count >= 3) {
                        cellBg = "bg-emerald-500/80";
                        cellGlow = "shadow-[0_0_4px_#10b981]";
                      } else {
                        cellBg = "bg-emerald-600/40";
                      }
                    }

                    return (
                      <div
                        key={rIdx}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-[8px] h-[8px] rounded-[1px] transition-all cursor-pointer ${cellBg} ${cellGlow} hover:scale-125`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7: ACHIEVEMENTS & BADGES */}
          <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
            <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left">
              [ ACHIEVED MILESTONE BADGES ]
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {profileData?.achievements && profileData.achievements.map((b) => {
                let badgeColor = "text-slate-600";
                let borderColor = "border-dashed border-white/5 bg-transparent opacity-35";
                
                if (b.unlocked) {
                  borderColor = "border-slate-500/30 bg-[#0b0f19]/30 shadow-md";
                  if (b.id.startsWith("TIER_01") || b.id.startsWith("FIRST_QUIZ")) badgeColor = "text-slate-300";
                  else if (b.id.startsWith("TIER_02")) badgeColor = "text-blue-400";
                  else if (b.id.startsWith("TIER_03") || b.id.startsWith("DSA_NINJA")) badgeColor = "text-cyan-400";
                  else if (b.id.startsWith("TIER_04") || b.id.startsWith("STREAK_10")) badgeColor = "text-amber-400";
                  else if (b.id.startsWith("TIER_05")) badgeColor = "text-purple-400";
                  else if (b.id.startsWith("TIER_06") || b.id.startsWith("DBMS_EXPERT")) badgeColor = "text-emerald-400";
                }

                return (
                  <motion.div
                    key={b.id}
                    onMouseEnter={() => handleBadgeHover(b.unlocked)}
                    whileHover={b.unlocked ? { scale: 1.05, y: -2 } : {}}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${borderColor}`}
                  >
                    <Award className={`w-8 h-8 ${badgeColor}`} />
                    <span className="font-mono text-[0.52rem] font-bold tracking-wide text-white uppercase mt-1.5 truncate max-w-full">
                      {b.name}
                    </span>
                    <span className="font-mono text-[0.4rem] font-bold text-slate-500 uppercase leading-none">
                      {b.unlocked ? "[ UNLOCKED ]" : "[ LOCKED ]"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Timeline and Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECTION 8: LEARNING TIMELINE */}
            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
              <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left">
                [ INTEL TIMELINE EVENTS ]
              </span>

              <div className="space-y-4 relative border-l border-white/5 pl-4 max-h-64 overflow-y-auto scrollbar-hide text-left">
                {profileData?.timeline && profileData.timeline.length > 0 ? (
                  profileData.timeline.map((evt, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <div className="absolute -left-[20.5px] top-1 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                      <span className="text-[0.55rem] font-bold text-slate-500 font-mono block">
                        {evt.date}
                      </span>
                      <h4 className="text-xs font-bold text-[#22d3ee] uppercase tracking-wider">
                        {evt.title}
                      </h4>
                      <p className="text-[0.68rem] text-slate-400 font-mono leading-normal">
                        {evt.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs py-10 text-center">
                    No timeline logs compiled yet.
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 11: RECENT ACTIVITY FEED */}
            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4">
              <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left">
                [ INTEL ACTIVITY STREAM ]
              </span>

              <div className="space-y-3.5 max-h-64 overflow-y-auto scrollbar-hide text-left">
                {profileData?.recentActivities && profileData.recentActivities.length > 0 ? (
                  profileData.recentActivities.map((act, idx) => {
                    let typeBadge = "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";
                    if (act.type === "BADGE_UNLOCKED") {
                      typeBadge = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                    }
                    return (
                      <div key={idx} className="p-3 bg-slate-950/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 font-mono">
                        <div className="space-y-1 truncate">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded border text-[0.45rem] font-bold uppercase ${typeBadge}`}>
                              {act.type}
                            </span>
                            <span className="text-[0.55rem] font-bold text-slate-500">
                              {act.date}
                            </span>
                          </div>
                          <p className="text-[0.65rem] text-slate-300 leading-normal truncate">
                            {act.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-500 text-xs py-10 text-center">
                    No stream activity registered.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </motion.main>
    </div>
  );
}
