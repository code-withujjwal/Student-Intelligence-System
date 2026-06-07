import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, ChevronRight, ChevronDown, ChevronUp,
  Save, Send, Image, Layers, Settings2, Eye, Copy, GripVertical,
  Clock, Lock, Globe, EyeOff, AlertCircle, CheckCircle2, Database, Sparkles, Brain
} from 'lucide-react';
import { useQuizCreatorStore } from '../store/useQuizCreatorStore';
import type { EngQuestionType, QuizDifficulty, EngSubject, Department } from '../types/projectKarl';
import QuestionPickerModal from '../components/quiz-builder/QuestionPickerModal';
import SmartSelectionModal from '../components/quiz-builder/SmartSelectionModal';
import AiQuizGeneratorModal from '../components/quiz-builder/AiQuizGeneratorModal';

const ENG_SUBJECTS: EngSubject[] = [
  'C Programming', 'Data Structures', 'OOP', 'C++', 'Java', 'Python',
  'DBMS', 'Operating Systems', 'Computer Networks', 'Software Engineering',
  'DAA', 'TOC', 'Compiler Design', 'Web Technology', 'Cloud Computing',
  'AI', 'Machine Learning', 'Cyber Security', 'Computer Architecture',
  'Digital Electronics', 'Discrete Mathematics'
];

const DEPARTMENTS: Department[] = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Electrical', 'Mechanical', 'Civil'
];

const QUESTION_TYPE_LABELS: Record<EngQuestionType, string> = {
  SINGLE_CHOICE: 'Single Choice',
  MULTIPLE_CHOICE: 'Multiple Choice',
  SUBJECTIVE: 'Subjective',
  NUMERICAL: 'Numerical',
  ASSERTION_REASON: 'Assertion & Reason',
  MATCH_FOLLOWING: 'Match the Following',
  TRUE_FALSE: 'True / False',
  FILL_BLANK: 'Fill in the Blank',
  CODE_OUTPUT: 'Code Output',
  CODE_ERROR: 'Code Error Detection',
  CODE_WRITING: 'Code Writing'
};

const STEPS = ['Test Details', 'Sections & Questions', 'Settings', 'Review & Publish'];

export default function QuizCreator() {
  const navigate = useNavigate();
  const store = useQuizCreatorStore();
  const [step, setStep] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const toggleQuestion = (id: string) =>
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));

  const activeSection = store.draft.sections.find(s => s.id === store.activeSectionId)
    ?? store.draft.sections[0];

  const totalQuestions = store.draft.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalMarks = store.draft.sections.reduce(
    (acc, s) => acc + s.questions.reduce((qa, q) => qa + q.marks, 0), 0
  );

  const handlePublish = async () => {
    const ok = await store.publishQuiz();
    if (ok) {
      setPublishSuccess(true);
      setTimeout(() => navigate('/features'), 2200);
    }
  };

  return (
    <div
      className="min-h-screen text-slate-200"
      style={{
        background: '#060912',
        backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        fontFamily: '"Inter", system-ui, sans-serif'
      }}
    >
      <header
        className="sticky top-0 z-40 border-b border-white/5"
        style={{ background: 'rgba(6,9,18,0.85)', backdropFilter: 'blur(14px)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              id="quiz-creator-back"
              onClick={() => navigate('/features')}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-[10px] font-bold text-blue-400 font-mono tracking-widest uppercase">
                QUIZ CREATOR · TEACHER WORKSPACE
              </p>
              <h1 className="text-sm font-black text-white tracking-wide mt-0.5">
                {store.draft.title || 'Untitled Quiz'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {STEPS.map((label, i) => (
              <button
                key={i}
                id={`step-btn-${i}`}
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                  step === i
                    ? 'bg-blue-600 border-blue-500/50 text-white'
                    : i < step
                    ? 'border-green-500/30 bg-green-500/8 text-green-400'
                    : 'border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                {i < step && <CheckCircle2 className="w-3 h-3" />}
                <span>{i + 1}. {label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              id="save-draft-btn"
              onClick={() => store.saveDraft()}
              disabled={store.isSaving}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {store.isSaving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-white">Test Details</h2>
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
                >
                  <Sparkles className="w-4 h-4" /> AI Auto-Generate
                </button>
              </div>
              <div className="flex flex-col gap-5">
                <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Quiz Title *</label>
                    <input
                      id="quiz-title"
                      type="text"
                      value={store.draft.title}
                      onChange={e => store.setField('title', e.target.value)}
                      placeholder="e.g. Data Structures Mid-Term Mock Test"
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
                    <textarea
                      id="quiz-description"
                      value={store.draft.description}
                      onChange={e => store.setField('description', e.target.value)}
                      placeholder="Briefly describe what this quiz covers..."
                      rows={3}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Subject *</label>
                      <select
                        id="quiz-subject"
                        value={store.draft.subject}
                        onChange={e => store.setField('subject', e.target.value as EngSubject)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white cursor-pointer appearance-none focus:outline-none focus:border-blue-500/40 transition-colors"
                      >
                        {ENG_SUBJECTS.map(s => (
                          <option key={s} value={s} className="bg-[#0e1322]">{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Department *</label>
                      <select
                        id="quiz-department"
                        value={store.draft.department}
                        onChange={e => store.setField('department', e.target.value as Department)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white cursor-pointer appearance-none focus:outline-none focus:border-blue-500/40 transition-colors"
                      >
                        {DEPARTMENTS.map(d => (
                          <option key={d} value={d} className="bg-[#0e1322]">{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Semester</label>
                      <select
                        id="quiz-semester"
                        value={store.draft.semester}
                        onChange={e => store.setField('semester', Number(e.target.value))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white cursor-pointer appearance-none focus:outline-none focus:border-blue-500/40 transition-colors"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                          <option key={sem} value={sem} className="bg-[#0e1322]">Semester {sem}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Difficulty</label>
                      <div className="flex gap-2">
                        {(['EASY', 'MEDIUM', 'HARD'] as QuizDifficulty[]).map(d => (
                          <button
                            key={d}
                            id={`difficulty-${d.toLowerCase()}`}
                            onClick={() => store.setField('difficulty', d)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                              store.draft.difficulty === d
                                ? d === 'EASY' ? 'bg-green-500/15 border-green-500/40 text-green-400'
                                : d === 'MEDIUM' ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                                : 'bg-red-500/15 border-red-500/40 text-red-400'
                                : 'border-white/5 text-slate-600 hover:border-white/10'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    id="step0-next"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Next: Add Questions <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-3 flex flex-col gap-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Sections</h3>
                  <button
                    id="add-section-btn"
                    onClick={store.addSection}
                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </button>
                </div>

                {store.draft.sections.map((section, idx) => (
                  <div
                    key={section.id}
                    onClick={() => store.setActiveSectionId(section.id)}
                    className={`relative rounded-xl p-4 cursor-pointer border transition-all ${
                      store.activeSectionId === section.id
                        ? 'border-blue-500/50 bg-[#0e1322]/80 shadow-[0_0_12px_rgba(59,130,246,0.12)]'
                        : 'border-white/5 bg-[#0e1322]/20 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical className="w-3.5 h-3.5 text-slate-600" />
                      <input
                        type="text"
                        value={section.title}
                        onChange={e => store.updateSectionTitle(section.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 bg-transparent text-xs font-bold text-white focus:outline-none min-w-0"
                        placeholder={`Section ${String.fromCharCode(65 + idx)}`}
                      />
                      {store.draft.sections.length > 1 && (
                        <button
                          onClick={e => { e.stopPropagation(); store.removeSection(section.id); }}
                          className="text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono ml-5">
                      {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}

                <div className="mt-4 bg-[#0e1322]/30 border border-white/5 rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2">Quiz Summary</p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Total Questions</span>
                      <span className="text-white font-bold font-mono">{totalQuestions}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Total Marks</span>
                      <span className="text-white font-bold font-mono">{totalMarks}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Sections</span>
                      <span className="text-white font-bold font-mono">{store.draft.sections.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-9 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white">
                    {activeSection?.title || 'Questions'}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      id="smart-pick-btn"
                      onClick={() => activeSection && store.openSmartPicker()}
                      className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" /> Smart Pick
                    </button>
                    <button
                      id="ai-generate-btn"
                      onClick={() => setIsAiModalOpen(true)}
                      className="flex items-center gap-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-400 hover:text-amber-300 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Brain className="w-4 h-4" /> Generate AI Quiz ✨
                    </button>
                    <button
                      id="browse-repo-btn"
                      onClick={() => activeSection && store.openPicker()}
                      className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-xl px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Database className="w-4 h-4" /> Browse Bank
                    </button>
                  </div>
                </div>

                {activeSection?.questions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="bg-[#0e1322]/40 border border-white/5 rounded-2xl overflow-hidden"
                  >
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer select-none hover:bg-white/[0.02] transition-all"
                      onClick={() => toggleQuestion(q.id)}
                    >
                      <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-[11px] font-black text-blue-400 font-mono">
                        {qIdx + 1}
                      </div>
                      <p className="flex-1 text-sm text-white truncate font-medium">
                        {q.text || `Question ${qIdx + 1} — click to expand`}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono border border-white/5 px-2 py-0.5 rounded">
                          {QUESTION_TYPE_LABELS[q.type]}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{q.marks}m</span>
                        <button
                          onClick={e => { e.stopPropagation(); store.duplicateQuestion(activeSection.id, q.id); }}
                          className="text-slate-600 hover:text-slate-300 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); store.removeQuestion(activeSection.id, q.id); }}
                          className="text-slate-600 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        {expandedQuestions[q.id] ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </div>

                    {expandedQuestions[q.id] && (
                      <div className="p-4 border-t border-white/5 bg-black/20">
                        <div className="grid grid-cols-2 gap-4 max-w-sm mt-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Marks Overrides</label>
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              value={q.marks}
                              onChange={e => store.updateQuestion(activeSection.id, q.id, { marks: Number(e.target.value) })}
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/30 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Neg. Marks</label>
                            <input
                              type="number"
                              min={0}
                              step={0.25}
                              value={q.negativeMarks}
                              onChange={e => store.updateQuestion(activeSection.id, q.id, { negativeMarks: Number(e.target.value) })}
                              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/30 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {(!activeSection || activeSection.questions.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl">
                    <Layers className="w-8 h-8 text-slate-600 mb-3" />
                    <p className="text-sm font-bold text-slate-500">No questions yet</p>
                    <p className="text-xs text-slate-600 mt-1">Click "Browse Bank" or "Smart Pick" to pull validated questions from the central repository.</p>
                  </div>
                )}

                <div className="flex justify-between mt-2">
                  <button onClick={() => setStep(0)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold cursor-pointer transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    id="step1-next"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Next: Settings <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-lg font-black text-white mb-6">Quiz Settings</h2>
              <div className="flex flex-col gap-5">
                <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-sm font-bold text-white">Countdown Timer</p>
                        <p className="text-[11px] text-slate-500">{store.draft.settings.durationMinutes} minutes</p>
                      </div>
                    </div>
                    <input
                      id="duration-slider"
                      type="range"
                      min={0}
                      max={240}
                      step={5}
                      value={store.draft.settings.durationMinutes}
                      onChange={e => store.setSettings({ durationMinutes: Number(e.target.value) })}
                      className="w-40 cursor-pointer"
                      style={{
                        accentColor: '#3b82f6'
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Start Date</label>
                      <input
                        id="start-date"
                        type="datetime-local"
                        value={store.draft.settings.startDate ?? ''}
                        onChange={e => store.setSettings({ startDate: e.target.value || null })}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">End Date</label>
                      <input
                        id="end-date"
                        type="datetime-local"
                        value={store.draft.settings.endDate ?? ''}
                        onChange={e => store.setSettings({ endDate: e.target.value || null })}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Visibility</label>
                    <div className="flex flex-col gap-2">
                      {[
                        { val: 'PUBLIC', icon: Globe, label: 'Public', sub: 'All students can see and attempt this quiz', color: 'green' },
                        { val: 'PRIVATE', icon: EyeOff, label: 'Private Draft', sub: 'Only you can see this quiz', color: 'slate' },
                        { val: 'PROTECTED', icon: Lock, label: 'Password Protected', sub: 'Students need a passcode to access', color: 'amber' }
                      ].map(({ val, icon: Icon, label, sub, color }) => (
                        <button
                          key={val}
                          id={`vis-${val.toLowerCase()}`}
                          onClick={() => store.setSettings({ visibility: val as 'PUBLIC' | 'PRIVATE' | 'PROTECTED' })}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-all ${
                            store.draft.settings.visibility === val
                              ? color === 'green' ? 'border-green-500/40 bg-green-500/8'
                              : color === 'amber' ? 'border-amber-500/40 bg-amber-500/8'
                              : 'border-slate-500/40 bg-slate-500/8'
                              : 'border-white/5 hover:border-white/10'
                          }`}
                        >
                          <Icon className={`w-4 h-4 flex-shrink-0 ${store.draft.settings.visibility === val ? color === 'green' ? 'text-green-400' : color === 'amber' ? 'text-amber-400' : 'text-slate-400' : 'text-slate-600'}`} />
                          <div>
                            <p className="text-xs font-bold text-white">{label}</p>
                            <p className="text-[10px] text-slate-500">{sub}</p>
                          </div>
                          {store.draft.settings.visibility === val && (
                            <CheckCircle2 className={`w-4 h-4 ml-auto ${color === 'green' ? 'text-green-400' : color === 'amber' ? 'text-amber-400' : 'text-slate-400'}`} />
                          )}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {store.draft.settings.visibility === 'PROTECTED' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <input
                            id="quiz-password"
                            type="text"
                            value={store.draft.settings.password ?? ''}
                            onChange={e => store.setSettings({ password: e.target.value })}
                            placeholder="e.g. LNCT-DSA-2026"
                            className="w-full bg-amber-500/5 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-300 placeholder:text-amber-900/60 focus:outline-none focus:border-amber-500/50 transition-colors font-mono uppercase tracking-widest"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Max Attempts</label>
                      <input
                        id="max-attempts"
                        type="number"
                        min={1}
                        max={10}
                        value={store.draft.settings.maxAttempts}
                        onChange={e => store.setSettings({ maxAttempts: Number(e.target.value) })}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      { key: 'shuffleQuestions' as const, label: 'Shuffle Question Order', sub: 'Each student sees questions in a random order' },
                      { key: 'shuffleOptions' as const, label: 'Shuffle Answer Options', sub: 'Option order is randomized per question' },
                      { key: 'showResultImmediately' as const, label: 'Show Results Immediately', sub: 'Students see their score right after submitting' }
                    ].map(({ key, label, sub }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between bg-black/20 border border-white/5 rounded-xl px-4 py-3 cursor-pointer"
                        onClick={() => store.setSettings({ [key]: !store.draft.settings[key] })}
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{label}</p>
                          <p className="text-[10px] text-slate-500">{sub}</p>
                        </div>
                        <div className={`relative w-11 h-6 rounded-full border cursor-pointer transition-all ${store.draft.settings[key] ? 'bg-blue-500 border-blue-400/40' : 'bg-slate-800 border-white/10'}`}>
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${store.draft.settings[key] ? 'left-5' : 'left-0.5'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold cursor-pointer transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    id="step2-next"
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Next: Review <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-lg font-black text-white mb-6">Review & Publish</h2>

              {publishSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-400">Quiz Published Successfully!</p>
                    <p className="text-xs text-slate-400 mt-0.5">Students can now see and attempt this quiz. Redirecting...</p>
                  </div>
                </motion.div>
              )}

              <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 mb-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Title', value: store.draft.title || 'Not set' },
                    { label: 'Subject', value: store.draft.subject },
                    { label: 'Department', value: store.draft.department },
                    { label: 'Semester', value: `Semester ${store.draft.semester}` },
                    { label: 'Difficulty', value: store.draft.difficulty },
                    { label: 'Total Questions', value: String(totalQuestions) },
                    { label: 'Total Marks', value: String(totalMarks) },
                    { label: 'Duration', value: store.draft.settings.durationMinutes ? `${store.draft.settings.durationMinutes} minutes` : 'Untimed' },
                    { label: 'Visibility', value: store.draft.settings.visibility },
                    { label: 'Max Attempts', value: String(store.draft.settings.maxAttempts) }
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-black/20 border border-white/5 rounded-xl px-4 py-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                      <p className="text-sm font-bold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                {!store.draft.title && (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-amber-300">Quiz title is required before publishing. Go back to Step 1 to add it.</p>
                  </div>
                )}

                {totalQuestions === 0 && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-300">You need at least one question before publishing.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold cursor-pointer transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex gap-3">
                  <button
                    id="save-draft-final"
                    onClick={() => store.saveDraft()}
                    disabled={store.isSaving}
                    className="flex items-center gap-2 border border-white/10 px-5 py-3 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:border-white/20 uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </button>
                  <button
                    id="publish-btn"
                    onClick={handlePublish}
                    disabled={!store.draft.title || totalQuestions === 0 || store.isPublishing}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed px-6 py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:shadow-[0_0_30px_rgba(34,197,94,0.35)]"
                  >
                    <Send className="w-4 h-4" />
                    {store.isPublishing ? 'Publishing...' : 'Publish Quiz'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {store.isPickerOpen && <QuestionPickerModal />}
      {store.isSmartPickerOpen && <SmartSelectionModal />}
      {isAiModalOpen && <AiQuizGeneratorModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />}
    </div>
  );
}
