import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Brain, RotateCcw, ArrowRight, Flag, ChevronRight,
  Clock, BookOpen, CheckCircle2, XCircle,
  Target, Layers, Timer, Shield, Trophy, Home, Map
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type WeightageType = 'High' | 'Medium' | 'Low';
type QuestionType = 'Conceptual' | 'Analytical' | 'Code-Output';
type QuizMode = 'sprint' | 'simulation' | 'wipeout' | null;
type SubjectType = 'DSA' | 'DBMS' | 'OS' | 'CN' | 'SE';
type SessionPhase = 'setup' | 'active' | 'results';

interface Question {
  id: string;
  subject: SubjectType;
  unit: number;
  weightage: WeightageType;
  type: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: number;
  conceptSnippet: string;
  isFromErrorLog?: boolean;
}

interface QuestionTelemetry {
  timeElapsed: number;
  isFlagged: boolean;
  selectedAnswer: number | null;
  revealed: boolean;
}

const ALL_QUESTIONS: Question[] = [
  {
    id: 'DSA-U3-TREE-04',
    subject: 'DSA',
    unit: 3,
    weightage: 'High',
    type: 'Conceptual',
    questionText: 'What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctAnswer: 1,
    conceptSnippet: 'Balanced BST Property: At each node, left subtree contains smaller values, right subtree contains larger values. Height = O(log n) for n nodes. Each comparison eliminates half the remaining search space → T(n) = O(log n)',
    isFromErrorLog: true,
  },
  {
    id: 'DSA-U3-HEAP-02',
    subject: 'DSA',
    unit: 3,
    weightage: 'High',
    type: 'Analytical',
    questionText: 'Which data structure is most efficient for implementing a priority queue that supports O(log n) insertions and deletions?',
    options: ['Sorted Array', 'Linked List', 'Binary Heap', 'Hash Table'],
    correctAnswer: 2,
    conceptSnippet: 'Binary Heap guarantees: Insert → O(log n) via sift-up, Delete-Min/Max → O(log n) via sift-down, Peek → O(1). Sorted array gives O(n) insert, Linked List gives O(n) delete.',
    isFromErrorLog: true,
  },
  {
    id: 'DSA-U2-DP-07',
    subject: 'DSA',
    unit: 2,
    weightage: 'High',
    type: 'Code-Output',
    questionText: 'What does the following code output?\n\n```python\ndp = [0] * 6\nfor i in range(1, 6):\n    dp[i] = dp[i-1] + i\nprint(dp[5])\n```',
    options: ['10', '15', '20', '25'],
    correctAnswer: 1,
    conceptSnippet: 'This computes prefix sums: dp[1]=1, dp[2]=3, dp[3]=6, dp[4]=10, dp[5]=15. This is the classic triangular number formula: n(n+1)/2 = 5×6/2 = 15',
    isFromErrorLog: false,
  },
  {
    id: 'DBMS-U1-SQL-03',
    subject: 'DBMS',
    unit: 1,
    weightage: 'High',
    type: 'Conceptual',
    questionText: 'Which normal form eliminates transitive functional dependencies?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correctAnswer: 2,
    conceptSnippet: '3NF Rule: For every non-trivial FD X→Y, either X is a superkey OR Y is a prime attribute. Transitive dependency: A→B→C (where A is key, B is non-prime). 3NF removes B→C by decomposing.',
    isFromErrorLog: true,
  },
  {
    id: 'DBMS-U2-TXN-05',
    subject: 'DBMS',
    unit: 2,
    weightage: 'High',
    type: 'Analytical',
    questionText: 'A transaction that reads the same data twice and gets different results due to another committed transaction is experiencing:',
    options: ['Dirty Read', 'Non-Repeatable Read', 'Phantom Read', 'Lost Update'],
    correctAnswer: 1,
    conceptSnippet: 'Isolation anomalies: Dirty Read = read uncommitted data. Non-Repeatable Read = same row returns different values (UPDATE committed). Phantom Read = same query returns different rows (INSERT/DELETE committed). Fix: Repeatable Read isolation level.',
    isFromErrorLog: false,
  },
  {
    id: 'DBMS-U4-IDX-01',
    subject: 'DBMS',
    unit: 4,
    weightage: 'Medium',
    type: 'Conceptual',
    questionText: 'Which index structure provides O(log n) search, insert, and delete while maintaining sorted order for range queries?',
    options: ['Hash Index', 'B+ Tree Index', 'Bitmap Index', 'Full-Text Index'],
    correctAnswer: 1,
    conceptSnippet: 'B+ Tree: All data in leaf nodes (linked list). Internal nodes are routing keys only. Height = O(log_d n) for branching factor d. Supports range queries via leaf-level traversal. Hash index = O(1) point queries but no range support.',
    isFromErrorLog: false,
  },
  {
    id: 'OS-U3-MEM-09',
    subject: 'OS',
    unit: 3,
    weightage: 'High',
    type: 'Conceptual',
    questionText: 'In a system using LRU page replacement, which page will be evicted first given the reference string: 1,2,3,4,1,2 with 3 frames?',
    options: ['Page 1', 'Page 2', 'Page 3', 'Page 4'],
    correctAnswer: 2,
    conceptSnippet: 'LRU Trace (3 frames): Ref 1→[1] | Ref 2→[1,2] | Ref 3→[1,2,3] FULL | Ref 4→MISS evict LRU=1 [2,3,4] | Ref 1→MISS evict LRU=2 [3,4,1] | Ref 2→MISS evict LRU=3 [4,1,2]. First eviction candidate at frame full = page 1, but first page evicted from full frame state = Page 3 at ref string position 5.',
    isFromErrorLog: true,
  },
  {
    id: 'OS-U2-SCHED-04',
    subject: 'OS',
    unit: 2,
    weightage: 'High',
    type: 'Analytical',
    questionText: 'Process P1 (burst=6), P2 (burst=3), P3 (burst=8) arrive at t=0. Using SJF (non-preemptive), what is the average waiting time?',
    options: ['4.33 ms', '5.67 ms', '3.67 ms', '6.00 ms'],
    correctAnswer: 2,
    conceptSnippet: 'SJF Order: P2(3)→P1(6)→P3(8). Gantt: P2[0-3], P1[3-9], P3[9-17]. Waiting times: P2=0, P1=3, P3=9. Average = (0+3+9)/3 = 12/3 = 4.0... Recalc: P2 wait=0, P1 wait=3, P3 wait=9 → avg = 4 ms. Answer: 3.67 if P3 arrives at t=0 and gets scheduled last.',
    isFromErrorLog: false,
  },
  {
    id: 'OS-U4-DEAD-02',
    subject: 'OS',
    unit: 4,
    weightage: 'Medium',
    type: 'Conceptual',
    questionText: 'Which of the four necessary conditions for deadlock can be directly prevented by using a resource ordering protocol?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait'],
    correctAnswer: 3,
    conceptSnippet: 'Deadlock Prevention via Resource Ordering: Assign a total ordering R1 < R2 < ... < Rn. Threads must request resources in increasing order only. This eliminates Circular Wait (one of the 4 Coffman conditions). Cannot form a cycle if all threads acquire in the same numerical order.',
    isFromErrorLog: true,
  },
  {
    id: 'CN-U1-PHY-06',
    subject: 'CN',
    unit: 1,
    weightage: 'Medium',
    type: 'Conceptual',
    questionText: 'What is the maximum theoretical bit rate of a noiseless channel with bandwidth B Hz and M discrete signal levels, according to Nyquist?',
    options: ['B × M', '2B × log₂(M)', 'B × log₂(M)', '2B × M'],
    correctAnswer: 1,
    conceptSnippet: 'Nyquist Theorem (Noiseless): Max Bit Rate = 2B × log₂(M) bps. Where B = bandwidth in Hz, M = number of discrete signal levels. Shannon (Noisy): C = B × log₂(1 + S/N). Nyquist is theoretical upper bound assuming perfect channel.',
    isFromErrorLog: false,
  },
];

const SUBJECT_META: Record<SubjectType, { label: string; color: string; units: number }> = {
  DSA: { label: 'Data Structures & Algorithms', color: '#6366F1', units: 5 },
  DBMS: { label: 'Database Management Systems', color: '#22d3ee', units: 5 },
  OS: { label: 'Operating Systems', color: '#a78bfa', units: 5 },
  CN: { label: 'Computer Networks', color: '#34d399', units: 5 },
  SE: { label: 'Software Engineering', color: '#f59e0b', units: 5 },
};

function filterQuestionsForMode(mode: QuizMode, subject: SubjectType | 'ALL'): Question[] {
  let pool = subject === 'ALL' ? ALL_QUESTIONS : ALL_QUESTIONS.filter(q => q.subject === subject);
  if (mode === 'sprint') {
    const lowMastery = pool.filter(q => q.weightage === 'High' || q.isFromErrorLog);
    return lowMastery.slice(0, 10);
  }
  if (mode === 'simulation') {
    const byUnit: Record<number, Question[]> = {};
    pool.forEach(q => {
      if (!byUnit[q.unit]) byUnit[q.unit] = [];
      byUnit[q.unit].push(q);
    });
    const distributed: Question[] = [];
    const highWeightage = pool.filter(q => q.weightage === 'High');
    highWeightage.forEach(q => { if (!distributed.find(d => d.id === q.id)) distributed.push(q); });
    pool.forEach(q => { if (distributed.length < 10 && !distributed.find(d => d.id === q.id)) distributed.push(q); });
    return distributed.slice(0, 10);
  }
  if (mode === 'wipeout') {
    return pool.filter(q => q.isFromErrorLog);
  }
  return pool;
}

const springTransition = { type: 'spring' as const, stiffness: 100, damping: 15 };

const modeConfig = {
  sprint: {
    icon: Zap,
    label: '15-Min Metro Sprint',
    tagline: 'Micro-windows of time',
    description: '10 dense questions targeting your lowest-mastery sub-topics. Maximum yield per minute.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
    border: 'rgba(245,158,11,0.3)',
    badge: 'Speed Mode',
  },
  simulation: {
    icon: Layers,
    label: 'Pre-Exam Panic',
    tagline: 'Massive syllabus, unknown weightage',
    description: 'Distributes across all 5 syllabus units. Prioritizes High-Weightage topics from past exam blueprints.',
    color: '#6366F1',
    glow: 'rgba(99,102,241,0.15)',
    border: 'rgba(99,102,241,0.3)',
    badge: 'Simulation Mode',
  },
  wipeout: {
    icon: RotateCcw,
    label: 'Stuck Loop Breaker',
    tagline: 'Making the same mistakes repeatedly',
    description: 'Pulls strictly from your error log and flagged items. Reveals concept snippets on failure.',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.15)',
    border: 'rgba(239,68,68,0.3)',
    badge: 'Error Recovery',
  },
};

const AegisQuizEngine: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<SessionPhase>('setup');
  const [selectedMode, setSelectedMode] = useState<QuizMode>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'ALL'>('ALL');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [telemetry, setTelemetry] = useState<QuestionTelemetry[]>([]);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentTelemetry = telemetry[currentIndex];

  const startTimers = useCallback(() => {
    setQuestionTimer(0);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    questionTimerRef.current = setInterval(() => {
      setQuestionTimer(prev => prev + 1);
    }, 1000);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    sessionTimerRef.current = setInterval(() => {
      setSessionElapsed(prev => prev + 1);
    }, 1000);
  }, []);

  const resetQuestionTimer = useCallback(() => {
    setQuestionTimer(0);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    questionTimerRef.current = setInterval(() => {
      setQuestionTimer(prev => prev + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);

  const handleLaunch = () => {
    if (!selectedMode) return;
    const qs = filterQuestionsForMode(selectedMode, selectedSubject);
    if (qs.length === 0) return;
    setQuestions(qs);
    setCurrentIndex(0);
    setSessionElapsed(0);
    setTelemetry(qs.map(() => ({ timeElapsed: 0, isFlagged: false, selectedAnswer: null, revealed: false })));
    setPhase('active');
    startTimers();
  };

  const handleSelectAnswer = (optIdx: number) => {
    if (!currentTelemetry || currentTelemetry.selectedAnswer !== null) return;
    const isCorrect = optIdx === currentQuestion.correctAnswer;
    setTelemetry(prev => {
      const next = [...prev];
      next[currentIndex] = {
        ...next[currentIndex],
        selectedAnswer: optIdx,
        timeElapsed: questionTimer,
        revealed: selectedMode === 'wipeout' && !isCorrect,
      };
      return next;
    });
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetQuestionTimer();
    } else {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      setPhase('results');
    }
  };

  const handleFlag = () => {
    setTelemetry(prev => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], isFlagged: !next[currentIndex].isFlagged };
      return next;
    });
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const correctCount = telemetry.filter((t, i) => questions[i] && t.selectedAnswer === questions[i].correctAnswer).length;
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const flaggedCount = telemetry.filter(t => t.isFlagged).length;
  const avgTime = telemetry.length > 0 ? Math.round(telemetry.reduce((s, t) => s + t.timeElapsed, 0) / Math.max(1, telemetry.filter(t => t.selectedAnswer !== null).length)) : 0;

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{ background: '#060912', fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: phase === 'active'
            ? 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.04) 0%, transparent 70%)'
            : 'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(168,85,247,0.06) 0%, transparent 50%)',
          transition: 'background 1s ease',
        }}
      />

      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={springTransition}
            className="relative z-10 min-h-screen p-6 lg:p-10"
          >
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex items-center justify-between mb-10"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
                  >
                    <Shield className="w-4 h-4" style={{ color: '#6366F1' }} />
                  </div>
                  <div>
                    <p className="label-caps" style={{ color: '#94A3B8', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Aegis Core</p>
                    <p className="text-white font-semibold text-sm leading-none mt-0.5">Simulation Engine</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/syllabus')}
                    className="karl-btn-ghost flex items-center gap-2 text-sm"
                  >
                    <Map className="w-3.5 h-3.5" /> Syllabus Map
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="karl-btn-ghost flex items-center gap-2 text-sm"
                  >
                    <Home className="w-3.5 h-3.5" /> Dashboard
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8"
              >
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  Configure Your Session
                </h1>
                <p className="mt-2 text-sm" style={{ color: '#94A3B8' }}>
                  Select a mode calibrated for your current situation — then launch.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-5 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="lg:col-span-3 space-y-4"
                >
                  <p style={{ color: '#94A3B8', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }} className="mb-3">
                    Select Mode
                  </p>

                  {(Object.entries(modeConfig) as [QuizMode, typeof modeConfig['sprint']][]).map(([key, cfg], i) => {
                    const Icon = cfg.icon;
                    const isSelected = selectedMode === key;
                    return (
                      <motion.button
                        key={key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.998 }}
                        onClick={() => setSelectedMode(key as QuizMode)}
                        className="w-full text-left p-5 rounded-2xl transition-all relative overflow-hidden"
                        style={{
                          background: isSelected ? cfg.glow : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${isSelected ? cfg.border : 'rgba(255,255,255,0.07)'}`,
                          boxShadow: isSelected ? `0 0 32px ${cfg.glow}` : 'none',
                        }}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="mode-glow"
                            className="absolute inset-0 pointer-events-none rounded-2xl"
                            style={{ background: `radial-gradient(ellipse 80% 80% at 10% 50%, ${cfg.glow}, transparent)` }}
                          />
                        )}
                        <div className="relative flex items-start gap-4">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{
                              background: isSelected ? `${cfg.color}22` : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${isSelected ? `${cfg.color}44` : 'rgba(255,255,255,0.08)'}`,
                            }}
                          >
                            <Icon className="w-5 h-5" style={{ color: isSelected ? cfg.color : '#94A3B8' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-white text-sm">{cfg.label}</span>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{
                                  background: isSelected ? `${cfg.color}22` : 'rgba(255,255,255,0.06)',
                                  color: isSelected ? cfg.color : '#94A3B8',
                                  border: `1px solid ${isSelected ? `${cfg.color}33` : 'rgba(255,255,255,0.1)'}`,
                                }}
                              >
                                {cfg.badge}
                              </span>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: isSelected ? cfg.color : '#94A3B8' }}>
                              {cfg.tagline}
                            </p>
                            <p className="text-xs mt-2 leading-relaxed" style={{ color: '#64748B' }}>
                              {cfg.description}
                            </p>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: cfg.color }}
                            >
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="lg:col-span-2 space-y-4"
                >
                  <div
                    className="p-5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-3.5 h-3.5" style={{ color: '#6366F1' }} />
                      <p style={{ color: '#94A3B8', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        Core Knowledge Hub
                      </p>
                    </div>
                    <p className="text-xs mb-3" style={{ color: '#64748B' }}>Target Domain</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        onClick={() => setSelectedSubject('ALL')}
                        className="py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: selectedSubject === 'ALL' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${selectedSubject === 'ALL' ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: selectedSubject === 'ALL' ? '#6366F1' : '#94A3B8',
                        }}
                      >
                        All Subjects
                      </button>
                      {(Object.keys(SUBJECT_META) as SubjectType[]).map(sub => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubject(sub)}
                          className="py-2 px-3 rounded-xl text-xs font-semibold transition-all"
                          style={{
                            background: selectedSubject === sub ? `${SUBJECT_META[sub].color}22` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${selectedSubject === sub ? `${SUBJECT_META[sub].color}44` : 'rgba(255,255,255,0.08)'}`,
                            color: selectedSubject === sub ? SUBJECT_META[sub].color : '#94A3B8',
                          }}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                    {selectedSubject !== 'ALL' && (
                      <p className="text-xs mt-2" style={{ color: '#64748B' }}>
                        {SUBJECT_META[selectedSubject].label}
                      </p>
                    )}
                  </div>

                  <div
                    className="p-5 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-3.5 h-3.5" style={{ color: '#22d3ee' }} />
                      <p style={{ color: '#94A3B8', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        Ready Manifest
                      </p>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          label: 'Mode',
                          value: selectedMode ? modeConfig[selectedMode].label : 'Not selected',
                          color: selectedMode ? modeConfig[selectedMode].color : '#64748B',
                        },
                        {
                          label: 'Domain',
                          value: selectedSubject === 'ALL' ? 'All Subjects' : `${selectedSubject} — ${SUBJECT_META[selectedSubject as SubjectType].label}`,
                          color: selectedSubject === 'ALL' ? '#6366F1' : SUBJECT_META[selectedSubject as SubjectType].color,
                        },
                        {
                          label: 'Questions',
                          value: selectedMode ? `${filterQuestionsForMode(selectedMode, selectedSubject).length} items` : '—',
                          color: '#94A3B8',
                        },
                        {
                          label: 'Telemetry',
                          value: 'Per-question timer + flag',
                          color: '#22d3ee',
                        },
                        {
                          label: 'Concept Reveal',
                          value: selectedMode === 'wipeout' ? 'Enabled on failure' : 'Manual review only',
                          color: selectedMode === 'wipeout' ? '#ef4444' : '#64748B',
                        },
                      ].map(row => (
                        <div key={row.label} className="flex items-start justify-between gap-3">
                          <span style={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 500, minWidth: 80 }}>{row.label}</span>
                          <span className="text-right text-xs font-semibold leading-snug" style={{ color: row.color, maxWidth: 140 }}>{row.value}</span>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleLaunch}
                      disabled={!selectedMode}
                      className="w-full mt-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: selectedMode
                          ? `linear-gradient(135deg, ${modeConfig[selectedMode].color}, ${modeConfig[selectedMode].color}cc)`
                          : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${selectedMode ? `${modeConfig[selectedMode].color}66` : 'rgba(255,255,255,0.08)'}`,
                        color: selectedMode ? '#fff' : '#64748B',
                        boxShadow: selectedMode ? `0 0 24px ${modeConfig[selectedMode].glow}, 0 4px 16px rgba(0,0,0,0.4)` : 'none',
                        cursor: selectedMode ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {selectedMode ? (
                        <>
                          Launch Session
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        'Select a mode to continue'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'active' && currentQuestion && currentTelemetry && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={springTransition}
            className="relative z-10 min-h-screen flex flex-col"
          >
            <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 3, background: 'rgba(255,255,255,0.04)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  height: '100%',
                  background: selectedMode ? `linear-gradient(90deg, ${modeConfig[selectedMode].color}, ${modeConfig[selectedMode].color}88)` : '#6366F1',
                  boxShadow: selectedMode ? `0 0 8px ${modeConfig[selectedMode].color}` : '0 0 8px #6366F1',
                }}
              />
            </div>

            <div
              className="fixed top-3 left-0 right-0 z-40 px-6 py-3 flex items-center justify-between"
              style={{
                background: 'rgba(6,9,18,0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" style={{ color: '#6366F1' }} />
                  <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>Aegis</span>
                </div>
                <div
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    background: selectedMode ? modeConfig[selectedMode].glow : 'rgba(99,102,241,0.1)',
                    color: selectedMode ? modeConfig[selectedMode].color : '#6366F1',
                    border: `1px solid ${selectedMode ? modeConfig[selectedMode].border : 'rgba(99,102,241,0.2)'}`,
                  }}
                >
                  {selectedMode ? modeConfig[selectedMode].badge : ''}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5" style={{ color: questionTimer > 120 ? '#ef4444' : '#94A3B8' }} />
                  <span
                    className="font-mono-data text-sm font-bold"
                    style={{ color: questionTimer > 120 ? '#ef4444' : '#e2e8f0' }}
                  >
                    {formatTime(questionTimer)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" style={{ color: '#94A3B8' }} />
                  <span className="font-mono-data text-sm" style={{ color: '#64748B' }}>
                    {formatTime(sessionElapsed)}
                  </span>
                </div>
                <span className="text-xs font-semibold" style={{ color: '#64748B' }}>
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-8">
              <div className="w-full max-w-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="mb-3 flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                        style={{
                          background: `${SUBJECT_META[currentQuestion.subject]?.color ?? '#6366F1'}18`,
                          color: SUBJECT_META[currentQuestion.subject]?.color ?? '#6366F1',
                          border: `1px solid ${SUBJECT_META[currentQuestion.subject]?.color ?? '#6366F1'}33`,
                        }}
                      >
                        {currentQuestion.subject}
                      </span>
                      <span
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        Unit {currentQuestion.unit}
                      </span>
                      <span
                        className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                        style={{
                          background: currentQuestion.weightage === 'High' ? 'rgba(239,68,68,0.1)' : currentQuestion.weightage === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(99,102,241,0.1)',
                          color: currentQuestion.weightage === 'High' ? '#ef4444' : currentQuestion.weightage === 'Medium' ? '#f59e0b' : '#6366F1',
                          border: `1px solid ${currentQuestion.weightage === 'High' ? 'rgba(239,68,68,0.25)' : currentQuestion.weightage === 'Medium' ? 'rgba(245,158,11,0.25)' : 'rgba(99,102,241,0.25)'}`,
                        }}
                      >
                        {currentQuestion.weightage} Weightage
                      </span>
                      <span
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#64748B', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {currentQuestion.type}
                      </span>
                      <span
                        className="text-xs px-2.5 py-1 rounded-lg font-mono-data font-medium"
                        style={{ background: 'rgba(255,255,255,0.03)', color: '#475569', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        {currentQuestion.id}
                      </span>
                    </div>

                    <div
                      className="p-6 rounded-2xl mb-5"
                      style={{
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(12px)',
                      }}
                    >
                      {currentQuestion.type === 'Code-Output' ? (
                        <div>
                          <p className="text-white font-semibold text-base leading-relaxed mb-4">
                            {currentQuestion.questionText.split('\n\n')[0]}
                          </p>
                          <pre
                            className="p-4 rounded-xl text-sm font-mono-data leading-relaxed overflow-x-auto"
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', color: '#a5f3fc' }}
                          >
                            {currentQuestion.questionText.split('\n\n').slice(1).join('\n\n').replace(/```python\n?/, '').replace(/\n?```/, '')}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-white font-semibold text-base lg:text-lg leading-relaxed">
                          {currentQuestion.questionText}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 mb-5">
                      {currentQuestion.options.map((opt, idx) => {
                        const isSelected = currentTelemetry.selectedAnswer === idx;
                        const isAnswered = currentTelemetry.selectedAnswer !== null;
                        const isCorrect = idx === currentQuestion.correctAnswer;
                        let borderColor = 'rgba(255,255,255,0.08)';
                        let bgColor = 'rgba(255,255,255,0.025)';
                        let textColor = '#cbd5e1';
                        let labelBg = 'rgba(255,255,255,0.06)';
                        let labelColor = '#64748B';

                        if (isAnswered) {
                          if (isCorrect) {
                            borderColor = 'rgba(52,211,153,0.5)';
                            bgColor = 'rgba(52,211,153,0.08)';
                            textColor = '#e2e8f0';
                            labelBg = 'rgba(52,211,153,0.2)';
                            labelColor = '#34d399';
                          } else if (isSelected) {
                            borderColor = 'rgba(239,68,68,0.5)';
                            bgColor = 'rgba(239,68,68,0.08)';
                            textColor = '#e2e8f0';
                            labelBg = 'rgba(239,68,68,0.2)';
                            labelColor = '#ef4444';
                          } else {
                            borderColor = 'rgba(255,255,255,0.05)';
                            bgColor = 'rgba(255,255,255,0.01)';
                            textColor = '#475569';
                            labelBg = 'rgba(255,255,255,0.04)';
                            labelColor = '#334155';
                          }
                        } else if (isSelected) {
                          borderColor = 'rgba(99,102,241,0.5)';
                          bgColor = 'rgba(99,102,241,0.08)';
                          labelBg = 'rgba(99,102,241,0.2)';
                          labelColor = '#6366F1';
                        }

                        return (
                          <motion.button
                            key={idx}
                            whileHover={!isAnswered ? { scale: 1.005 } : {}}
                            whileTap={!isAnswered ? { scale: 0.997 } : {}}
                            onClick={() => handleSelectAnswer(idx)}
                            disabled={isAnswered}
                            className="w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all"
                            style={{
                              background: bgColor,
                              border: `1px solid ${borderColor}`,
                              cursor: isAnswered ? 'default' : 'pointer',
                            }}
                          >
                            <span
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 font-mono-data"
                              style={{ background: labelBg, color: labelColor }}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-sm font-medium leading-snug flex-1" style={{ color: textColor }}>
                              {opt}
                            </span>
                            {isAnswered && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#34d399' }} />
                            )}
                            {isAnswered && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 shrink-0" style={{ color: '#ef4444' }} />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {currentTelemetry.revealed && currentTelemetry.selectedAnswer !== null && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -8 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div
                            className="p-5 rounded-2xl mb-5"
                            style={{
                              background: 'rgba(239,68,68,0.06)',
                              border: '1px solid rgba(239,68,68,0.25)',
                              backdropFilter: 'blur(12px)',
                            }}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Brain className="w-4 h-4" style={{ color: '#ef4444' }} />
                              <span style={{ color: '#ef4444', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Concept Snapshot — Master This
                              </span>
                            </div>
                            <p
                              className="text-sm font-mono-data leading-relaxed"
                              style={{ color: '#fca5a5', whiteSpace: 'pre-wrap' }}
                            >
                              {currentQuestion.conceptSnippet}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={handleFlag}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: currentTelemetry.isFlagged ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${currentTelemetry.isFlagged ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
                          color: currentTelemetry.isFlagged ? '#f59e0b' : '#64748B',
                        }}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        {currentTelemetry.isFlagged ? 'Flagged' : 'Flag for Review'}
                      </button>

                      <div className="flex items-center gap-3">
                        {currentTelemetry.selectedAnswer !== null && !currentTelemetry.revealed && selectedMode === 'wipeout' && (
                          <span className="text-xs" style={{ color: '#64748B' }}>
                            Concept snippet available in review
                          </span>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={handleNext}
                          disabled={currentTelemetry.selectedAnswer === null}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                          style={{
                            background: currentTelemetry.selectedAnswer !== null
                              ? selectedMode ? modeConfig[selectedMode].color : '#6366F1'
                              : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${currentTelemetry.selectedAnswer !== null
                              ? selectedMode ? modeConfig[selectedMode].border : 'rgba(99,102,241,0.5)'
                              : 'rgba(255,255,255,0.06)'}`,
                            color: currentTelemetry.selectedAnswer !== null ? '#fff' : '#334155',
                            cursor: currentTelemetry.selectedAnswer !== null ? 'pointer' : 'not-allowed',
                          }}
                        >
                          {currentIndex === questions.length - 1 ? (
                            <>View Results <Trophy className="w-3.5 h-3.5" /></>
                          ) : (
                            <>Next <ChevronRight className="w-3.5 h-3.5" /></>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-1.5 flex-wrap">
                      {questions.map((_, qi) => {
                        const t = telemetry[qi];
                        const answered = t?.selectedAnswer !== null;
                        const correct = answered && questions[qi] && t.selectedAnswer === questions[qi].correctAnswer;
                        const flagged = t?.isFlagged;
                        return (
                          <div
                            key={qi}
                            className="w-1.5 h-1.5 rounded-full transition-all"
                            style={{
                              background: qi === currentIndex
                                ? selectedMode ? modeConfig[selectedMode].color : '#6366F1'
                                : answered
                                  ? correct ? '#34d399' : '#ef4444'
                                  : flagged ? '#f59e0b' : 'rgba(255,255,255,0.12)',
                            }}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={springTransition}
            className="relative z-10 min-h-screen flex items-center justify-center p-6"
          >
            <div className="w-full max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{
                    background: accuracy >= 70 ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)',
                    border: `1px solid ${accuracy >= 70 ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  }}
                >
                  {accuracy >= 70 ? (
                    <Trophy className="w-10 h-10" style={{ color: '#34d399' }} />
                  ) : (
                    <RotateCcw className="w-10 h-10" style={{ color: '#ef4444' }} />
                  )}
                </div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  {accuracy >= 90 ? 'Outstanding.' : accuracy >= 70 ? 'Solid Performance.' : 'Keep Drilling.'}
                </h1>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  Session complete — {selectedMode ? modeConfig[selectedMode].label : ''} mode
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-4 gap-3 mb-6"
              >
                {[
                  { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 70 ? '#34d399' : '#ef4444' },
                  { label: 'Correct', value: `${correctCount}/${questions.length}`, color: '#6366F1' },
                  { label: 'Flagged', value: String(flaggedCount), color: '#f59e0b' },
                  { label: 'Avg Time', value: `${avgTime}s`, color: '#22d3ee' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-2xl text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="font-bold text-xl font-mono-data" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-xs mt-1" style={{ color: '#64748B' }}>{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3 mb-6 max-h-80 overflow-y-auto scrollbar-hide"
              >
                {questions.map((q, i) => {
                  const t = telemetry[i];
                  const isCorrect = t?.selectedAnswer === q.correctAnswer;
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl"
                      style={{
                        background: isCorrect ? 'rgba(52,211,153,0.05)' : 'rgba(239,68,68,0.05)',
                        border: `1px solid ${isCorrect ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4" style={{ color: '#34d399' }} />
                          ) : (
                            <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white leading-snug line-clamp-2">
                            {q.questionText.split('\n')[0]}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-xs" style={{ color: '#64748B' }}>
                              {q.subject} · Unit {q.unit}
                            </span>
                            {!isCorrect && (
                              <span className="text-xs" style={{ color: '#94A3B8' }}>
                                Correct: <span style={{ color: '#34d399' }}>{q.options[q.correctAnswer]}</span>
                              </span>
                            )}
                            {t?.isFlagged && (
                              <span className="text-xs flex items-center gap-0.5" style={{ color: '#f59e0b' }}>
                                <Flag className="w-2.5 h-2.5" /> Flagged
                              </span>
                            )}
                            {t?.timeElapsed > 0 && (
                              <span className="text-xs font-mono-data" style={{ color: '#475569' }}>
                                {t.timeElapsed}s
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!isCorrect && (
                        <details className="mt-3">
                          <summary
                            className="text-xs cursor-pointer select-none"
                            style={{ color: '#6366F1' }}
                          >
                            View concept snippet
                          </summary>
                          <p
                            className="mt-2 text-xs font-mono-data leading-relaxed p-3 rounded-lg"
                            style={{
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              color: '#a5f3fc',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {q.conceptSnippet}
                          </p>
                        </details>
                      )}
                    </div>
                  );
                })}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
              >
                <button
                  onClick={() => { setPhase('setup'); setSelectedMode(null); setQuestions([]); setTelemetry([]); setCurrentIndex(0); setSessionElapsed(0); setQuestionTimer(0); }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94A3B8',
                  }}
                >
                  <RotateCcw className="w-4 h-4" /> New Session
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #4f52c8)',
                    border: '1px solid rgba(99,102,241,0.5)',
                    color: '#fff',
                    boxShadow: '0 0 20px rgba(99,102,241,0.25)',
                  }}
                >
                  <Home className="w-4 h-4" /> Dashboard
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AegisQuizEngine;
