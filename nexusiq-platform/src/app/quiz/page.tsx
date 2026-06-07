'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, BookOpen, Clock, Users, ChevronRight, Sparkles, Filter } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const SUBJECTS = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'];
const DIFFICULTIES = ['All', 'EASY', 'MEDIUM', 'HARD', 'EXPERT'];
const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  MEDIUM: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  HARD: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  EXPERT: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
};

interface QuizCard {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  difficulty: string;
  duration: number;
  isAIGen: boolean;
  _count: { questions: number; attempts: number };
}

function QuizCardUI({ quiz }: { quiz: QuizCard }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="group relative rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm overflow-hidden"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {quiz.isAIGen && (
                <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3" /> AI Generated
                </span>
              )}
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[quiz.difficulty] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                {quiz.difficulty}
              </span>
            </div>
            <h3 className="font-semibold text-white text-base leading-tight line-clamp-2">{quiz.title}</h3>
            <p className="text-sm text-white/40 mt-1">{quiz.subject}{quiz.topic ? ` · ${quiz.topic}` : ''}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-5 text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            {quiz._count.questions} questions
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {Math.floor(quiz.duration / 60)} min
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {quiz._count.attempts.toLocaleString()} attempts
          </span>
        </div>

        {/* CTA */}
        <Link to={`/quiz/${quiz.id}`} className="group/btn flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-sm font-medium transition-all duration-200">
          Start Quiz
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function QuizBrowserPage() {
  const [quizzes, setQuizzes] = useState<QuizCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (search) params.set('search', search);
      if (subject !== 'All') params.set('subject', subject);
      if (difficulty !== 'All') params.set('difficulty', difficulty);

      const res = await fetch(`${API}/quizzes?${params}`);
      const json = await res.json();
      const data = json.data ?? json;
      setQuizzes(data.quizzes ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, subject, difficulty]);

  useEffect(() => {
    const t = setTimeout(fetchQuizzes, 300);
    return () => clearTimeout(t);
  }, [fetchQuizzes]);

  return (
    <div className="min-h-screen bg-[#050816] px-6 py-8 md:px-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-indigo-400" />
              Quiz Arena
            </h1>
            <p className="text-white/40 mt-1">Browse and attempt {total.toLocaleString()} quizzes</p>
          </div>
          <Link to="/quiz/create"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" /> AI Generate
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
          >
            {SUBJECTS.map((s) => <option key={s} value={s} className="bg-[#0d1117]">{s}</option>)}
          </select>
          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
          >
            {DIFFICULTIES.map((d) => <option key={d} value={d} className="bg-[#0d1117]">{d}</option>)}
          </select>
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-white/3 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No quizzes found.</p>
          <p className="text-white/20 text-sm mt-1">Try adjusting your filters or generate one with AI.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          <AnimatePresence>
            {quizzes.map((quiz, i) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <QuizCardUI quiz={quiz} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center items-center gap-3 mt-10">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-30 transition-all">Prev</button>
          <span className="text-white/40 text-sm">Page {page} of {Math.ceil(total / 12)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 12)} className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-30 transition-all">Next</button>
        </div>
      )}
    </div>
  );
}
