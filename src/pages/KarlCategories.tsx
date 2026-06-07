import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Image, Mic, Clock, Layers, Lightbulb,
  Lock, Globe, EyeOff, ChevronDown, Save, Zap, BarChart2, User,
  BookOpen, CheckSquare, Play
} from 'lucide-react';

type Visibility = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
type QuestionFormat = 'MCQ Drill' | 'Assertion & Reason' | 'Match Matrix' | 'Flashcard';
type WorkspaceMode = 'TEACHER_CREATOR' | 'STUDENT_VIEW';

interface QuestionNode {
  id: string;
  text: string;
  format: QuestionFormat;
  imageAttached: boolean;
  imageName: string;
  audioAttached: boolean;
  audioName: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answerKey: 'A' | 'B' | 'C' | 'D';
}

const SUBJECT_NODES = [
  { label: 'Data Structures', code: 'CS-302' },
  { label: 'Database Management Systems', code: 'CS-303' },
  { label: 'Operating Systems', code: 'CS-304' }
];

const EXPIRY_OPTIONS = [
  { label: 'No Expiry', value: 'none' },
  { label: '24 Hours', value: '24h' },
  { label: '3 Days', value: '3d' },
  { label: '7 Days', value: '7d' }
];

const QUESTION_FORMATS: QuestionFormat[] = [
  'MCQ Drill',
  'Assertion & Reason',
  'Match Matrix',
  'Flashcard'
];

const SYNC_TARGETS = [
  { label: 'My Progress', sub: 'Streams scores into mastery tracking curves', icon: BarChart2, color: '#6366f1' },
  { label: 'Profile XP', sub: 'Increments level sliders and study streaks', icon: User, color: '#10b981' },
  { label: 'Teacher Cockpit', sub: 'Logs test-takers and class average for faculty', icon: BookOpen, color: '#f59e0b' }
];

const createBlankQuestion = (): QuestionNode => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  text: '',
  format: 'MCQ Drill',
  imageAttached: false,
  imageName: '',
  audioAttached: false,
  audioName: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  answerKey: 'A'
});

export default function KarlCategories() {
  const navigate = useNavigate();

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('TEACHER_CREATOR');
  const [quizTitle, setQuizTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECT_NODES[0].code);
  const [expiry, setExpiry] = useState('none');
  const [visibility, setVisibility] = useState<Visibility>('PUBLIC');
  const [passcode, setPasscode] = useState('');
  const [isTimed, setIsTimed] = useState(false);
  const [duration, setDuration] = useState(60);
  const [sectionsEnabled, setSectionsEnabled] = useState(false);
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [questions, setQuestions] = useState<QuestionNode[]>([createBlankQuestion()]);
  const [savedPulse, setSavedPulse] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createBlankQuestion()]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof QuestionNode, value: string | boolean) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const simulateImageAttach = (id: string) => {
    updateQuestion(id, 'imageAttached', true);
    updateQuestion(id, 'imageName', 'attached_schema_matrix.png');
  };

  const simulateAudioAttach = (id: string) => {
    updateQuestion(id, 'audioAttached', true);
    updateQuestion(id, 'audioName', 'attached_voice_dictation.mp3');
  };

  const detachImage = (id: string) => {
    updateQuestion(id, 'imageAttached', false);
    updateQuestion(id, 'imageName', '');
  };

  const detachAudio = (id: string) => {
    updateQuestion(id, 'audioAttached', false);
    updateQuestion(id, 'audioName', '');
  };

  const handleSaveAndBroadcast = () => {
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 2000);
  };

  const selectedSubjectLabel = SUBJECT_NODES.find((s) => s.code === subject)?.label ?? '';

  return (
    <div
      className="min-h-screen relative text-white overflow-x-hidden"
      style={{
        background: '#060912',
        backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        fontFamily: '"Space Mono", "JetBrains Mono", "Fira Code", monospace'
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 10% 0%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 35% at 90% 90%, rgba(99,102,241,0.06) 0%, transparent 60%)'
        }}
      />

      <div className="relative z-10 p-6 md:p-10 pb-4">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 border-b border-white/5 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              id="categories-back-btn"
              onClick={() => navigate('/features')}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5 cursor-pointer flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold text-blue-400 font-mono tracking-widest uppercase flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                MANUAL QUIZ ARCHITECT · ACTIVE
              </p>
              <h1 className="text-xl font-black text-white tracking-widest uppercase">
                Quiz Categories & Creator
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-[#0e1322]/80 border border-white/5 rounded-xl p-1">
              <button
                id="mode-creator-btn"
                onClick={() => setWorkspaceMode('TEACHER_CREATOR')}
                className={`px-4 py-1.5 text-[10px] font-black font-mono rounded-lg tracking-wider uppercase transition-all cursor-pointer ${workspaceMode === 'TEACHER_CREATOR' ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.30)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Creator Mode
              </button>
              <button
                id="mode-student-btn"
                onClick={() => setWorkspaceMode('STUDENT_VIEW')}
                className={`px-4 py-1.5 text-[10px] font-black font-mono rounded-lg tracking-wider uppercase transition-all cursor-pointer ${workspaceMode === 'STUDENT_VIEW' ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.30)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Student View
              </button>
            </div>
            <div className="bg-[#0e1322]/80 border border-white/5 px-4 py-2 rounded-lg">
              <span className="text-[10px] text-slate-500 font-mono">SUBJECT: </span>
              <span className="text-[10px] font-bold text-blue-300 font-mono">{subject}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto relative z-10">
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(59,130,246,0.06)' }} />
              <p className="text-[10px] font-bold text-blue-400/80 font-mono tracking-widest uppercase mb-4">
                [ QUIZ METADATA CONFIGURATION ]
              </p>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block mb-1.5">
                    Quiz Title
                  </label>
                  <input
                    id="quiz-title-input"
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. DSA Mid-Term Practice Set"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors uppercase tracking-wide"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block mb-1.5">
                    Syllabus Subject Node
                  </label>
                  <div className="relative">
                    <select
                      id="subject-select"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-[11px] font-bold text-white font-mono uppercase tracking-wide cursor-pointer appearance-none focus:outline-none focus:border-blue-500/40 transition-colors"
                    >
                      {SUBJECT_NODES.map((s) => (
                        <option key={s.code} value={s.code} className="bg-[#0e1322] text-white">
                          {s.label} ({s.code})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider block mb-1.5">
                    Quiz Expiration Window
                  </label>
                  <div className="relative">
                    <select
                      id="expiry-select"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-[11px] font-bold text-white font-mono uppercase tracking-wide cursor-pointer appearance-none focus:outline-none focus:border-blue-500/40 transition-colors"
                    >
                      {EXPIRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#0e1322] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(139,92,246,0.06)' }} />
              <p className="text-[10px] font-bold text-purple-400/80 font-mono tracking-widest uppercase mb-4">
                [ VISIBILITY & SECURITY TIER ]
              </p>

              <div className="flex flex-col gap-2.5 mb-4">
                <button
                  id="visibility-public-btn"
                  onClick={() => setVisibility('PUBLIC')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${visibility === 'PUBLIC' ? 'border-green-500/40 bg-green-500/8 shadow-[0_0_12px_rgba(34,197,94,0.08)]' : 'border-white/5 bg-black/10 hover:border-white/10'}`}
                >
                  <Globe className={`w-4 h-4 flex-shrink-0 ${visibility === 'PUBLIC' ? 'text-green-400' : 'text-slate-600'}`} />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Public</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Pushed globally to all student dashboards</p>
                  </div>
                  {visibility === 'PUBLIC' && <div className="ml-auto w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />}
                </button>

                <button
                  id="visibility-private-btn"
                  onClick={() => setVisibility('PRIVATE')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${visibility === 'PRIVATE' ? 'border-slate-500/40 bg-slate-500/8' : 'border-white/5 bg-black/10 hover:border-white/10'}`}
                >
                  <EyeOff className={`w-4 h-4 flex-shrink-0 ${visibility === 'PRIVATE' ? 'text-slate-400' : 'text-slate-600'}`} />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Private</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Locked as an admin draft — not visible to students</p>
                  </div>
                  {visibility === 'PRIVATE' && <div className="ml-auto w-2 h-2 rounded-full bg-slate-400" />}
                </button>

                <button
                  id="visibility-protected-btn"
                  onClick={() => setVisibility('PROTECTED')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-all duration-200 ${visibility === 'PROTECTED' ? 'border-amber-500/40 bg-amber-500/8 shadow-[0_0_12px_rgba(245,158,11,0.08)]' : 'border-white/5 bg-black/10 hover:border-white/10'}`}
                >
                  <Lock className={`w-4 h-4 flex-shrink-0 ${visibility === 'PROTECTED' ? 'text-amber-400' : 'text-slate-600'}`} />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Protected</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">Students must enter a passcode to unlock</p>
                  </div>
                  {visibility === 'PROTECTED' && <div className="ml-auto w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />}
                </button>
              </div>

              <AnimatePresence>
                {visibility === 'PROTECTED' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1">
                      <label className="text-[10px] font-bold text-amber-400/80 font-mono uppercase tracking-wider block mb-1.5">
                        Access Passcode
                      </label>
                      <input
                        id="passcode-input"
                        type="text"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                        placeholder="e.g. LNCT-DSA-2026"
                        className="w-full bg-amber-500/5 border border-amber-500/30 rounded-lg px-4 py-2.5 text-sm text-amber-300 font-mono placeholder:text-amber-900/60 focus:outline-none focus:border-amber-500/60 transition-colors uppercase tracking-widest"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(59,130,246,0.06)' }} />
              <p className="text-[10px] font-bold text-blue-400/80 font-mono tracking-widest uppercase mb-4">
                [ TEMPORAL ENGINE & EXAM RULES ]
              </p>

              <div className="flex items-center justify-between mb-4 bg-black/20 border border-white/5 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <Clock className={`w-4 h-4 ${isTimed ? 'text-blue-400' : 'text-slate-600'}`} />
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">
                      {isTimed ? 'Countdown Timer On' : 'Self-Paced Practice Mode'}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">
                      {isTimed ? 'Test locks when time runs out' : 'No time penalty applied'}
                    </p>
                  </div>
                </div>
                <button
                  id="timer-toggle-btn"
                  onClick={() => setIsTimed(!isTimed)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 cursor-pointer border ${isTimed ? 'bg-blue-500 border-blue-400/40' : 'bg-slate-800 border-white/10'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${isTimed ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>

              <AnimatePresence>
                {isTimed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="pt-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">Duration</span>
                        <span className="text-base font-black text-white font-mono">
                          {duration} <span className="text-[10px] text-slate-500">min</span>
                        </span>
                      </div>
                      <input
                        id="duration-slider"
                        type="range"
                        min={10}
                        max={240}
                        step={5}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((duration - 10) / 230) * 100}%, rgba(255,255,255,0.08) ${((duration - 10) / 230) * 100}%, rgba(255,255,255,0.08) 100%)`
                        }}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px] text-slate-600 font-mono">10 min</span>
                        <span className="text-[9px] text-slate-600 font-mono">240 min</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-3">
                <div
                  className="flex items-center justify-between bg-black/20 border border-white/5 rounded-lg px-4 py-3 cursor-pointer"
                  onClick={() => setSectionsEnabled(!sectionsEnabled)}
                >
                  <div className="flex items-center gap-3">
                    <Layers className={`w-4 h-4 ${sectionsEnabled ? 'text-purple-400' : 'text-slate-600'}`} />
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wide">Competitive Section Splits</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">
                        {sectionsEnabled ? 'Exam divided into labelled topic sub-modules' : 'Single unified question block'}
                      </p>
                    </div>
                  </div>
                  <div
                    id="sections-checkbox"
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${sectionsEnabled ? 'bg-purple-500 border-purple-400' : 'bg-transparent border-white/20'}`}
                  >
                    {sectionsEnabled && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center justify-between bg-black/20 border border-white/5 rounded-lg px-4 py-3 cursor-pointer"
                  onClick={() => setHintsEnabled(!hintsEnabled)}
                >
                  <div className="flex items-center gap-3">
                    <Lightbulb className={`w-4 h-4 ${hintsEnabled ? 'text-amber-400' : 'text-slate-600'}`} />
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wide">Step-by-Step Study Hints</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">
                        {hintsEnabled ? 'Contextual hints available per question' : 'Hints disabled — full exam mode'}
                      </p>
                    </div>
                  </div>
                  <div
                    id="hints-checkbox"
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${hintsEnabled ? 'bg-amber-500 border-amber-400' : 'bg-transparent border-white/20'}`}
                  >
                    {hintsEnabled && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-blue-400/80 font-mono tracking-widest uppercase mb-1">
                  [ MULTIMEDIA QUESTION MATRIX COMPOSER ]
                </p>
                <p className="text-[11px] text-slate-500 uppercase tracking-wide">
                  {questions.length} question{questions.length !== 1 ? 's' : ''} in this quiz
                </p>
              </div>
              <button
                id="add-question-btn"
                onClick={addQuestion}
                className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 rounded-xl px-4 py-2.5 text-[11px] font-black font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Insert Question Node
              </button>
            </div>

            <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}>
              {questions.map((q, index) => (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-l-2xl" />

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-blue-400/70 font-mono tracking-widest uppercase">
                      Question {index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <select
                          id={`format-select-${q.id}`}
                          value={q.format}
                          onChange={(e) => updateQuestion(q.id, 'format', e.target.value)}
                          className="bg-black/30 border border-white/10 rounded-lg pl-3 pr-7 py-1.5 text-[10px] font-bold text-white font-mono uppercase tracking-wide cursor-pointer appearance-none focus:outline-none focus:border-blue-500/40 transition-colors"
                        >
                          {QUESTION_FORMATS.map((fmt) => (
                            <option key={fmt} value={fmt} className="bg-[#0e1322] text-white">{fmt}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                      </div>
                      {questions.length > 1 && (
                        <button
                          id={`remove-question-${q.id}`}
                          onClick={() => removeQuestion(q.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    id={`question-text-${q.id}`}
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                    placeholder="Type your question here..."
                    rows={3}
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-slate-700 focus:outline-none focus:border-blue-500/30 transition-colors resize-none mb-4 tracking-wide"
                  />

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`flex items-center justify-between gap-2 rounded-xl px-4 py-3 border transition-all ${q.imageAttached ? 'bg-blue-500/8 border-blue-500/30' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <Image className={`w-4 h-4 flex-shrink-0 ${q.imageAttached ? 'text-blue-400' : 'text-slate-600'}`} />
                        {q.imageAttached ? (
                          <span className="text-[10px] text-blue-300 font-mono truncate">{q.imageName}</span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Image Asset</span>
                        )}
                      </div>
                      {q.imageAttached ? (
                        <button
                          id={`detach-image-${q.id}`}
                          onClick={() => detachImage(q.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-mono cursor-pointer flex-shrink-0 ml-1"
                        >
                          ✕
                        </button>
                      ) : (
                        <button
                          id={`attach-image-${q.id}`}
                          onClick={() => simulateImageAttach(q.id)}
                          className="text-[10px] text-blue-400 hover:text-blue-300 font-mono cursor-pointer flex-shrink-0 ml-1 border border-blue-500/20 rounded px-1.5 py-0.5 uppercase tracking-wider"
                        >
                          Attach
                        </button>
                      )}
                    </div>

                    <div className={`flex items-center justify-between gap-2 rounded-xl px-4 py-3 border transition-all ${q.audioAttached ? 'bg-purple-500/8 border-purple-500/30' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <Mic className={`w-4 h-4 flex-shrink-0 ${q.audioAttached ? 'text-purple-400' : 'text-slate-600'}`} />
                        {q.audioAttached ? (
                          <span className="text-[10px] text-purple-300 font-mono truncate">{q.audioName}</span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Voice Note</span>
                        )}
                      </div>
                      {q.audioAttached ? (
                        <button
                          id={`detach-audio-${q.id}`}
                          onClick={() => detachAudio(q.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-mono cursor-pointer flex-shrink-0 ml-1"
                        >
                          ✕
                        </button>
                      ) : (
                        <button
                          id={`attach-audio-${q.id}`}
                          onClick={() => simulateAudioAttach(q.id)}
                          className="text-[10px] text-purple-400 hover:text-purple-300 font-mono cursor-pointer flex-shrink-0 ml-1 border border-purple-500/20 rounded px-1.5 py-0.5 uppercase tracking-wider"
                        >
                          Record
                        </button>
                      )}
                    </div>
                  </div>

                  {(q.format === 'MCQ Drill' || q.format === 'Assertion & Reason') && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-widest">Answer Options</p>
                      <div className="grid grid-cols-2 gap-3">
                        {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                          const fieldKey = `option${letter}` as keyof QuestionNode;
                          return (
                            <div key={letter} className="flex items-center gap-2">
                              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded bg-black/30 border border-white/10 text-[10px] font-black text-slate-400 font-mono">
                                {letter}
                              </span>
                              <input
                                id={`option-${letter}-${q.id}`}
                                type="text"
                                value={q[fieldKey] as string}
                                onChange={(e) => updateQuestion(q.id, fieldKey, e.target.value)}
                                placeholder={`Option ${letter}`}
                                className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-[11px] text-white font-mono placeholder:text-slate-700 focus:outline-none focus:border-blue-500/30 transition-colors tracking-wide min-w-0"
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider flex-shrink-0">Correct Answer:</span>
                        <div className="relative">
                          <select
                            id={`answer-key-${q.id}`}
                            value={q.answerKey}
                            onChange={(e) => updateQuestion(q.id, 'answerKey', e.target.value as 'A' | 'B' | 'C' | 'D')}
                            className="bg-green-500/10 border border-green-500/30 rounded-lg pl-3 pr-7 py-1.5 text-[11px] font-black text-green-400 font-mono uppercase cursor-pointer appearance-none focus:outline-none focus:border-green-500/50 transition-colors"
                          >
                            <option value="A" className="bg-[#0e1322] text-white">Option A</option>
                            <option value="B" className="bg-[#0e1322] text-white">Option B</option>
                            <option value="C" className="bg-[#0e1322] text-white">Option C</option>
                            <option value="D" className="bg-[#0e1322] text-white">Option D</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-green-500/50 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {q.format === 'Match Matrix' && (
                    <div className="bg-black/20 border border-white/5 rounded-xl px-4 py-3">
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Match Matrix format — pairs defined in question text above.</p>
                    </div>
                  )}

                  {q.format === 'Flashcard' && (
                    <div className="bg-black/20 border border-white/5 rounded-xl px-4 py-3">
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Flashcard mode — front term in question, answer is the back definition.</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <button
              id="save-broadcast-btn"
              onClick={handleSaveAndBroadcast}
              className={`w-full flex items-center justify-center gap-3 border rounded-2xl py-4 px-6 text-white font-black text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer ${savedPulse ? 'bg-green-600 border-green-500/60 shadow-[0_0_30px_rgba(34,197,94,0.35)]' : 'bg-blue-600 hover:bg-blue-500 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_35px_rgba(59,130,246,0.40)]'}`}
            >
              {savedPulse ? (
                <>
                  <CheckSquare className="w-5 h-5" />
                  Quiz Saved & Broadcasting
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save & Broadcast Quiz
                  <Play className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pb-10">
          <div className="w-full bg-[#0e1322]/30 backdrop-blur-md border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="syncRunGradKC" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                  <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.rect x="0" y="0" width="35%" height="1.5" fill="url(#syncRunGradKC)"
                animate={{ x: ['-35%', '135%'] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
              />
              <motion.rect x="0" y="calc(100% - 1.5px)" width="35%" height="1.5" fill="url(#syncRunGradKC)"
                animate={{ x: ['135%', '-35%'] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
              />
              <motion.circle r="3.5" fill="#3b82f6" cy="50%"
                animate={{ cx: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear', delay: 0 }}
                style={{ filter: 'blur(1px)' }}
              />
              <motion.circle r="3" fill="#8b5cf6" cy="50%"
                animate={{ cx: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear', delay: 1.1 }}
                style={{ filter: 'blur(1px)' }}
              />
              <motion.circle r="2.5" fill="#60a5fa" cy="50%"
                animate={{ cx: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'linear', delay: 2.2 }}
                style={{ filter: 'blur(1px)' }}
              />
            </svg>

            <div className="relative z-10 flex items-start gap-3">
              <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold text-slate-500 font-mono tracking-widest uppercase mb-1">
                  360° DATA SYNCHRONIZATION RUNWAY
                </p>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide leading-relaxed">
                  Clicking Save & Broadcast packages the JSON payload and fans out to update:
                </p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row flex-wrap gap-3">
              {SYNC_TARGETS.map((target, idx) => {
                const Icon = target.icon;
                return (
                  <div key={idx} className="flex items-start gap-2.5 bg-slate-950 border border-white/10 px-3 py-2 rounded-xl min-w-[160px]">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: target.color }} />
                    <div>
                      <p className="text-[11px] text-purple-400 font-mono tracking-wide uppercase font-bold">{target.label}</p>
                      <p className="text-[9px] text-slate-600 font-mono uppercase tracking-wide leading-tight mt-0.5">{target.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
