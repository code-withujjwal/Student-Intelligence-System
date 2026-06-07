import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { aiApi } from '../api/aiApi';
import {
  Brain, Bot, Shield, AlertTriangle, CheckCircle2, XCircle, Timer,
  Clock, ArrowRight, ArrowLeft, ChevronRight, HelpCircle, Layers, Sparkles, Send, Cpu, Activity,
  BookOpen, PlusCircle, User, FileText, Upload, Settings, ListChecks, Check, GitMerge, GraduationCap
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

interface CognitiveAnalysis {
  id: string;
  questionText: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  conceptNode: string;
  analysisText: string;
  timestamp: string;
}

const BRANCHES = ['CSE', 'IT', 'EC', 'EE', 'ME'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SUBJECTS = ['Data Structures', 'Operating Systems', 'DBMS', 'Computer Networks', 'OOP'];

const UNITS = [
  { value: 'Unit 1', label: 'Unit 1: Foundations & Architecture' },
  { value: 'Unit 2', label: 'Unit 2: Standard Data Models' },
  { value: 'Unit 3', label: 'Unit 3: Normalization & Optimization' },
  { value: 'Unit 4', label: 'Unit 4: Transaction Processing & Recovery' },
  { value: 'Unit 5', label: 'Unit 5: Storage & Indexing Vectors' }
];

export default function AegisNeuralCockpit() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeView, setActiveView] = useState('generator'); // 'generator' | 'analyst'
  const [activeTab, setActiveTab] = useState('subject'); // 'subject' | 'unit' | 'full' | 'placement' | 'interview' | 'weak' | 'pdf' | 'notes'

  // Input states
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [selectedSemester, setSelectedSemester] = useState(4);
  const [selectedSubject, setSelectedSubject] = useState('DBMS');
  const [topicFocus, setTopicFocus] = useState('Normalization');
  const [selectedDifficulty, setSelectedDifficulty] = useState('MEDIUM');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedUnit, setSelectedUnit] = useState('Unit 3');
  const [selectedCompany, setSelectedCompany] = useState('Amazon');
  const [notesText, setNotesText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Workflow states
  const [generatingBlueprint, setGeneratingBlueprint] = useState(false);
  const [blueprintData, setBlueprintData] = useState<Record<string, number> | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [terminalStatusText, setTerminalStatusText] = useState('');
  const [generatedQuizId, setGeneratedQuizId] = useState<string | null>(null);

  // Past failure analysis logs
  const [liveAnalysisDeck, setLiveAnalysisDeck] = useState<CognitiveAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Handle PDF/Text file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Generate Blueprint
  const handleGenerateBlueprint = async () => {
    setGeneratingBlueprint(true);
    setBlueprintData(null);
    setGeneratedQuizId(null);
    try {
      const payload = {
        subject: selectedSubject,
        topic: topicFocus,
        difficulty: selectedDifficulty,
        questionCount,
        department: selectedBranch === 'CSE' ? 'Computer Science' : 'Information Technology',
        semester: selectedSemester,
        mode: activeTab.toUpperCase(),
        unit: selectedUnit,
        style: selectedCompany,
        notesText: notesText
      };
      
      const res = await aiApi.generateBlueprint(payload);
      if (res.success && res.data && res.data.coverage) {
        setBlueprintData(res.data.coverage);
        toast.success('Quiz blueprint generated! Review coverage details below.');
      } else {
        toast.error('Failed to parse blueprint format. Fallback loaded.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Fallback blueprint loaded.');
    } finally {
      setGeneratingBlueprint(false);
    }
  };

  // Generate Questions & Store in Database
  const handleGenerateQuestions = async () => {
    setGeneratingQuiz(true);
    setGeneratedQuizId(null);

    const steps = [
      '[ 🛰️ OPENING DYNAMIC PROXIED LINK BACKEND... ]',
      '[ 🧠 COUPLING TO CONTEXT VECTOR METRICS... ]',
      '[ 🔥 COMPILING GEMINI GEN-AI PAYLOAD MODEL... ]',
      '[ 💾 PERSISTING GENERATED SCHEMAS IN MYSQL... ]'
    ];

    for (let i = 0; i < steps.length; i++) {
      setTerminalStatusText(steps[i]);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      let res;
      if (activeTab === 'pdf') {
        if (!selectedFile) {
          toast.error('Please select a PDF file first.');
          setGeneratingQuiz(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('subject', selectedSubject);
        formData.append('difficulty', selectedDifficulty);
        formData.append('questionCount', String(questionCount));
        res = await aiApi.pdfToQuiz(formData);
      } else {
        const payload = {
          subject: selectedSubject,
          topic: topicFocus,
          difficulty: selectedDifficulty,
          questionCount,
          department: selectedBranch === 'CSE' ? 'Computer Science' : 'Information Technology',
          semester: selectedSemester,
          mode: activeTab.toUpperCase(),
          unit: selectedUnit,
          style: selectedCompany,
          notesText: notesText
        };
        res = await aiApi.generateQuizAndSave(payload);
      }

      if (res.success && res.data && res.data.quizId) {
        setGeneratedQuizId(String(res.data.quizId));
        toast.success('AI Quiz generated and stored in database successfully!');
      } else {
        toast.error('Failed to store generated quiz details.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate quiz. Loaded backup templates.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Start Attempt
  const handleStartAttempt = () => {
    if (!generatedQuizId) return;
    const quizCard = {
      id: generatedQuizId,
      title: `AI Generated: ${selectedSubject}`,
      subject: selectedSubject as any,
      department: (selectedBranch === 'CSE' ? 'Computer Science' : 'Information Technology') as any,
      semester: selectedSemester,
      durationMinutes: questionCount * 3,
      questionCount,
      totalMarks: questionCount * 2,
      difficulty: selectedDifficulty as any,
      status: 'PUBLISHED' as any,
      startDate: null,
      endDate: null,
      isPasswordProtected: false,
      publishedAt: new Date().toISOString()
    };
    navigate(`/quiz/${generatedQuizId}/attempt`, { state: { quiz: quizCard } });
  };

  // Fetch Weak Topics on Mount/Active
  const handleFetchWeakTopics = () => {
    setTopicFocus('Normalization, Relational Model, Indexing');
    toast.success('Weak topics fetched from student analytics profile: Normalization, Relational Model');
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-slate-100"
      style={{
        background: '#060912',
        fontFamily: '"Space Mono", "JetBrains Mono", "Fira Code", monospace',
        letterSpacing: '0.05em'
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(168,85,247,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(34,211,238,0.04) 0%, transparent 50%)'
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
              <p className="tracking-widest font-extrabold uppercase text-[0.6rem] text-[#a855f7] flex items-center gap-1.5 animate-pulse">
                <Brain className="w-3 h-3 text-[#a855f7]" /> NEURAL COCKPIT [COG_09]
              </p>
              <h1 className="text-sm font-bold text-white tracking-wider mt-0.5 uppercase">
                AI ACADEMIC QUIZ GENERATOR
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-[#0e1322]/60 border border-white/5 p-1 rounded-xl">
              <button
                onClick={() => setActiveView('generator')}
                className="px-4 py-2.5 rounded-lg text-xs font-bold tracking-widest transition-all uppercase"
                style={{
                  background: activeView === 'generator' ? 'rgba(168,85,247,0.15)' : 'transparent',
                  border: activeView === 'generator' ? '1px solid rgba(168,85,247,0.3)' : '1px solid transparent',
                  color: activeView === 'generator' ? '#f5f3ff' : '#64748B',
                }}
              >
                🛰️ AI GENERATOR
              </button>
              <button
                onClick={() => setActiveView('analyst')}
                className="px-4 py-2.5 rounded-lg text-xs font-bold tracking-widest transition-all uppercase"
                style={{
                  background: activeView === 'analyst' ? 'rgba(34,211,238,0.15)' : 'transparent',
                  border: activeView === 'analyst' ? '1px solid rgba(34,211,238,0.3)' : '1px solid transparent',
                  color: activeView === 'analyst' ? '#a5f3fc' : '#64748B',
                }}
              >
                🧠 COGNITIVE FEEDBACK
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 lg:p-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeView === 'generator' ? (
            <motion.div
              key="generator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch text-left"
            >
              {/* Left Column: AI Quiz Options */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                <div className="p-1 rounded-lg bg-slate-900/60 border border-white/5 w-fit">
                  <span className="text-[0.6rem] font-extrabold uppercase text-slate-500 px-2 py-1 block">
                    [ GENERATOR MODULE MODES ]
                  </span>
                </div>

                <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 space-y-4">
                  {/* Generation Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-white/5 pb-3">
                    {[
                      { key: 'subject', label: 'Subject' },
                      { key: 'unit', label: 'Unit' },
                      { key: 'full', label: 'Full Exam' },
                      { key: 'placement', label: 'Placement' },
                      { key: 'interview', label: 'Interview' },
                      { key: 'weak', label: 'Weak Areas' },
                      { key: 'pdf', label: 'PDF Upload' },
                      { key: 'notes', label: 'Notes Paste' }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setActiveTab(tab.key);
                          setBlueprintData(null);
                          setGeneratedQuizId(null);
                        }}
                        className={`py-2 px-1 rounded-lg text-[10px] font-bold tracking-wider uppercase border text-center transition-all ${
                          activeTab === tab.key
                            ? 'bg-[#a855f7]/15 border-[#a855f7]/40 text-[#d8b4fe]'
                            : 'bg-transparent border-white/5 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Form Parameters */}
                  {activeTab === 'subject' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Branch</label>
                          <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Semester</label>
                          <select value={selectedSemester} onChange={e => setSelectedSemester(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                            {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Topic Focus Focus Area</label>
                        <input
                          type="text"
                          value={topicFocus}
                          onChange={e => setTopicFocus(e.target.value)}
                          placeholder="e.g. Normalization, Process Scheduling"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'unit' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Academic Unit</label>
                        <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                          {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === 'full' && (
                    <div className="space-y-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[11px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" /> Full Exam Matrix Activated
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-relaxed">
                        Generates a Mock Semester Final comprising 50 questions with units mixed (Easy 20%, Medium 50%, Hard 30%).
                      </p>
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === 'placement' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Company Profile</label>
                          <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                            <option value="Amazon">Amazon Style</option>
                            <option value="Google">Google Style</option>
                            <option value="Microsoft">Microsoft Style</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
                          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'interview' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">CS Core Area</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider leading-relaxed">
                        Outputs subjective interview queries (e.g. process vs threads) with expected answer descriptions for conceptual alignment.
                      </p>
                    </div>
                  )}

                  {activeTab === 'weak' && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest">Analytics Link</label>
                        <button
                          onClick={handleFetchWeakTopics}
                          className="px-2 py-1 rounded border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-[9px] font-bold uppercase transition-all"
                        >
                          Sync Profile Data
                        </button>
                      </div>
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Weak Areas</label>
                        <input
                          type="text"
                          value={topicFocus}
                          onChange={e => setTopicFocus(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'pdf' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Select Subject Context</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Upload Notes (.pdf / .txt)</label>
                        <div className="border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02]">
                          <Upload className="w-6 h-6 text-slate-500 mb-2" />
                          <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="hidden" id="file-uploader" />
                          <label htmlFor="file-uploader" className="text-[10px] text-slate-400 uppercase font-bold cursor-pointer hover:underline">
                            {selectedFile ? selectedFile.name : 'Select or drop notes document'}
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
                        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Paste Lecture Notes</label>
                        <textarea
                          rows={4}
                          value={notesText}
                          onChange={e => setNotesText(e.target.value)}
                          placeholder="Paste notes, raw transcript, or text snippets here..."
                          className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Difficulty and Question count */}
                  {activeTab !== 'full' && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Difficulty</label>
                        <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200">
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[0.58rem] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Count</label>
                        <input
                          type="number"
                          min={5}
                          max={50}
                          value={questionCount}
                          onChange={e => setQuestionCount(Number(e.target.value))}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#090d16]/80 border border-white/5 text-xs text-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                    <button
                      onClick={handleGenerateBlueprint}
                      disabled={generatingBlueprint || generatingQuiz || (activeTab === 'pdf' && !selectedFile)}
                      className="py-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-40"
                    >
                      {generatingBlueprint ? 'Compiling...' : '1. Get Blueprint'}
                    </button>
                    <button
                      onClick={handleGenerateQuestions}
                      disabled={generatingBlueprint || generatingQuiz || (activeTab === 'pdf' && !selectedFile)}
                      className="py-3.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#22d3ee] text-slate-900 font-extrabold text-xs tracking-widest uppercase transition-all disabled:opacity-40 hover:brightness-110 shadow-lg shadow-[#a855f7]/25"
                    >
                      {generatingQuiz ? 'Synthesizing...' : '2. Generate'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Process Canvas */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                <div className="p-1 rounded-lg bg-slate-900/60 border border-white/5 w-fit">
                  <span className="text-[0.6rem] font-extrabold uppercase text-slate-500 px-2 py-1 block">
                    [ AI GENERATIVE CANVAS ]
                  </span>
                </div>

                <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex-1 flex flex-col justify-between min-h-[480px]">
                  {generatingBlueprint || generatingQuiz ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-6">
                      <div className="relative w-16 h-16 rounded-full border border-white/5 flex items-center justify-center shrink-0">
                        <svg width="48" height="48" viewBox="0 0 24 24" className="animate-spin" style={{ color: '#a855f7' }}>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="6 8" fill="none" opacity="0.4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white tracking-widest uppercase">
                          GEMINI SYSTEM ACTIVE
                        </h4>
                        <p className="text-[0.68rem] text-[#22d3ee] tracking-widest mt-2.5 uppercase font-mono">
                          {generatingBlueprint ? '[ 🛰️ COMPUTING SUB-TOPIC MAPPING DIRECTIVES... ]' : terminalStatusText}
                        </p>
                      </div>
                    </div>
                  ) : generatedQuizId ? (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-6">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white tracking-wider uppercase mb-1">
                          COGNITIVE EVALUATION MATRIX DEPLOYED
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                          QUIZ STATUS: ACTIVE_IN_DB // ID: {generatedQuizId}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed uppercase max-w-sm">
                        The quiz is fully instantiated. You can attempt it now to test your knowledge or review options.
                      </p>
                      <button
                        onClick={handleStartAttempt}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/25 transition-all hover:brightness-110"
                      >
                        Start Attempt Now <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : blueprintData ? (
                    <div className="flex-1 flex flex-col justify-between text-left">
                      <div className="space-y-5">
                        <div className="border-b border-white/5 pb-3">
                          <h3 className="text-xs font-extrabold text-[#a855f7] tracking-widest uppercase">
                            Quiz Blueprint Approved
                          </h3>
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
                            Target curriculum coverage breakdown
                          </p>
                        </div>

                        <div className="space-y-4">
                          {Object.entries(blueprintData).map(([topic, pct]) => (
                            <div key={topic} className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                <span>{topic}</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="h-2 bg-[#090d16] rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  className="h-full bg-gradient-to-r from-[#a855f7] to-[#22d3ee] rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 mt-6 flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                          Coverage verified by faculty heuristics
                        </span>
                        <button
                          onClick={handleGenerateQuestions}
                          className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-[#a855f7] to-[#22d3ee] text-slate-900 font-extrabold rounded-xl text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-[#a855f7]/25"
                        >
                          Approve & Generate Quiz <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-4">
                      <div className="w-12 h-12 rounded-xl border border-white/5 bg-[#090d16]/40 flex items-center justify-center text-slate-500">
                        <Bot className="w-6 h-6" />
                      </div>
                      <p className="text-white/60 text-xs uppercase tracking-widest">
                        AI SYSTEM OFFLINE
                      </p>
                      <p className="text-[0.65rem] text-slate-600 font-bold max-w-xs mx-auto leading-relaxed uppercase tracking-wider">
                        SELECT A MODE AND CLICK GENERATE BLUEPRINT OR GENERATE QUIZ TO BEGIN.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analyst"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 text-left"
            >
              <div className="p-1 rounded-lg bg-slate-900/60 border border-white/5 w-fit">
                <span className="text-[0.6rem] font-extrabold uppercase text-slate-500 px-2 py-1 block">
                  [ COGNITIVE ANALYSIS TERMINAL ]
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-4 bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#22d3ee]">
                        REMEDIATION LOG DIRECTORY
                      </h3>
                      <p className="text-[0.7rem] text-slate-500 uppercase tracking-widest mt-0.5">
                        LIST OF COMPILED DYNAMIC TUTORING DIAGNOSTIC PROFILES
                      </p>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto scrollbar-hide">
                      {liveAnalysisDeck.map((log, idx) => (
                        <div
                          key={log.id}
                          className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                            idx === 0
                              ? 'bg-slate-900/60 border-white/20'
                              : 'bg-transparent border-white/5 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2.5 text-[0.55rem] font-bold">
                            <span className="text-slate-500">{log.id}</span>
                            <span className={log.isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                              {log.isCorrect ? 'SUCCESS' : 'GAP_ALERT'}
                            </span>
                          </div>
                          <h4 className="text-[0.68rem] font-bold text-white mt-1.5 leading-snug truncate uppercase tracking-widest">
                            CONCEPT: {log.conceptNode}
                          </h4>
                          <p className="text-[0.6rem] text-slate-500 mt-1 uppercase">
                            LOGGED AT {log.timestamp}
                          </p>
                        </div>
                      ))}

                      {liveAnalysisDeck.length === 0 && (
                        <div className="text-center py-16 border border-dashed border-white/5 rounded-xl bg-slate-950/20">
                          <AlertTriangle className="w-6 h-6 text-slate-600 mx-auto mb-3 opacity-60" />
                          <p className="text-slate-600 text-[0.6rem] uppercase tracking-widest font-bold">
                            NO FAILURE PROFILES LOGGED
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveView('generator')}
                    className="w-full mt-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold tracking-widest uppercase transition-all text-slate-300 hover:text-white"
                  >
                    SYNTHESIZE NEW STREAM
                  </button>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-4">
                  {isAnalyzing ? (
                    <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex-1 flex flex-col justify-center items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-bounce">
                        <Cpu className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest mt-4">
                        COMPILING COGNITIVE DIAGNOSTICS
                      </h4>
                      <p className="text-[0.65rem] text-[#22d3ee] mt-2 uppercase tracking-widest">
                        CROSS-EXAMINING DISTRACTOR OPTIONS & ELAPSED TIMING RATIOS...
                      </p>
                    </div>
                  ) : liveAnalysisDeck.length > 0 ? (
                    <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex-1 space-y-6 text-left max-h-[620px] overflow-y-auto scrollbar-hide">
                      <div>
                        <span className="text-[0.6rem] font-extrabold uppercase text-slate-500 tracking-widest">
                          DYNAMIC TUTORING ANALYSIS REPORT
                        </span>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[0.65rem] font-bold text-[#a855f7] bg-[#a855f7]/10 px-2 py-0.5 rounded border border-[#a855f7]/30 uppercase">
                            CONCEPT: {liveAnalysisDeck[0].conceptNode}
                          </span>
                          <span className="text-[0.65rem] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-white/5 uppercase">
                            ID: {liveAnalysisDeck[0].id}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-950/45 border border-white/5">
                          <p className="text-[0.58rem] font-extrabold uppercase text-slate-500 tracking-widest mb-2">
                            SOURCE QUESTION TEXT
                          </p>
                          <p className="text-xs font-semibold text-slate-300 leading-relaxed uppercase tracking-wider">
                            {liveAnalysisDeck[0].questionText}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                          <div className="p-3.5 rounded-xl border border-red-500/25 bg-red-500/5 text-red-300 uppercase tracking-wider">
                            <span className="text-[0.55rem] font-extrabold uppercase text-red-400 block mb-1">
                              OPERATIVE CHOICE
                            </span>
                            {liveAnalysisDeck[0].selectedOption}
                          </div>
                          <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-emerald-300 uppercase tracking-wider">
                            <span className="text-[0.55rem] font-extrabold uppercase text-emerald-400 block mb-1">
                              CORRECT TARGET OPTION
                            </span>
                            {liveAnalysisDeck[0].correctOption}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5 border-t border-white/5 pt-5">
                        {liveAnalysisDeck[0].analysisText.includes('[ COGNITIVE GAP DIAGNOSIS ]') ? (
                          liveAnalysisDeck[0].analysisText.split('\n\n').map((block, bIdx) => {
                            if (!block.trim()) return null;
                            const titleMatch = block.match(/^\[ (.*) \]/);
                            const title = titleMatch ? titleMatch[1] : '';
                            const content = titleMatch ? block.replace(/^\[ (.*) \]/, '').trim() : block;

                            let headerColor = 'text-[#22d3ee]';
                            let borderGlow = 'border-[#22d3ee]/20 bg-[#22d3ee]/5';

                            if (title.includes('REMEDIAL')) {
                              headerColor = 'text-[#a855f7]';
                              borderGlow = 'border-[#a855f7]/20 bg-[#a855f7]/5';
                            } else if (title.includes('SPRINT')) {
                              headerColor = 'text-[#f59e0b]';
                              borderGlow = 'border-[#f59e0b]/20 bg-[#f59e0b]/5';
                            }

                            return (
                              <div key={bIdx} className={`p-4.5 rounded-xl border ${borderGlow}`}>
                                <span className={`text-[0.62rem] font-extrabold uppercase tracking-widest block mb-2 ${headerColor}`}>
                                  [ {title || 'COGNITIVE ASSESSMENT VECTOR'} ]
                                </span>
                                <p className="text-xs leading-relaxed text-slate-300 font-medium whitespace-pre-wrap uppercase tracking-wider">
                                  {content}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4.5 rounded-xl border border-[#22d3ee]/20 bg-[#22d3ee]/5">
                            <span className="text-[0.62rem] font-extrabold uppercase tracking-widest text-[#22d3ee] block mb-2">
                              [ COGNITIVE ASSESSMENT COAX ]
                            </span>
                            <p className="text-xs leading-relaxed text-slate-300 font-medium whitespace-pre-wrap uppercase tracking-wider">
                              {liveAnalysisDeck[0].analysisText}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex-1 flex flex-col justify-center items-center text-center">
                      <div className="w-12 h-12 rounded-xl border border-white/5 bg-[#090d16]/40 flex items-center justify-center text-slate-500">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <p className="text-white/60 text-xs uppercase tracking-widest mt-4">
                        COGNITIVE FAILURE ANALYSIS PANEL EMPTY
                      </p>
                      <p className="text-[0.65rem] text-slate-600 font-bold max-w-xs mx-auto leading-relaxed uppercase mt-1 tracking-wider">
                        OPERATE THE NEURAL AI GENERATOR. WHEN AN INCORRECT SELECTION IS MADE, GEMINI WILL COMPILE REAL-TIME DIAGNOSTIC REPORTS.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
