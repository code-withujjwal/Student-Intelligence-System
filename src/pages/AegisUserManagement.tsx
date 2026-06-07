import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, AlertTriangle, TrendingUp, ChevronDown, Check, X,
  BookOpen, Layers, Settings, FileText, Send, HelpCircle, Map, ArrowLeft,
  Search, Filter, RefreshCw, UserCheck, UserX, AlertOctagon, Award, 
  Calendar, Clock, Download, Plus, Trash2, Mail, Bell, Globe, Activity,
  Eye, Edit, Key, Lock, Unlock, Loader2
} from 'lucide-react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface TimeSpentVector {
  id: string;
  nodeId: string;
  subject: string;
  unit: number;
  timeSpentSeconds: number;
  status: 'CORRECT' | 'INCORRECT';
  complexity: 'EASY' | 'MEDIUM' | 'HARD';
}

interface StudentIntelligence {
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
  subjectMastery: Array<{
    subject: string;
    mastery: number;
    correctCount: number;
    totalCount: number;
  }>;
  heatmapData: Array<{ date: string; count: number }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt: string | null;
  }>;
  timeline: Array<{ date: string; title: string; description: string }>;
  aiInsight: string;
  placementReadinessScore: number;
  recommendedNextFocus: string[];
  recentActivities: Array<{ type: string; description: string; date: string }>;
  knowledgeDNA: Record<string, number>;
}

interface AdminUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  branch: string;
  semester: string;
  role: string;
  status: string;
  academicScore: number;
  placementScore: number;
  lastActive: string;
}

interface SecurityLog {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  concernType: string;
  description: string;
  severity: string;
  timestamp: string;
}

interface AuditLog {
  id: number;
  username: string;
  action: string;
  metadata: string;
  timestamp: string;
}

interface GlobalAnalytics {
  totalStudents: number;
  activeToday: number;
  quizzesAttempted: number;
  averageAccuracy: number;
  placementReadiness: number;
  facultyCount: number;
  growthPercentage: number;
}

function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const numParticles = 24;
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.04)';
      ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p2.x - p.x, p2.y - p.y);
          if (dist < 185) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
}

function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(1, Math.floor(totalMiliseconds / end));
    const timer = setInterval(() => {
      start += Math.ceil(end / 80);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

function AIInsightStream({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, 12);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <div className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-4 text-[0.7rem] font-mono leading-relaxed text-cyan-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-1.5 text-[0.45rem] text-cyan-500/40 uppercase tracking-widest">
        LIVE INSIGHT STREAM
      </div>
      <p>
        {displayedText}
        {displayedText.length < text.length && (
          <span className="inline-block w-1.5 h-3.5 bg-cyan-400 animate-pulse ml-0.5" />
        )}
      </p>
    </div>
  );
}

export default function AegisUserManagement() {
  const navigate = useNavigate();

  // Page Entry sequence states: "initializing", "loading", "complete"
  const [syncState, setSyncState] = useState<'initializing' | 'loading' | 'complete'>('initializing');
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'logs' | 'broadcaster' | 'security' | 'reports'>('users');
  const [loading, setLoading] = useState(true);

  // Payload Data
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Sliding 360 view states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userIntelligence, setUserIntelligence] = useState<StudentIntelligence | null>(null);
  const [loading360, setLoading360] = useState(false);

  // Subject Modal states
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editBranch, setEditBranch] = useState('CSE');
  const [editSem, setEditSem] = useState('Semester 4');
  const [editInst, setEditInst] = useState('');

  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchStatusText, setSearchStatusText] = useState('Idle');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterSemester, setFilterSemester] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPlacementUnder60, setFilterPlacementUnder60] = useState(false);

  // Broadcaster state
  const [bcType, setBcType] = useState('ANNOUNCEMENT');
  const [bcTarget, setBcTarget] = useState('ALL');
  const [bcTargetValue, setBcTargetValue] = useState('');
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcProgress, setBcProgress] = useState<number | null>(null);

  // Report Center state
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  // Permissions Accordion state
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Page Entry Logic
  useEffect(() => {
    const timer1 = setTimeout(() => setSyncState('loading'), 1000);
    const timer2 = setTimeout(() => {
      setSyncState('complete');
      setLoading(false);
    }, 2200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Fetch payload data
  const fetchData = async () => {
    try {
      const usersRes = await axiosInstance.get('/admin/users');
      setUsers(usersRes.data.data);

      const analyticsRes = await axiosInstance.get('/admin/analytics');
      setAnalytics(analyticsRes.data.data);

      const secRes = await axiosInstance.get('/admin/security/logs');
      setSecurityLogs(secRes.data.data);

      const auditRes = await axiosInstance.get('/admin/audit/logs');
      setAuditLogs(auditRes.data.data);
    } catch (err) {
      console.error("Failed to load admin dashboard data", err);
    }
  };

  useEffect(() => {
    if (syncState === 'complete') {
      fetchData();
    }
  }, [syncState]);

  // Handle Search Input effects
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim()) {
      setSearchStatusText('Searching neural database...');
    } else {
      setSearchStatusText('Idle');
    }
  };

  // Open Student 360 View Panel
  const handleUserClick = async (user: AdminUser) => {
    setSelectedUser(user);
    setLoading360(true);
    try {
      const res = await axiosInstance.get(`/admin/users/${user.id}/intelligence`);
      setUserIntelligence(res.data.data);
      setEditBranch(user.branch);
      setEditSem(user.semester);
    } catch (err) {
      console.error("Failed to fetch user 360 metrics", err);
    } finally {
      setLoading360(false);
    }
  };

  // User Actions (Status updates)
  const handleStatusUpdate = async (status: string) => {
    if (!selectedUser) return;
    try {
      await axiosInstance.put(`/admin/users/${selectedUser.id}/status`, { status });
      toast.success(`User status calibrated to ${status} ✓`);
      setSelectedUser(prev => prev ? { ...prev, status } : null);
      fetchData();
    } catch (err) {
      console.error("Failed to modify user status", err);
    }
  };

  // User Curriculum update
  const handleCurriculumSave = async () => {
    if (!selectedUser) return;
    try {
      await axiosInstance.put(`/admin/users/${selectedUser.id}/subjects`, {
        branch: editBranch,
        semester: editSem,
        institution: editInst || selectedUser.fullName + " College"
      });
      toast.success("User curriculum links updated successfully");
      setShowSubjectModal(false);
      fetchData();
      if (selectedUser) {
        handleUserClick(selectedUser);
      }
    } catch (err) {
      console.error("Failed to update user subjects", err);
    }
  };

  // Assign Badges
  const handleAssignBadge = async (badgeName: string, description: string) => {
    if (!selectedUser) return;
    try {
      await axiosInstance.post(`/admin/users/${selectedUser.id}/badges`, { badgeName, description });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#22d3ee', '#a855f7', '#10b981']
      });
      toast.success(`Badge [${badgeName}] assigned successfully ✓`);
      if (selectedUser) {
        handleUserClick(selectedUser);
      }
      fetchData();
    } catch (err) {
      console.error("Failed to assign badge", err);
    }
  };

  // Revoke Badges
  const handleRevokeBadge = async (badgeName: string) => {
    if (!selectedUser) return;
    try {
      await axiosInstance.delete(`/admin/users/${selectedUser.id}/badges/${badgeName}`);
      toast.success(`Revoked badge [${badgeName}]`);
      if (selectedUser) {
        handleUserClick(selectedUser);
      }
      fetchData();
    } catch (err) {
      console.error("Failed to revoke badge", err);
    }
  };

  // Broadcast center submission
  const handleBroadcast = async () => {
    if (!bcTitle.trim() || !bcMessage.trim()) {
      toast.error("Title and message cannot be empty");
      return;
    }
    setBcProgress(0);
    const interval = setInterval(() => {
      setBcProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    try {
      await axiosInstance.post('/admin/broadcast', {
        type: bcType,
        target: bcTarget,
        targetValue: bcTargetValue,
        title: bcTitle,
        message: bcMessage
      });
      setTimeout(() => {
        toast.success(`Broadcasting Successful! Delivered ✓`);
        setBcProgress(null);
        setBcTitle('');
        setBcMessage('');
        setBcTargetValue('');
        fetchData();
      }, 1100);
    } catch (err) {
      clearInterval(interval);
      setBcProgress(null);
      console.error("Failed to send broadcast", err);
    }
  };

  // Download Admin PDF Reports
  const handleDownloadReport = async (type: string, userId?: number) => {
    try {
      setDownloadingReport(type);
      const url = userId ? `/admin/reports/${type}?userId=${userId}` : `/admin/reports/${type}`;
      const res = await axiosInstance.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const dlUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = dlUrl;
      link.setAttribute('download', `${type}_admin_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(dlUrl);
      toast.success("Report downloaded successfully");
    } catch (err) {
      console.error("Failed to download PDF report", err);
    } finally {
      setDownloadingReport(null);
    }
  };

  // Advanced Filtering computed results
  const filteredUsers = React.useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBranch = filterBranch === 'ALL' || u.branch.toUpperCase() === filterBranch.toUpperCase();
      const matchSemester = filterSemester === 'ALL' || u.semester.toUpperCase().includes(filterSemester.toUpperCase());
      const matchStatus = filterStatus === 'ALL' || u.status.toUpperCase() === filterStatus.toUpperCase();
      const matchPlacement = !filterPlacementUnder60 || u.placementScore < 60;
      return matchSearch && matchBranch && matchSemester && matchStatus && matchPlacement;
    });
  }, [users, searchTerm, filterBranch, filterSemester, filterStatus, filterPlacementUnder60]);

  // Performance Control widgets calculation
  const topStudents = React.useMemo(() => {
    return [...users].sort((a, b) => b.academicScore - a.academicScore).slice(0, 5);
  }, [users]);

  const weakStudents = React.useMemo(() => {
    return [...users].sort((a, b) => a.academicScore - b.academicScore).slice(0, 5);
  }, [users]);

  // Page Entry loading overlay
  if (syncState !== 'complete') {
    return (
      <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center text-slate-100" style={{ background: '#060912' }}>
        <NeuralBackground />
        <div className="z-10 font-mono text-center space-y-4">
          <svg className="w-16 h-16 animate-spin mx-auto text-[#22d3ee] mb-4">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" fill="none" opacity="0.3" />
            <circle cx="32" cy="32" r="20" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity="0.6" />
          </svg>
          <div className="h-6">
            {syncState === 'initializing' ? (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold uppercase tracking-widest text-[#22d3ee] animate-pulse">
                Initializing User Intelligence System...
              </motion.p>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold uppercase tracking-widest text-[#a855f7] animate-pulse">
                Loading Student Network...
              </motion.p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-slate-100 p-6 lg:p-8"
      style={{
        background: '#060912',
        fontFamily: '"Space Mono", "JetBrains Mono", "Fira Code", monospace',
        letterSpacing: '0.05em'
      }}
    >
      <NeuralBackground />

      {/* Header Panel */}
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8 border-b border-white/5 pb-5 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/teach')}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5 mr-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="tracking-widest font-extrabold uppercase text-[0.6rem] text-[#22d3ee] flex items-center gap-1.5 animate-pulse">
              <Shield className="w-3.5 h-3.5 text-[#22d3ee]" /> ADMIN_AUTHORITY_HUB // USER_MANAGEMENT_PROTOCOL
            </p>
            <h1 className="text-sm font-bold text-white tracking-wider mt-0.5 uppercase">
              STUDENT INTELLIGENCE HUB
            </h1>
          </div>
        </div>

        <div className="flex gap-2.5">
          {['users', 'roles', 'logs', 'broadcaster', 'security', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 rounded-lg border text-[0.55rem] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                activeTab === tab 
                  ? 'bg-[#22d3ee]/10 border-[#22d3ee]/40 text-[#22d3ee] shadow-[0_0_8px_rgba(34,211,238,0.1)]'
                  : 'bg-transparent border-white/5 hover:border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">

        {/* SECTION 1: GLOBAL OVERVIEW DASHBOARD */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Students", val: analytics.totalStudents, pct: 100, color: "text-[#22d3ee]" },
              { label: "Active Today", val: analytics.activeToday, pct: Math.round((analytics.activeToday/analytics.totalStudents)*100), color: "text-[#a855f7]" },
              { label: "Faculty Count", val: analytics.facultyCount, pct: 100, color: "text-amber-500" },
              { label: "Platform Growth", val: "+12%", pct: 12, color: "text-emerald-500" }
            ].map((stat, idx) => (
              <div key={idx} className="p-4.5 bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1 text-left">
                  <span className="text-[0.48rem] font-bold text-slate-500 uppercase tracking-widest block leading-none">
                    {stat.label}
                  </span>
                  <span className={`text-lg font-extrabold tracking-widest font-mono block mt-1.5 ${stat.color}`}>
                    {typeof stat.val === 'number' ? <AnimatedCounter value={stat.val} /> : stat.val}
                  </span>
                </div>
                {/* Micro Progress Ring */}
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="16" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" fill="transparent" />
                    <motion.circle
                      cx="20"
                      cy="20"
                      r="16"
                      stroke={idx === 0 ? "#22d3ee" : idx === 1 ? "#a855f7" : idx === 2 ? "#f59e0b" : "#10b981"}
                      strokeWidth="2.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 16}
                      initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - stat.pct / 100) }}
                      transition={{ duration: 1.0, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-mono text-[0.45rem] font-bold text-slate-400">{stat.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content Rendering */}
        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Directory Filter Panel */}
              <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-1/3 relative text-left">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search students..."
                    className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-cyan-500/60 font-mono"
                  />
                  <div className="absolute right-3 top-3 text-[0.48rem] text-slate-500 font-bold uppercase font-mono">
                    {searchStatusText}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
                  <div className="flex items-center gap-1 bg-slate-950/40 border border-white/5 rounded-lg px-2 py-1 text-xs">
                    <span className="text-slate-500 text-[0.55rem] font-bold uppercase mr-1">Branch:</span>
                    <select
                      value={filterBranch}
                      onChange={(e) => setFilterBranch(e.target.value)}
                      className="bg-transparent text-slate-300 font-mono text-[0.65rem] border-none outline-none cursor-pointer"
                    >
                      <option value="ALL">ALL</option>
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="EC">EC</option>
                      <option value="EE">EE</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950/40 border border-white/5 rounded-lg px-2 py-1 text-xs">
                    <span className="text-slate-500 text-[0.55rem] font-bold uppercase mr-1">Semester:</span>
                    <select
                      value={filterSemester}
                      onChange={(e) => setFilterSemester(e.target.value)}
                      className="bg-transparent text-slate-300 font-mono text-[0.65rem] border-none outline-none cursor-pointer"
                    >
                      <option value="ALL">ALL</option>
                      <option value="Sem 4">Sem 4</option>
                      <option value="Sem 3">Sem 3</option>
                      <option value="Sem 2">Sem 2</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-950/40 border border-white/5 rounded-lg px-2 py-1 text-xs">
                    <span className="text-slate-500 text-[0.55rem] font-bold uppercase mr-1">Status:</span>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-transparent text-slate-300 font-mono text-[0.65rem] border-none outline-none cursor-pointer"
                    >
                      <option value="ALL">ALL</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="SUSPENDED">SUSPENDED</option>
                      <option value="BANNED">BANNED</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setFilterPlacementUnder60(!filterPlacementUnder60)}
                    className={`px-3 py-1.5 rounded-lg border text-[0.55rem] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                      filterPlacementUnder60 
                        ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                        : 'bg-slate-950/40 border-white/5 text-slate-400'
                    }`}
                  >
                    Placement &lt; 60%
                  </button>
                </div>
              </div>

              {/* Student Intelligence Hub Grid Directory */}
              <div className="space-y-3">
                <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block text-left">
                  [ STUDENT INTELLIGENCE HUB DIRECTORY ]
                </span>

                <div className="grid grid-cols-1 gap-3">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        onClick={() => handleUserClick(user)}
                        whileHover={{ scale: 1.008 }}
                        className="bg-[#0e1322]/30 border border-white/5 hover:border-cyan-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all cursor-pointer hover:shadow-[0_0_12px_rgba(34,211,238,0.05)] text-left"
                      >
                        <div className="flex items-center gap-3.5 w-full sm:w-auto">
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center font-mono font-bold text-cyan-400 uppercase select-none">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-white tracking-wider uppercase">{user.fullName}</h3>
                            <p className="text-[0.62rem] text-slate-500 font-mono mt-0.5">@{user.username} · {user.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 sm:flex sm:items-center gap-6 text-center sm:text-left w-full sm:w-auto justify-between sm:justify-end">
                          <div>
                            <span className="text-[0.45rem] font-bold text-slate-500 block uppercase">Curriculum</span>
                            <span className="text-[0.65rem] font-mono font-bold text-slate-300 block mt-0.5">{user.branch} · {user.semester}</span>
                          </div>

                          <div>
                            <span className="text-[0.45rem] font-bold text-slate-500 block uppercase">Score Index</span>
                            <span className="text-[0.65rem] font-mono font-bold text-emerald-400 block mt-0.5">{user.academicScore}%</span>
                          </div>

                          <div>
                            <span className="text-[0.45rem] font-bold text-slate-500 block uppercase">Placement</span>
                            <span className="text-[0.65rem] font-mono font-bold text-purple-400 block mt-0.5">{user.placementScore}%</span>
                          </div>

                          <div className="flex flex-col items-center">
                            <span className="text-[0.45rem] font-bold text-slate-500 block uppercase mb-1">Status</span>
                            <span className={`px-2 py-0.5 rounded text-[0.45rem] font-bold uppercase border ${
                              user.status === 'ACTIVE' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-10 border border-dashed border-white/5 rounded-xl text-center text-slate-500 text-xs font-mono">
                      No Student Node found. Try adjusting filter query configurations.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'roles' && (
            <motion.div
              key="roles"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <h3 className="text-xs font-bold text-white tracking-widest uppercase text-left">[ RBAC ROLES PERMISSION ACCORDION ]</h3>
              <p className="text-[0.62rem] text-slate-500 uppercase font-mono text-left">Configure and audit standard system authorization policies.</p>
              
              <div className="space-y-2.5">
                {[
                  { role: "SUPER_ADMIN", desc: "Global owner capability. Controls all servers and DB records.", permissions: { "Quiz Management": true, "Roster View": true, "Delete Users": true, "Change Roles": true, "Broadcasting": true } },
                  { role: "ADMIN", desc: "Central administration controller. Manages students, roles, and status.", permissions: { "Quiz Management": true, "Roster View": true, "Delete Users": false, "Change Roles": true, "Broadcasting": true } },
                  { role: "FACULTY", desc: "Educator mode. Deploys assessments, views rosters and analytics.", permissions: { "Quiz Management": true, "Roster View": true, "Delete Users": false, "Change Roles": false, "Broadcasting": false } },
                  { role: "STUDENT", desc: "Standard academic node. Attends quizzes and views progress.", permissions: { "Quiz Management": false, "Roster View": false, "Delete Users": false, "Change Roles": false, "Broadcasting": false } }
                ].map((item) => {
                  const isExpanded = expandedRole === item.role;
                  return (
                    <div key={item.role} className="border border-white/5 rounded-xl bg-slate-950/20 overflow-hidden text-left">
                      <button
                        onClick={() => setExpandedRole(isExpanded ? null : item.role)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all font-mono"
                      >
                        <div>
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[#22d3ee] text-[0.55rem] font-bold tracking-widest uppercase">
                            {item.role}
                          </span>
                          <span className="text-[0.65rem] text-slate-400 ml-3">{item.desc}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-all ${isExpanded ? 'rotate-185' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="px-4 pb-4 border-t border-white/5 bg-slate-950/40 text-[0.68rem] font-mono text-slate-300 space-y-2 pt-3"
                          >
                            <span className="text-[0.55rem] font-bold text-slate-500 block uppercase mb-2">Capability Matrix</span>
                            {Object.entries(item.permissions).map(([perm, ok]) => (
                              <div key={perm} className="flex items-center justify-between py-1 border-b border-white/5">
                                <span>{perm}</span>
                                {ok ? (
                                  <span className="text-emerald-400 flex items-center gap-1 font-bold">[ ✓ PERMITTED ]</span>
                                ) : (
                                  <span className="text-red-400 flex items-center gap-1 font-bold">[ ✗ RESTRICTED ]</span>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <h3 className="text-xs font-bold text-white tracking-widest uppercase text-left">[ AUDIT TRANSACTION logs ]</h3>
              
              <div className="space-y-3.5 max-h-96 overflow-y-auto scrollbar-hide text-left">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl flex justify-between items-start gap-4 font-mono text-[0.68rem] leading-relaxed">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#a855f7]/15 border border-[#a855f7]/25 text-[#d8b4fe] text-[0.45rem] font-bold uppercase">
                            {log.action}
                          </span>
                          <span className="text-slate-500 text-[0.5rem]">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-300">@{log.username}: {log.metadata}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs py-10 text-center">
                    No transactions registered in system logs.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'broadcaster' && (
            <motion.div
              key="broadcaster"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-5 text-left"
            >
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">[ NEURAL MASS BROADCASTER ]</h3>
              <p className="text-[0.62rem] text-slate-500 uppercase font-mono">Broadcast system-wide warnings, emails, or push alerts to specified client targets.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">Broadcast Alert Type</label>
                    <select
                      value={bcType}
                      onChange={(e) => setBcType(e.target.value)}
                      className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono w-full"
                    >
                      <option value="ANNOUNCEMENT">ANNOUNCEMENT (Dashboard Banner)</option>
                      <option value="NOTIFICATION">NOTIFICATION (System Push)</option>
                      <option value="EMAIL">EMAIL (SMTP Manifest delivery)</option>
                      <option value="ALERT">CRITICAL ALERT (Modal lockout)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">Broadcast Target Node Group</label>
                    <select
                      value={bcTarget}
                      onChange={(e) => setBcTarget(e.target.value)}
                      className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono w-full"
                    >
                      <option value="ALL">All Network Users</option>
                      <option value="BRANCH">Specific Department (Branch)</option>
                      <option value="SEMESTER">Specific Semester Group</option>
                    </select>
                  </div>

                  {bcTarget !== 'ALL' && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">Target Filter Value (e.g. CSE or Sem 4)</label>
                      <input
                        type="text"
                        value={bcTargetValue}
                        onChange={(e) => setBcTargetValue(e.target.value)}
                        className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">Broadcast Subject Title</label>
                    <input
                      type="text"
                      value={bcTitle}
                      onChange={(e) => setBcTitle(e.target.value)}
                      placeholder="e.g. Scheduled DBMS Maintenance..."
                      className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono w-full"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">Broadcasting Payload Body</label>
                    <textarea
                      value={bcMessage}
                      onChange={(e) => setBcMessage(e.target.value)}
                      rows={3}
                      placeholder="Enter detailed message description..."
                      className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono w-full"
                    />
                  </div>
                </div>
              </div>

              {bcProgress !== null && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[0.55rem] font-bold font-mono text-[#22d3ee] uppercase">
                    <span>Broadcasting Message...</span>
                    <span>{bcProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-950/60 overflow-hidden border border-white/5">
                    <div className="h-full rounded-full bg-cyan-500 shadow-[0_0_8px_#22d3ee] transition-all duration-300" style={{ width: `${bcProgress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-3">
                <button
                  onClick={handleBroadcast}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-[#22d3ee] text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> [ Dispatch Broadcast ]
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <h3 className="text-xs font-bold text-white tracking-widest uppercase text-left">[ SUSPICIOUS PROCTORING ACTIVITY ALERTS ]</h3>
              <p className="text-[0.62rem] text-slate-500 uppercase font-mono text-left">Gemini-backed proctor telemetry scanner detecting logic anomalies.</p>

              <div className="grid grid-cols-1 gap-4">
                {securityLogs.length > 0 ? (
                  securityLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-4 bg-slate-950/40 border border-red-500/15 rounded-xl flex items-start gap-4 text-left relative overflow-hidden shadow-[inset_0_0_12px_rgba(239,68,68,0.02)]"
                    >
                      <div className="absolute top-0 right-0 p-2 text-[0.45rem] font-bold text-red-500/40 uppercase tracking-widest">
                        🚨 {log.severity} Concern
                      </div>
                      
                      <div className="w-10 h-10 rounded-xl bg-red-950/20 border border-red-500/30 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
                      </div>

                      <div className="space-y-1.5 font-mono text-[0.68rem] leading-relaxed">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white uppercase">{log.fullName} (@{log.username})</span>
                          <span className="text-slate-500 text-[0.52rem]">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-300 font-sans">{log.description}</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded bg-red-950/20 border border-red-500/30 text-red-400 text-[0.45rem] font-bold uppercase">
                            Flag: {log.concernType}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-xs py-10 text-center font-mono">
                    No suspicious proctoring anomalies flagged. System clear.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <h3 className="text-xs font-bold text-white tracking-widest uppercase text-left">[ ACADEMIC EXPORT CENTER ]</h3>
              <p className="text-[0.62rem] text-slate-500 uppercase font-mono text-left">Generate and download platform PDF dossiers for audits.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { type: "academic", name: "Academic Dossier", desc: "Global ranking index and milestone unlocks list." },
                  { type: "subject", name: "Subject Mastery Score", desc: "Accuracies mapped per CS Core subjects." },
                  { type: "performance", name: "Consistency Dossier", desc: "Detailed attempt timestamps and study hours." },
                  { type: "placement", name: "Placement Dossier", desc: "Weighted score index and prioritised study roadmap." }
                ].map((rep) => (
                  <div key={rep.type} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl flex flex-col justify-between items-stretch gap-4 text-left">
                    <div className="space-y-1 text-left">
                      <h4 className="text-xs font-bold text-white uppercase font-mono">{rep.name}</h4>
                      <p className="text-[0.62rem] text-slate-400 font-mono leading-normal mt-1">{rep.desc}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadReport(rep.type)}
                      disabled={downloadingReport !== null}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/5 hover:border-[#22d3ee]/20 text-[0.55rem] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      {downloadingReport === rep.type ? (
                        <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      Export PDF
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* SECTION 4: STUDENT 360° SLIDE PANEL */}
      <AnimatePresence>
        {selectedUser && (
          <>
            {/* Panel Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedUser(null);
                setUserIntelligence(null);
              }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-[#080d16] border-l border-white/10 z-50 p-6 overflow-y-auto scrollbar-hide text-left flex flex-col justify-between gap-6"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      OPERATIVE STUDENT 360 REPORT
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUserIntelligence(null);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {loading360 ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    <span>Aggregating proctor telemetry dossiers...</span>
                  </div>
                ) : (
                  userIntelligence && (
                    <div className="space-y-5 text-left font-mono">
                      
                      {/* Identity Details */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center font-bold text-cyan-400 text-lg uppercase select-none">
                          {selectedUser.fullName.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-extrabold text-[#22d3ee] tracking-wider uppercase leading-none">{selectedUser.fullName}</h3>
                          <p className="text-[0.62rem] text-slate-500">@{selectedUser.username} · {selectedUser.email}</p>
                          <div className="flex gap-2.5 pt-1.5">
                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[#22d3ee] text-[0.45rem] font-bold uppercase">
                              LVL {userIntelligence.level} · {userIntelligence.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[0.45rem] font-bold uppercase border ${
                              selectedUser.status === 'ACTIVE' 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                              {selectedUser.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 5: ROLE MANAGEMENT */}
                      <div className="space-y-2 border border-white/5 rounded-xl p-4 bg-slate-950/20">
                        <span className="text-[0.48rem] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-2">
                          Status & Role Governance
                        </span>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleStatusUpdate('ACTIVE')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[0.52rem] font-bold tracking-wider uppercase cursor-pointer"
                          >
                            Reactivate
                          </button>
                          <button
                            onClick={() => handleStatusUpdate('SUSPENDED')}
                            className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[0.52rem] font-bold tracking-wider uppercase cursor-pointer"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => handleStatusUpdate('BANNED')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-red-500/40 text-red-400 text-[0.52rem] font-bold tracking-wider uppercase cursor-pointer"
                          >
                            Ban
                          </button>
                          <button
                            onClick={() => setShowSubjectModal(true)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300 text-[0.52rem] font-bold tracking-wider uppercase cursor-pointer"
                          >
                            Change Curriculum
                          </button>
                        </div>
                      </div>

                      {/* Academic metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                          <span className="text-[0.45rem] font-bold text-slate-500 block uppercase">Average Accuracy</span>
                          <span className="text-sm font-extrabold text-white block mt-1">{userIntelligence.averageAccuracy}%</span>
                        </div>
                        <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                          <span className="text-[0.45rem] font-bold text-slate-500 block uppercase">Study Hours</span>
                          <span className="text-sm font-extrabold text-white block mt-1">{userIntelligence.studyHours}H</span>
                        </div>
                      </div>

                      {/* SECTION 4: SUBJECT MASTERY BAR ANIMATION */}
                      <div className="space-y-3 border border-white/5 rounded-xl p-4 bg-slate-950/20">
                        <span className="text-[0.48rem] font-bold text-slate-500 uppercase tracking-widest block leading-none">
                          Subject Mastery Matrices
                        </span>
                        
                        <div className="space-y-2.5 pt-1.5">
                          {userIntelligence.subjectMastery.map((sub) => {
                            let barColor = "bg-red-500";
                            let glow = "shadow-[0_0_8px_#ef4444]";
                            if (sub.mastery >= 85) {
                              barColor = "bg-emerald-500";
                              glow = "shadow-[0_0_8px_#10b981]";
                            } else if (sub.mastery >= 70) {
                              barColor = "bg-amber-500";
                              glow = "shadow-[0_0_8px_#f59e0b]";
                            }
                            return (
                              <div key={sub.subject} className="space-y-1">
                                <div className="flex justify-between text-[0.58rem] font-bold">
                                  <span className="text-slate-300">{sub.subject}</span>
                                  <span className="text-slate-400">{sub.mastery}%</span>
                                </div>
                                <div className="w-full h-1 rounded-full bg-slate-950/60 overflow-hidden border border-white/5">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${sub.mastery}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className={`h-full rounded-full ${barColor} ${glow}`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* SECTION 6: AI INSIGHT CARD */}
                      <div className="space-y-2">
                        <span className="text-[0.48rem] font-bold text-slate-500 uppercase tracking-widest block leading-none">
                          Gemini AI Student Evaluation
                        </span>
                        <AIInsightStream text={userIntelligence.aiInsight} />
                      </div>

                      {/* SECTION 8: ACHIEVEMENT & BADGES MANAGEMENT */}
                      <div className="space-y-3 border border-white/5 rounded-xl p-4 bg-slate-950/20">
                        <span className="text-[0.48rem] font-bold text-slate-500 uppercase tracking-widest block leading-none mb-1.5">
                          Student Achievements & Badges
                        </span>

                        <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto scrollbar-hide">
                          {userIntelligence.achievements.map((badge) => (
                            <div 
                              key={badge.id}
                              className={`p-2 rounded-lg border text-center relative flex flex-col justify-between items-center gap-1 transition-all ${
                                badge.unlocked 
                                  ? 'border-emerald-500/20 bg-emerald-950/5' 
                                  : 'border-dashed border-white/5 bg-transparent opacity-45'
                              }`}
                            >
                              <Award className={`w-5 h-5 ${badge.unlocked ? 'text-emerald-400' : 'text-slate-600'}`} />
                              <span className="text-[0.5rem] text-white uppercase font-bold truncate max-w-full">{badge.name}</span>
                              
                              <div className="w-full pt-1.5 flex gap-1 justify-center">
                                {badge.unlocked ? (
                                  <button
                                    onClick={() => handleRevokeBadge(badge.id)}
                                    className="px-1.5 py-0.5 rounded border border-red-500/30 bg-red-950/15 text-red-400 text-[0.42rem] font-bold uppercase cursor-pointer"
                                  >
                                    Revoke
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAssignBadge(badge.id, badge.description)}
                                    className="px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/15 text-cyan-400 text-[0.42rem] font-bold uppercase cursor-pointer"
                                  >
                                    Assign
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Export report button */}
                      <button
                        onClick={() => handleDownloadReport('academic', selectedUser.id)}
                        disabled={downloadingReport !== null}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-[#22d3ee]/20 text-[0.55rem] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                      >
                        {downloadingReport ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 text-cyan-400" />
                        )}
                        Export Student PDF Report
                      </button>

                    </div>
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CURRICULUM SUBJECT MODAL */}
      <AnimatePresence>
        {showSubjectModal && selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubjectModal(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-[#080d16] border border-white/10 rounded-2xl p-5 z-50 text-left font-mono space-y-4"
            >
              <h3 className="text-xs font-bold text-white uppercase">[ Modify Student Curriculum ]</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">Branch / Dept</label>
                  <input
                    type="text"
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">Semester</label>
                  <input
                    type="text"
                    value={editSem}
                    onChange={(e) => setEditSem(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest">Affiliation / Inst</label>
                  <input
                    type="text"
                    value={editInst}
                    onChange={(e) => setEditInst(e.target.value)}
                    placeholder={selectedUser.fullName + " College"}
                    className="bg-slate-950/60 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowSubjectModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white text-[0.55rem] font-bold uppercase transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCurriculumSave}
                  className="px-3.5 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-[#22d3ee] text-[0.55rem] font-bold uppercase transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
