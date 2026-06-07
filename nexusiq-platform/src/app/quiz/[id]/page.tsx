'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, Flag, CheckCircle2, Circle } from 'lucide-react';
import { useQuizStore } from '@/store/useQuizStore';
import { useAuthStore } from '@/store/useAuthStore';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function QuizEnginePage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const { accessToken } = useAuthStore();
  const { quiz, attemptId, answers, timeLeft, currentIndex, status, startQuiz, setAnswer, setCurrentIndex, tick, submitQuiz, reset } = useQuizStore();

  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load quiz and create attempt
  useEffect(() => {
    const init = async () => {
      try {
        const [quizRes, attemptRes] = await Promise.all([
          fetch(`${API}/quizzes/${quizId}`),
          fetch(`${API}/attempts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ quizId }),
          }),
        ]);
        const quizJson = await quizRes.json();
        const attemptJson = await attemptRes.json();
        const q = quizJson.data ?? quizJson;
        const a = attemptJson.data ?? attemptJson;
        startQuiz(q, a.id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) init();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quizId, accessToken]);

  // Timer
  useEffect(() => {
    if (status !== 'active') return;
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, tick]);

  // Redirect to results when complete
  useEffect(() => {
    if (status === 'completed' && attemptId) {
      router.push(`/quiz/${quizId}/results?attemptId=${attemptId}`);
    }
  }, [status, attemptId, quizId, router]);

  const handleSubmit = useCallback(async () => {
    setShowConfirm(false);
    await submitQuiz(accessToken ?? '');
  }, [submitQuiz, accessToken]);

  if (loading || !quiz) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-white/40">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isAnswered = answers[question.id] !== undefined;
  const isUrgent = timeLeft < 120;

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/6 bg-[#050816]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-white/60 line-clamp-1 max-w-xs">{quiz.title}</div>
            <span className="hidden md:block text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
              {quiz.subject}
            </span>
          </div>

          {/* Timer */}
          <motion.div
            animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: isUrgent ? Infinity : 0, duration: 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${
              isUrgent
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </motion.div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={status === 'submitting'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {status === 'submitting' ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        {/* Question Panel */}
        <div className="flex-1 flex flex-col">
          {/* Progress */}
          <div className="flex items-center justify-between mb-4 text-sm text-white/40">
            <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
            <span>{answeredCount} answered</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              animate={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 200 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {/* Question */}
              <div className="rounded-2xl border border-white/8 bg-white/4 p-6 mb-5">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-bold flex items-center justify-center">
                    {currentIndex + 1}
                  </span>
                  <p className="text-white text-base leading-relaxed font-medium">{question.content}</p>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {question.options?.map((opt, i) => {
                  const selected = answers[question.id] === opt;
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setAnswer(question.id, selected ? null : opt)}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 ${
                        selected
                          ? 'border-indigo-500/60 bg-indigo-500/15 text-white'
                          : 'border-white/8 bg-white/3 text-white/70 hover:border-white/15 hover:bg-white/6 hover:text-white'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold transition-all ${selected ? 'border-indigo-400 bg-indigo-400 text-white' : 'border-white/20 text-white/40'}`}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <span className="flex-1 text-sm leading-relaxed">{opt}</span>
                      {selected ? <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" /> : <Circle className="w-5 h-5 text-white/10 flex-shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/6">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-white/30 text-sm">{currentIndex + 1} / {quiz.questions.length}</span>
            <button
              onClick={() => setCurrentIndex(Math.min(quiz.questions.length - 1, currentIndex + 1))}
              disabled={currentIndex === quiz.questions.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question Palette */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24 rounded-2xl border border-white/8 bg-white/3 p-4">
            <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">Question Palette</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {quiz.questions.map((q, i) => {
                const ans = answers[q.id];
                const isActive = i === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : ans !== undefined
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs text-white/40">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40" />
                Answered ({answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/5 border border-white/10" />
                Unanswered ({quiz.questions.length - answeredCount})
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-indigo-600" />
                Current
              </div>
            </div>

            {/* Score estimate */}
            <div className="mt-4 pt-4 border-t border-white/6">
              <p className="text-xs text-white/30 mb-1">Est. Score</p>
              <p className="text-lg font-bold text-white">{answeredCount * 4} pts</p>
              <p className="text-xs text-white/30">Max: {quiz.questions.length * 4} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1117] p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-bold text-white">Submit Quiz?</h2>
              </div>
              <p className="text-white/50 mb-2">You have answered <span className="text-white font-semibold">{answeredCount}</span> of <span className="text-white font-semibold">{quiz.questions.length}</span> questions.</p>
              <p className="text-white/30 text-sm mb-6">Unanswered: {quiz.questions.length - answeredCount}. Once submitted, you cannot change your answers.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:bg-white/5 transition-all">Go Back</button>
                <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition-all">Submit Now</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
