'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { Trophy, Target, Clock, Zap, CheckCircle2, XCircle, MinusCircle, ChevronDown, ChevronUp, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';
import { useAuthStore } from '@/store/useAuthStore';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

function ScoreRing({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  const r = 56;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} strokeWidth="8" stroke="rgba(255,255,255,0.06)" fill="none" />
        <motion.circle
          cx="72" cy="72" r={r} strokeWidth="8" fill="none"
          stroke="url(#scoreGrad)"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-black text-white"
        >
          {score}
        </motion.span>
        <span className="text-xs text-white/40">/ {max}</span>
      </div>
    </div>
  );
}

interface AnswerDetail {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  timeSpent: number;
}

interface AttemptResult {
  id: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeTaken: number;
  xpEarned?: number;
  answers: AnswerDetail[];
  quiz: {
    title: string;
    subject: string;
    questions: Array<{
      id: string;
      content: string;
      options: string[];
      correctAnswer: string;
      explanation?: string;
    }>;
  };
}

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = params.id as string;
  const attemptId = searchParams.get('attemptId');
  const { accessToken } = useAuthStore();
  const { results, reset } = useQuizStore();

  const [attempt, setAttempt] = useState<AttemptResult | null>(null);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (results) {
        setAttempt(results as AttemptResult);
        setLoading(false);
        return;
      }
      if (!attemptId) return;
      try {
        const res = await fetch(`${API}/attempts/${attemptId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = await res.json();
        setAttempt(json.data ?? json);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [attemptId, results, accessToken]);

  if (loading || !attempt) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const incorrectCount = attempt.answers.filter((a) => !a.isCorrect && a.userAnswer !== null).length;
  const skippedCount = attempt.quiz.questions.length - attempt.answers.length;
  const accuracy = attempt.accuracy?.toFixed(1) ?? '0.0';

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'S', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' };
    if (pct >= 75) return { label: 'A', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' };
    if (pct >= 60) return { label: 'B', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' };
    if (pct >= 40) return { label: 'C', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' };
    return { label: 'D', color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/30' };
  };

  const pct = attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0;
  const grade = getGrade(pct);

  return (
    <div className="min-h-screen bg-[#050816] px-4 py-8 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <button onClick={() => { reset(); router.push('/quiz'); }} className="p-2 rounded-lg border border-white/10 text-white/50 hover:bg-white/5 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm text-white/40">Results for</p>
            <h1 className="text-xl font-bold text-white">{attempt.quiz.title}</h1>
          </div>
        </motion.div>

        {/* Score Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/8 bg-gradient-to-br from-indigo-500/10 via-purple-500/8 to-transparent p-8 mb-6 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          
          <div className="flex items-center justify-center gap-12 mb-6">
            <ScoreRing score={attempt.score} max={attempt.maxScore} />
            <div className={`w-20 h-20 rounded-2xl border-2 ${grade.bg} flex items-center justify-center`}>
              <span className={`text-4xl font-black ${grade.color}`}>{grade.label}</span>
            </div>
          </div>

          {attempt.xpEarned && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-4"
            >
              <Sparkles className="w-4 h-4" /> +{attempt.xpEarned} XP Earned!
            </motion.div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { icon: <Target className="w-4 h-4" />, label: 'Accuracy', value: `${accuracy}%`, color: 'text-blue-400' },
              { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Correct', value: correctCount, color: 'text-emerald-400' },
              { icon: <XCircle className="w-4 h-4" />, label: 'Incorrect', value: incorrectCount, color: 'text-rose-400' },
              { icon: <Clock className="w-4 h-4" />, label: 'Time Taken', value: formatTime(attempt.timeTaken), color: 'text-amber-400' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/4 border border-white/6 p-4 text-center">
                <div className={`flex items-center justify-center gap-1 mb-1 ${stat.color}`}>{stat.icon}</div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-3 mb-8">
          <Link to={`/quiz/${quizId}`} onClick={reset} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all">
            <RotateCcw className="w-4 h-4" /> Retry
          </Link>
          <Link to="/quiz" onClick={reset} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all">
            <Zap className="w-4 h-4" /> More Quizzes
          </Link>
        </motion.div>

        {/* Question Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-lg font-bold text-white mb-4">Question Breakdown</h2>
          <div className="space-y-3">
            {attempt.quiz.questions.map((q, i) => {
              const answerRecord = attempt.answers.find((a) => a.questionId === q.id);
              const skipped = !answerRecord;
              const isExpanded = expandedQ === q.id;

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="rounded-xl border border-white/8 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/3 transition-all"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-white/5 text-white/50 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="flex-1 text-sm text-white/80 line-clamp-1">{q.content}</span>
                    <div className="flex items-center gap-2">
                      {skipped ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/15 border border-gray-500/20 text-gray-400">Skipped</span>
                      ) : answerRecord.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/6">
                      <div className="pt-3 space-y-3">
                        {q.options.map((opt, j) => {
                          const isCorrect = opt === q.correctAnswer;
                          const wasSelected = answerRecord?.userAnswer === opt;
                          return (
                            <div key={j} className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                              isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                              : wasSelected ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                              : 'text-white/40'
                            }`}>
                              <span className="font-bold">{['A','B','C','D'][j]}.</span>
                              <span>{opt}</span>
                              {isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                              {wasSelected && !isCorrect && <XCircle className="w-4 h-4 ml-auto" />}
                            </div>
                          );
                        })}
                        {q.explanation && (
                          <div className="p-3 rounded-lg bg-indigo-500/8 border border-indigo-500/15 text-indigo-300/80 text-sm">
                            <span className="font-semibold text-indigo-300">Explanation:</span> {q.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
