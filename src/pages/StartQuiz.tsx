import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Filter, Clock, BookOpen, Users, Lock,
  Calendar, ChevronRight, Zap, AlertCircle, Play
} from 'lucide-react';
import { useFeaturesStore } from '../store/useFeaturesStore';
import { useAuth } from '../contexts/AuthContext';
import type { QuizCard, EngSubject, Department, QuizStatus } from '../types/projectKarl';

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

const MOCK_QUIZZES: QuizCard[] = [
  {
    id: 'q1',
    title: 'Data Structures Mid-Term Mock',
    subject: 'Data Structures',
    department: 'Computer Science',
    semester: 3,
    durationMinutes: 90,
    questionCount: 30,
    totalMarks: 60,
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    startDate: null,
    endDate: null,
    isPasswordProtected: false,
    publishedAt: new Date().toISOString()
  },
  {
    id: 'q2',
    title: 'DBMS Comprehensive Practice Set',
    subject: 'DBMS',
    department: 'Computer Science',
    semester: 4,
    durationMinutes: 120,
    questionCount: 50,
    totalMarks: 100,
    difficulty: 'HARD',
    status: 'PUBLISHED',
    startDate: null,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    isPasswordProtected: true,
    publishedAt: new Date().toISOString()
  },
  {
    id: 'q3',
    title: 'OS Concepts — Quick Drill',
    subject: 'Operating Systems',
    department: 'Computer Science',
    semester: 5,
    durationMinutes: 30,
    questionCount: 15,
    totalMarks: 15,
    difficulty: 'EASY',
    status: 'PUBLISHED',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: null,
    isPasswordProtected: false,
    publishedAt: new Date().toISOString()
  }
];

const getQuizBadgeStatus = (quiz: QuizCard): 'LIVE' | 'UPCOMING' | 'EXPIRED' => {
  const now = Date.now();
  if (quiz.endDate && new Date(quiz.endDate).getTime() < now) return 'EXPIRED';
  if (quiz.startDate && new Date(quiz.startDate).getTime() > now) return 'UPCOMING';
  return 'LIVE';
};

const DIFF_COLORS: Record<string, string> = {
  EASY: 'text-green-400 border-green-500/20 bg-green-500/8',
  MEDIUM: 'text-amber-400 border-amber-500/20 bg-amber-500/8',
  HARD: 'text-red-400 border-red-500/20 bg-red-500/8'
};

const STATUS_CONFIG = {
  LIVE: { label: 'Live', color: 'text-green-400 border-green-500/30 bg-green-500/8', dot: 'bg-green-400 shadow-[0_0_6px_#4ade80]' },
  UPCOMING: { label: 'Upcoming', color: 'text-blue-400 border-blue-500/30 bg-blue-500/8', dot: 'bg-blue-400' },
  EXPIRED: { label: 'Expired', color: 'text-slate-500 border-slate-500/20 bg-slate-500/5', dot: 'bg-slate-500' }
};

export default function StartQuiz() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useFeaturesStore();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<EngSubject | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState<Department | ''>('');
  const [semesterFilter, setSemesterFilter] = useState<number | 0>(0);
  const [passwordModal, setPasswordModal] = useState<QuizCard | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const displayedQuizzes: QuizCard[] = (store.publishedQuizzes.length > 0 ? store.publishedQuizzes : MOCK_QUIZZES).filter(q => {
    if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (subjectFilter && q.subject !== subjectFilter) return false;
    if (departmentFilter && q.department !== departmentFilter) return false;
    if (semesterFilter && q.semester !== semesterFilter) return false;
    return true;
  });

  const handleStartAttempt = (quiz: QuizCard) => {
    if (quiz.isPasswordProtected) {
      setPasswordModal(quiz);
      setPasswordInput('');
      setPasswordError('');
      return;
    }
    navigate(`/quiz/${quiz.id}/attempt`, { state: { quiz } });
  };

  const handlePasswordSubmit = () => {
    if (!passwordInput.trim()) {
      setPasswordError('Please enter the access passcode.');
      return;
    }
    if (passwordModal) {
      navigate(`/quiz/${passwordModal.id}/attempt`, { state: { quiz: passwordModal } });
      setPasswordModal(null);
    }
  };

  const liveCount = displayedQuizzes.filter(q => getQuizBadgeStatus(q) === 'LIVE').length;

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
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 60%)' }} />

      <div className="relative z-10 p-6 md:p-10">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              id="start-quiz-back"
              onClick={() => navigate('/features')}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold text-blue-400 font-mono tracking-widest uppercase flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                START QUIZ · {liveCount} LIVE NOW
              </p>
              <h1 className="text-xl font-black text-white tracking-wide">Available Tests</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="quiz-search"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search quizzes..."
                className="w-full bg-[#0e1322]/60 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/30 transition-colors"
              />
            </div>
            <button
              id="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold cursor-pointer transition-all ${showFilters ? 'border-blue-500/40 bg-blue-500/10 text-blue-400' : 'border-white/5 text-slate-400 hover:text-white hover:border-white/10'}`}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </header>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#0e1322]/40 border border-white/5 rounded-2xl p-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Subject</label>
                  <select
                    id="subject-filter"
                    value={subjectFilter}
                    onChange={e => setSubjectFilter(e.target.value as EngSubject | '')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white cursor-pointer appearance-none focus:outline-none focus:border-blue-500/30"
                  >
                    <option value="" className="bg-[#0e1322]">All Subjects</option>
                    {ENG_SUBJECTS.map(s => <option key={s} value={s} className="bg-[#0e1322]">{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Department</label>
                  <select
                    id="department-filter"
                    value={departmentFilter}
                    onChange={e => setDepartmentFilter(e.target.value as Department | '')}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white cursor-pointer appearance-none focus:outline-none focus:border-blue-500/30"
                  >
                    <option value="" className="bg-[#0e1322]">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-[#0e1322]">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Semester</label>
                  <select
                    id="semester-filter"
                    value={semesterFilter}
                    onChange={e => setSemesterFilter(Number(e.target.value))}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white cursor-pointer appearance-none focus:outline-none focus:border-blue-500/30"
                  >
                    <option value={0} className="bg-[#0e1322]">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-[#0e1322]">Semester {s}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {displayedQuizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen className="w-10 h-10 text-slate-600 mb-4" />
            <p className="text-lg font-bold text-slate-400">No quizzes found</p>
            <p className="text-sm text-slate-600 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayedQuizzes.map(quiz => {
              const badgeStatus = getQuizBadgeStatus(quiz);
              const statusCfg = STATUS_CONFIG[badgeStatus];
              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 hover:border-white/10 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${badgeStatus === 'LIVE' ? 'animate-pulse' : ''}`} />
                        {statusCfg.label}
                      </span>
                      {quiz.isPasswordProtected && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border text-amber-400 border-amber-500/30 bg-amber-500/8 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Password
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${DIFF_COLORS[quiz.difficulty]}`}>
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white leading-snug group-hover:text-blue-300 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-[11px] text-blue-400 font-mono mt-1 uppercase tracking-wider">
                      {quiz.subject} · {quiz.department}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Clock, label: quiz.durationMinutes ? `${quiz.durationMinutes} min` : 'Untimed' },
                      { icon: BookOpen, label: `${quiz.questionCount} Questions` },
                      { icon: Zap, label: `${quiz.totalMarks} Marks` },
                      { icon: Users, label: `Semester ${quiz.semester}` }
                    ].map(({ icon: Icon, label }, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Icon className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>

                  {(quiz.startDate || quiz.endDate) && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 border-t border-white/5 pt-3">
                      <Calendar className="w-3 h-3" />
                      {quiz.startDate && <span>Opens: {new Date(quiz.startDate).toLocaleDateString()}</span>}
                      {quiz.startDate && quiz.endDate && <span>·</span>}
                      {quiz.endDate && <span>Closes: {new Date(quiz.endDate).toLocaleDateString()}</span>}
                    </div>
                  )}

                  <button
                    id={`start-quiz-${quiz.id}`}
                    onClick={() => handleStartAttempt(quiz)}
                    disabled={badgeStatus === 'EXPIRED' || badgeStatus === 'UPCOMING'}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      badgeStatus === 'LIVE'
                        ? 'bg-blue-600 hover:bg-blue-500 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]'
                        : 'bg-white/5 border-white/5 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    {badgeStatus === 'LIVE' && <Play className="w-4 h-4" />}
                    {badgeStatus === 'LIVE' ? 'Start Quiz' : badgeStatus === 'UPCOMING' ? 'Coming Soon' : 'Expired'}
                    {badgeStatus === 'LIVE' && <ChevronRight className="w-4 h-4" />}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {passwordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
            onClick={() => setPasswordModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0e1322] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Protected Quiz</h3>
                  <p className="text-[11px] text-slate-500">{passwordModal.title}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4">Enter the access passcode provided by your teacher to begin this quiz.</p>
              <input
                id="password-input-modal"
                type="text"
                value={passwordInput}
                onChange={e => { setPasswordInput(e.target.value.toUpperCase()); setPasswordError(''); }}
                onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
                placeholder="e.g. LNCT-DSA-2026"
                autoFocus
                className="w-full bg-black/30 border border-amber-500/20 rounded-xl px-4 py-3 text-sm text-amber-300 placeholder:text-amber-900/60 font-mono uppercase tracking-widest focus:outline-none focus:border-amber-500/50 mb-1"
              />
              {passwordError && (
                <div className="flex items-center gap-2 text-[11px] text-red-400 mb-3">
                  <AlertCircle className="w-3 h-3" /> {passwordError}
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setPasswordModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white text-sm font-bold uppercase tracking-wider cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  id="password-submit-btn"
                  onClick={handlePasswordSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold uppercase tracking-wider cursor-pointer transition-all"
                >
                  Unlock
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
