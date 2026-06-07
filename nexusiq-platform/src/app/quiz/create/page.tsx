'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, BookOpen, Target, Hash, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

const SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'History', 'Geography', 'English'];
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];
const COUNTS = [5, 10, 15, 20, 25, 30];

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'from-emerald-500 to-teal-500',
  MEDIUM: 'from-amber-500 to-orange-500',
  HARD: 'from-orange-500 to-red-500',
  EXPERT: 'from-rose-500 to-purple-600',
};

export default function QuizCreatePage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();

  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [count, setCount] = useState(10);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [generatedId, setGeneratedId] = useState('');

  const handleGenerate = async () => {
    if (!subject || !topic) return;
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${API}/ai/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ subject, topic, difficulty, questionCount: count }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Generation failed');
      const data = json.data ?? json;
      setGeneratedId(data.id);
      setStatus('success');
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] px-4 py-10 flex items-start justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">AI Quiz Generator</h1>
          <p className="text-white/40">Powered by Gemini 2.0 Flash — generate any quiz in seconds</p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/8 bg-white/3 backdrop-blur-sm p-8 space-y-6"
        >
          {/* Subject */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">
              <BookOpen className="w-4 h-4" /> Subject
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${
                    subject === s
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                      : 'bg-white/4 border-white/8 text-white/50 hover:border-white/20 hover:text-white/80'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">
              <Target className="w-4 h-4" /> Topic / Chapter
            </label>
            <input
              type="text"
              placeholder="e.g. Kinematics, Organic Chemistry, Integration..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">
              <Zap className="w-4 h-4" /> Difficulty
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    difficulty === d
                      ? `bg-gradient-to-r ${DIFFICULTY_COLORS[d]} text-white border-transparent shadow-lg`
                      : 'bg-white/4 border-white/8 text-white/50 hover:border-white/20 hover:text-white/80'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">
              <Hash className="w-4 h-4" /> Number of Questions
            </label>
            <div className="grid grid-cols-6 gap-2">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    count === n
                      ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300'
                      : 'bg-white/4 border-white/8 text-white/50 hover:border-white/20 hover:text-white/80'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {status === 'error' && (
            <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">Quiz Generated Successfully!</p>
                    <p className="text-xs text-emerald-400/60">{count} questions on {topic}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setStatus('idle'); setTopic(''); setGeneratedId(''); }}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-all text-sm"
                  >
                    Generate Another
                  </button>
                  <button
                    onClick={() => router.push(`/quiz/${generatedId}`)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:opacity-90 transition-all"
                  >
                    Start Quiz <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="generate"
                onClick={handleGenerate}
                disabled={!subject || !topic || status === 'loading'}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-3"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating {count} questions with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Quiz
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {status === 'loading' && (
            <p className="text-center text-xs text-white/30 -mt-2">
              This usually takes 5-15 seconds depending on question count...
            </p>
          )}
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { icon: '⚡', label: 'Instant Generation', sub: 'AI-powered in seconds' },
            { icon: '🎯', label: 'JEE/NEET Ready', sub: 'Exam-level accuracy' },
            { icon: '📖', label: 'Full Explanations', sub: 'Learn from every answer' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/6 bg-white/2 p-4">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-xs font-semibold text-white/60">{item.label}</p>
              <p className="text-xs text-white/30 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
