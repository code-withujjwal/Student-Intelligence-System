import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, AlertTriangle, TrendingUp, ChevronDown, Check, X,
  BookOpen, Layers, Settings, FileText, Send, HelpCircle, Map, ArrowLeft
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import toast from 'react-hot-toast';

interface TimeSpentVector {
  id: string;
  nodeId: string;
  subject: string;
  unit: number;
  timeSpentSeconds: number;
  status: 'CORRECT' | 'INCORRECT';
  complexity: 'EASY' | 'MEDIUM' | 'HARD';
}

interface StudentTelemetry {
  studentId: string;
  name: string;
  globalMastery: number;
  recentStatus: 'ANOMALY_FLAGGED' | 'OPTIMAL';
  weakestNode: string;
  timeSpentVectors: TimeSpentVector[];
}

interface BlueprintManifest {
  id: string;
  name: string;
  subject: string;
  units: number[];
  composition: {
    conceptual: number;
    analytical: number;
    code: number;
  };
  deployedTo: string;
  status: string;
}

const CORE_CLASSROOM_DATA: StudentTelemetry[] = [
  {
    studentId: "STU_401",
    name: "Rahul Sharma",
    globalMastery: 74,
    recentStatus: "ANOMALY_FLAGGED",
    weakestNode: "AVL_ROTATION",
    timeSpentVectors: [
      { id: "VEC_01", nodeId: "AVL_ROTATION", subject: "DSA", unit: 3, timeSpentSeconds: 4, status: "CORRECT", complexity: "HARD" },
      { id: "VEC_02", nodeId: "SQL_JOINS", subject: "DBMS", unit: 2, timeSpentSeconds: 140, status: "INCORRECT", complexity: "MEDIUM" }
    ]
  },
  {
    studentId: "STU_402",
    name: "Aman Verma",
    globalMastery: 48,
    recentStatus: "OPTIMAL",
    weakestNode: "CONCURRENCY",
    timeSpentVectors: [
      { id: "VEC_03", nodeId: "SEMAPHORES", subject: "OS", unit: 4, timeSpentSeconds: 65, status: "CORRECT", complexity: "MEDIUM" },
      { id: "VEC_04", nodeId: "CONCURRENCY", subject: "DBMS", unit: 4, timeSpentSeconds: 195, status: "INCORRECT", complexity: "HARD" }
    ]
  }
];

const INITIAL_BLUEPRINTS: BlueprintManifest[] = [
  { id: "DSA_MID", name: "DSA Sessional Paper I", subject: "DSA", units: [1, 2, 3], composition: { conceptual: 40, analytical: 40, code: 20 }, deployedTo: "All Students", status: "ACTIVE" },
  { id: "DBMS_REM", name: "DBMS Remedial Patch Run", subject: "DBMS", units: [3, 4], composition: { conceptual: 70, analytical: 30, code: 0 }, deployedTo: "Mastery < 50%", status: "ACTIVE" }
];

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [roster, setRoster] = useState<StudentTelemetry[]>(CORE_CLASSROOM_DATA);
  const [blueprints, setBlueprints] = useState<BlueprintManifest[]>(INITIAL_BLUEPRINTS);
  const [activeSubView, setActiveSubView] = useState<string>('audit');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTelemetry() {
      try {
        setLoading(true);
        const res = await apiClient.get<any>('/teacher/dashboard');
        if (res && res.success && res.data && isMounted) {
          setRoster(res.data.roster);
          setBlueprints(res.data.blueprints);
        }
      } catch (err: any) {
        console.error("Failed to load backend dashboard telemetry:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTelemetry();
    return () => { isMounted = false; };
  }, []);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  const [subject, setSubject] = useState<string>('DSA');
  const [selectedUnits, setSelectedUnits] = useState<number[]>([]);
  const [paperName, setPaperName] = useState<string>('');

  const [conceptual, setConceptual] = useState<number>(30);
  const [analytical, setAnalytical] = useState<number>(40);
  const [code, setCode] = useState<number>(30);

  const [targetPool, setTargetPool] = useState<'ALL' | 'REMEDIAL'>('ALL');
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const totalCompositionSum = Number(conceptual) + Number(analytical) + Number(code);
  const isCompositionValid = totalCompositionSum === 100;

  const totalAuditedStudents = roster.length;
  const integrityAnomaliesCount = roster.filter(
    s => s.recentStatus === 'ANOMALY_FLAGGED'
  ).length;

  const avgClassroomMastery = totalAuditedStudents > 0
    ? Math.round(roster.reduce((acc, s) => acc + s.globalMastery, 0) / totalAuditedStudents)
    : 0;

  const toggleStudentExpand = (id: string) => {
    setExpandedStudent(prev => (prev === id ? null : id));
  };

  const toggleUnitSelection = (unitNum: number) => {
    setSelectedUnits(prev =>
      prev.includes(unitNum) ? prev.filter(x => x !== unitNum) : [...prev, unitNum]
    );
  };

  const handleLaunchBlueprint = async () => {
    setErrorText(null);
    if (!paperName.trim()) {
      setErrorText('Exam blueprint identifier name cannot be empty.');
      return;
    }
    if (selectedUnits.length === 0) {
      setErrorText('Select at least one curriculum unit.');
      return;
    }
    if (!isCompositionValid) {
      setErrorText('The total blueprint weightage balance must sum up to exactly 100%.');
      return;
    }

    const payload = {
      name: paperName,
      subject,
      units: [...selectedUnits].sort(),
      composition: {
        conceptual: Number(conceptual),
        analytical: Number(analytical),
        code: Number(code)
      },
      deployedTo: targetPool
    };

    try {
      const res = await apiClient.post<any>('/teacher/blueprints', payload);
      if (res && res.success && res.data) {
        const newBlueprint: BlueprintManifest = res.data;
        setBlueprints(prev => [newBlueprint, ...prev]);
        setShowSuccessToast(true);
        setPaperName('');
        setSelectedUnits([]);
        setConceptual(30);
        setAnalytical(40);
        setCode(30);
        setTargetPool('ALL');

        setTimeout(() => {
          setShowSuccessToast(false);
        }, 4000);
      } else {
        setErrorText(res?.message || 'Failed to deploy exam blueprint manifest.');
      }
    } catch (err: any) {
      console.error('Failed to deploy blueprint', err);
      setErrorText(err.message || 'Failed to deploy exam blueprint manifest.');
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-slate-100 animate-fade-in"
      style={{ background: '#060912', fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(34,211,238,0.04) 0%, transparent 50%)'
        }}
      />

      <header
        className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(6,9,18,0.8)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5 mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="tracking-widest font-extrabold uppercase text-[0.6rem] text-[#6366F1] flex items-center gap-1.5 font-mono">
                <Shield className="w-3 h-3 text-[#6366F1]" /> Security Manifest [KARL_SYS]
              </p>
              <h1 className="text-sm font-bold text-white tracking-wide mt-0.5 font-mono">
                TEACHER DEPLOYMENT WORKSPACE
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/syllabus')}
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wide border border-white/5 bg-[#0e1322]/50 hover:bg-[#0e1322] transition-all text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <Map className="w-3.5 h-3.5" /> Syllabus Map
            </button>
            <div className="relative w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" className="animate-spin" style={{ animationDuration: '6s', color: '#6366F1' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" fill="none" opacity="0.4" />
                <circle cx="12" cy="12" r="6" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 4" fill="none" opacity="0.6" />
              </svg>
              <div className="absolute w-1.5 h-1.5 rounded-full bg-[#22d3ee] shadow-[0_0_8px_#22d3ee]" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-8 relative z-10">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white font-mono">
              Academic Control Dashboard
            </h2>
            <p className="text-[0.65rem] text-slate-500 uppercase tracking-wider font-mono mt-1">
              Proctored Telemetry & Algorithmic Exam Builder
            </p>
          </div>

          <div className="flex gap-2 p-1 rounded-xl border border-white/5 bg-[#0e1322]/60 w-fit shrink-0">
            <button
              onClick={() => setActiveSubView('audit')}
              className="px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all uppercase"
              style={{
                background: activeSubView === 'audit' ? 'rgba(99,102,241,0.15)' : 'transparent',
                border: activeSubView === 'audit' ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                color: activeSubView === 'audit' ? '#a5b4fc' : '#64748B',
              }}
            >
              🔍 Classroom Behavioral Audit
            </button>
            <button
              onClick={() => setActiveSubView('builder')}
              className="px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all uppercase"
              style={{
                background: activeSubView === 'builder' ? 'rgba(34,211,238,0.15)' : 'transparent',
                border: activeSubView === 'builder' ? '1px solid rgba(34,211,238,0.3)' : '1px solid transparent',
                color: activeSubView === 'builder' ? '#86efac' : '#64748B',
              }}
            >
              🛠️ Blueprint Manifest Builder
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 110, damping: 16 }}
          className="grid lg:grid-cols-12 gap-6 items-stretch"
        >
          <div className="lg:col-span-8 flex flex-col gap-6">
            <AnimatePresence mode="wait">
              {activeSubView === 'audit' ? (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Class Total Count', value: totalAuditedStudents, color: 'text-white', icon: Users, bg: 'bg-[#0e1322]/40 backdrop-blur-md' },
                      { label: 'Flagged Anomalies', value: integrityAnomaliesCount, color: integrityAnomaliesCount > 0 ? 'text-red-400' : 'text-slate-400', icon: AlertTriangle, bg: integrityAnomaliesCount > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-[#0e1322]/40 backdrop-blur-md' },
                      { label: 'Dynamic Average Mastery', value: `${avgClassroomMastery}%`, color: 'text-[#22d3ee]', icon: TrendingUp, bg: 'bg-[#0e1322]/40 backdrop-blur-md' },
                    ].map((widget, i) => {
                      const Icon = widget.icon;
                      return (
                        <div
                          key={i}
                          className={`rounded-2xl p-5 border border-white/5 flex flex-col justify-between min-h-[110px] ${widget.bg}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest leading-none font-mono">
                              {widget.label}
                            </span>
                            <Icon className="w-4 h-4 text-slate-500" />
                          </div>
                          <p className={`text-2xl font-bold font-mono tracking-tight mt-3 ${widget.color.startsWith('text-') ? widget.color : ''}`} style={{ color: widget.color.startsWith('text-') ? undefined : widget.color }}>
                            {widget.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5">
                    <div className="mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#a5b4fc] font-mono">
                        Student Telemetry Proctored Roster
                      </h3>
                      <p className="text-[0.7rem] text-slate-500 uppercase tracking-wider font-mono mt-0.5">
                        Audit active student session vectors for speed anomalies and concept mapping gaps
                      </p>
                    </div>

                    <div className="space-y-3">
                      {roster.map(student => {
                        const isExpanded = expandedStudent === student.studentId;
                        const isAlert = student.recentStatus === 'ANOMALY_FLAGGED';

                        return (
                          <div
                            key={student.studentId}
                            className="border border-white/5 rounded-xl overflow-hidden bg-[#070b16]/30"
                          >
                            <div
                              onClick={() => toggleStudentExpand(student.studentId)}
                              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none hover:bg-white/[0.01] transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center border font-mono text-xs font-bold shrink-0"
                                  style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    borderColor: 'rgba(255,255,255,0.08)',
                                    color: '#a5b4fc'
                                  }}
                                >
                                  {student.studentId.split('_')[1]}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                                    {student.name}
                                  </h4>
                                  <p className="text-[0.65rem] text-slate-500 font-mono mt-0.5 uppercase">
                                    WEAKEST_NODE: <span className="text-[#a5b4fc] font-bold">{student.weakestNode}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between md:justify-end gap-4">
                                <div className="flex items-center gap-2">
                                  {isAlert ? (
                                    <span className="animate-pulse px-2.5 py-1 rounded-full text-[0.55rem] font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/30 text-red-400 font-mono">
                                      ⚠️ INTEGRITY ALERT: SPEED ANOMALY
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 rounded-full text-[0.55rem] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                                      OPTIMAL OPERATIONS
                                    </span>
                                  )}

                                  <div
                                    className="px-2 py-0.5 rounded text-[0.65rem] font-bold font-mono border"
                                    style={{
                                      background: 'rgba(34,211,238,0.1)',
                                      borderColor: 'rgba(34,211,238,0.3)',
                                      color: '#22d3ee'
                                    }}
                                  >
                                    M_SCR: {student.globalMastery}%
                                  </div>
                                </div>

                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="text-slate-500 hover:text-white"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </motion.div>
                              </div>
                            </div>

                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="border-t border-white/5 bg-slate-950/40 p-4 space-y-3">
                                    <p className="text-[0.6rem] font-extrabold uppercase text-slate-500 tracking-wider font-mono">
                                      DETAILED TELEMETRY VECTOR LOGS
                                    </p>

                                    <div className="space-y-2">
                                      {student.timeSpentVectors.map(vec => {
                                        const isRapidHard =
                                          vec.status === 'CORRECT' &&
                                          vec.complexity === 'HARD' &&
                                          vec.timeSpentSeconds <= 5;

                                        return (
                                          <div
                                            key={vec.id}
                                            className="p-3.5 rounded-xl border text-xs font-semibold relative overflow-hidden transition-all"
                                            style={{
                                              background: isRapidHard ? 'rgba(245,158,11,0.06)' : 'rgba(255,255,255,0.02)',
                                              border: isRapidHard ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.05)',
                                              boxShadow: isRapidHard ? '0 0 16px rgba(245,158,11,0.08)' : 'none'
                                            }}
                                          >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-[0.6rem] text-slate-500 font-bold px-1 py-0.5 rounded border border-white/5 bg-slate-950">
                                                  {vec.id}
                                                </span>
                                                <span className="text-white font-mono text-[0.7rem] uppercase tracking-wide">
                                                  {vec.subject} · Unit {vec.unit} · <span className="font-bold text-[#a5b4fc]">{vec.nodeId}</span>
                                                </span>
                                              </div>

                                              <div className="flex items-center gap-2.5 flex-wrap">
                                                <span className="text-[0.6rem] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-slate-400">
                                                  TIME_SPENT: {vec.timeSpentSeconds}s
                                                </span>
                                                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                                                  vec.complexity === 'HARD' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
                                                  vec.complexity === 'MEDIUM' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' :
                                                  'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                                }`}>
                                                  {vec.complexity}
                                                </span>
                                                <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono ${
                                                  vec.status === 'CORRECT' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                                                  'bg-red-500/10 border border-red-500/30 text-red-400'
                                                }`}>
                                                  {vec.status}
                                                </span>
                                              </div>
                                            </div>

                                            {isRapidHard && (
                                              <div className="mt-2.5 pt-2 border-t border-[#f59e0b]/20 flex items-center gap-2">
                                                <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
                                                <span className="text-[0.6rem] font-extrabold uppercase tracking-widest text-[#f59e0b] font-mono">
                                                  [ CRITICAL ANOMALY: RAPID HIGH-COMPLEXITY SUBMISSION ]
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="builder"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 space-y-6"
                >
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#22d3ee] font-mono">
                      Algorithmic Blueprint Manifest Builder
                    </h3>
                    <p className="text-[0.7rem] text-slate-500 uppercase tracking-wider font-mono mt-0.5">
                      Configure exam metadata, coverage boundaries, and balance algorithmic weight compositions
                    </p>
                  </div>

                  {errorText && (
                    <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400 flex items-center gap-2 font-mono">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{errorText}</span>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">
                        Exam Identifier Name
                      </label>
                      <input
                        type="text"
                        value={paperName}
                        onChange={(e) => setPaperName(e.target.value)}
                        placeholder="e.g. DSA Final Term Matrix"
                        className="w-full px-4 py-3 rounded-xl bg-[#090d16]/60 border border-white/5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white/20 transition-all text-xs font-semibold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">
                        Subject Syllabus Domain
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#090d16]/60 border border-white/5 text-slate-200 focus:outline-none focus:border-white/20 transition-all text-xs font-bold font-mono"
                      >
                        <option value="DSA">DSA — Data Structures & Algorithms</option>
                        <option value="DBMS">DBMS — Database Management Systems</option>
                        <option value="OS">OS — Operating Systems</option>
                        <option value="CN">CN — Computer Networks</option>
                        <option value="OOP">OOP — Object Oriented Programming (Java)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider font-mono mb-2.5">
                      Target Unit Boundary Grid
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map(unitNum => {
                        const isSelected = selectedUnits.includes(unitNum);
                        return (
                          <button
                            key={unitNum}
                            onClick={() => toggleUnitSelection(unitNum)}
                            className="py-3.5 rounded-xl border text-center text-[0.65rem] font-extrabold uppercase transition-all select-none font-mono"
                            style={{
                              background: isSelected ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.02)',
                              borderColor: isSelected ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.05)',
                              color: isSelected ? '#a5f3fc' : '#64748B',
                              boxShadow: isSelected ? '0 0 12px rgba(34,211,238,0.1)' : 'none'
                            }}
                          >
                            Unit 0{unitNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/5 bg-[#090d16]/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.65rem] font-extrabold uppercase text-slate-500 tracking-wider font-mono">
                        Composition Balancer weightage deck
                      </span>
                      <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded font-mono ${
                        isCompositionValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        Sum: {totalCompositionSum}% / 100%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: '% Conceptual', value: conceptual, setter: setConceptual },
                        { label: '% Analytical', value: analytical, setter: setAnalytical },
                        { label: '% Code-Output', value: code, setter: setCode },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <label className="text-[0.58rem] font-extrabold uppercase text-slate-500 tracking-wider font-mono">
                            {item.label}
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.value}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                                item.setter(val);
                              }}
                              className="w-full pl-3 pr-8 py-2 rounded-lg bg-[#070b16]/80 border border-white/5 text-slate-300 font-mono font-bold focus:outline-none focus:border-white/10 text-xs"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-slate-500 font-mono">
                              %
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 items-center font-mono">
                    <div>
                      <label className="block text-[0.65rem] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Recipient Target Layer
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-[#090d16]/60 p-1 border border-white/5 rounded-xl">
                        <button
                          onClick={() => setTargetPool('ALL')}
                          className="py-2.5 rounded-lg text-[0.58rem] font-bold uppercase transition-all"
                          style={{
                            background: targetPool === 'ALL' ? 'rgba(255,255,255,0.06)' : 'transparent',
                            color: targetPool === 'ALL' ? '#fff' : '#64748B',
                            border: targetPool === 'ALL' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
                          }}
                        >
                          ALL STUDENTS
                        </button>
                        <button
                          onClick={() => setTargetPool('REMEDIAL')}
                          className="py-2.5 rounded-lg text-[0.58rem] font-bold uppercase transition-all"
                          style={{
                            background: targetPool === 'REMEDIAL' ? 'rgba(245,158,11,0.15)' : 'transparent',
                            color: targetPool === 'REMEDIAL' ? '#f59e0b' : '#64748B',
                            border: targetPool === 'REMEDIAL' ? '1px solid rgba(245,158,11,0.3)' : '1px solid transparent'
                          }}
                        >
                          REMEDIAL ONLY
                        </button>
                      </div>
                    </div>

                    <div className="pt-5">
                      <button
                        onClick={handleLaunchBlueprint}
                        disabled={!isCompositionValid}
                        className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 ${
                          isCompositionValid
                            ? 'bg-gradient-to-r from-[#22d3ee] to-[#6366F1] text-slate-900 shadow-lg shadow-[#22d3ee]/20 hover:brightness-110 cursor-pointer'
                            : 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Send className="w-4 h-4" /> DEPLOY EXAM BLUEPRINT MANIFEST
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex-1 flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center gap-2 mb-4 font-mono">
                  <Layers className="w-4 h-4 text-[#22d3ee]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    LIVE SYSTEM MANIFESTS
                  </h3>
                </div>

                <div className="space-y-3">
                  {blueprints.map(manifest => (
                    <div
                      key={manifest.id}
                      className="p-3.5 rounded-xl border border-white/5 bg-[#070b16]/40 flex flex-col justify-between gap-2.5 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[0.55rem] text-[#22d3ee] font-bold bg-[#090d16] px-1 py-0.5 rounded border border-[#22d3ee]/20">
                              {manifest.id}
                            </span>
                            <span
                              className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono"
                              style={{
                                background: 'rgba(99,102,241,0.15)',
                                color: '#a5b4fc',
                                border: '1px solid rgba(99,102,241,0.3)'
                              }}
                            >
                              {manifest.subject}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-2 tracking-wide leading-tight truncate font-mono uppercase">
                            {manifest.name}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                          <span className="text-[0.52rem] font-extrabold uppercase tracking-wider text-emerald-400 font-mono">
                            RUNNING
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[0.6rem] border-t border-white/5 pt-2 font-mono">
                        <div>
                          <p className="text-slate-500 font-bold uppercase">UNITS</p>
                          <p className="text-slate-300 font-semibold">
                            U_{manifest.units.join(', ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 font-bold uppercase">RECIPIENTS</p>
                          <p className="text-slate-300 font-semibold truncate">
                            {manifest.deployedTo}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-950/60 p-2 border border-white/5 text-[0.55rem] font-mono flex items-center justify-between text-slate-500 gap-1.5">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#a5b4fc]" /> C: {manifest.composition.conceptual}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#fcd34d]" /> A: {manifest.composition.analytical}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#a5f3fc]" /> O: {manifest.composition.code}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6 text-center space-y-2 font-mono">
                <p className="text-[0.58rem] font-bold text-slate-600 uppercase tracking-widest">
                  Operational Control Status
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[0.6rem] font-bold text-emerald-400 uppercase tracking-widest">
                  <Check className="w-3.5 h-3.5" /> TELEMETRY FEEDS SYNCED
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-xl border border-emerald-500/30 bg-[#070b16] shadow-2xl flex items-center gap-3.5 max-w-sm font-mono"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide uppercase">
                EXAM BLUEPRINT DEPLOYED
              </h4>
              <p className="text-[0.65rem] text-slate-400 leading-normal mt-0.5">
                New manifest successfully injected into active system memory streams.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-slate-600 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
