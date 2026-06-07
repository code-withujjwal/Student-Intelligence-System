import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuiz } from '../contexts/QuizContext';
import {
  ChevronRight, ChevronLeft, Flag, Trash2, Send,
  Clock, BookOpen, AlertTriangle, Loader2,
} from 'lucide-react';

const formatTime = (s: number) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map(n => String(n).padStart(2, '0'))
    .join(':');

const PALETTE: Record<string, string> = {
  answered: 'bg-indigo-600 text-white',
  marked: 'bg-amber-500 text-white',
  unvisited: 'text-white/30',
  current: 'text-white ring-1 ring-indigo-500',
};

const MCQOption: React.FC<{ label: string; text: string; selected: boolean; onClick: () => void }> = ({
  label, text, selected, onClick,
}) => (
  <motion.button
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className={`w-full flex items-start gap-4 px-5 py-4 rounded-xl text-left transition-all duration-150 ${
      selected
        ? 'border border-indigo-500/60 bg-indigo-600/10 text-white'
        : 'border border-white/8 bg-[#0A0A0A] text-white/70 hover:border-white/16 hover:text-white'
    }`}
    style={{ borderRadius: 10 }}
  >
    <span
      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono mt-0.5"
      style={{
        background: selected ? '#6366F1' : 'rgba(255,255,255,0.06)',
        color: selected ? '#fff' : '#94A3B8',
      }}
    >
      {label}
    </span>
    <span className="text-sm leading-relaxed pt-0.5">{text}</span>
  </motion.button>
);

const MCQQuestion: React.FC<{ question: any; onAnswer: (a: string) => void }> = ({ question, onAnswer }) => (
  <div className="space-y-3">
    <p className="text-base font-medium text-white leading-relaxed mb-6">{question?.content ?? ''}</p>
    {(question?.options ?? []).map((opt: string, i: number) => (
      <MCQOption
        key={i}
        label={['A', 'B', 'C', 'D'][i]}
        text={opt}
        selected={question?.userAnswer === opt}
        onClick={() => onAnswer(opt)}
      />
    ))}
  </div>
);

const ARQuestion: React.FC<{ question: any; onAnswer: (a: string) => void }> = ({ question, onAnswer }) => {
  const content = question?.content ?? '';
  const aMatch = content.match(/Assertion[:\s]+(.*?)(?=Reason[:\s]|$)/is);
  const rMatch = content.match(/Reason[:\s]+(.*)/is);
  const assertion = aMatch ? aMatch[1].trim() : content;
  const reason = rMatch ? rMatch[1].trim() : '';
  const opts = [
    'A is true, R is true; R is correct explanation',
    'A is true, R is true; R is not correct explanation',
    'A is true, R is false',
    'A is false, R is true',
  ];
  return (
    <div className="space-y-3">
      <div className="rounded-xl p-4" style={{ background: '#0A0A0A', border: '1px solid rgba(245,158,11,0.2)' }}>
        <p className="label-caps mb-2" style={{ color: '#f59e0b' }}>Assertion</p>
        <p className="text-sm text-white/80 leading-relaxed">{assertion}</p>
      </div>
      {reason && (
        <div className="rounded-xl p-4" style={{ background: '#0A0A0A', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p className="label-caps mb-2" style={{ color: '#6366F1' }}>Reason</p>
          <p className="text-sm text-white/80 leading-relaxed">{reason}</p>
        </div>
      )}
      <div className="space-y-2 mt-4">
        {opts.map((opt, i) => (
          <MCQOption
            key={i}
            label={['A', 'B', 'C', 'D'][i]}
            text={opt}
            selected={question?.userAnswer === opt}
            onClick={() => onAnswer(opt)}
          />
        ))}
      </div>
    </div>
  );
};

const Palette: React.FC<{ onJump: (i: number) => void }> = ({ onJump }) => {
  const { questionPalette, currentQuestionIndex } = useQuiz();
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 px-1">
      {questionPalette.map(item => {
        const isCurrent = currentQuestionIndex === item.id - 1;
        const status = isCurrent ? 'current' : item.status;
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onJump(item.id - 1)}
            className={`shrink-0 w-8 h-8 rounded-lg text-xs font-bold font-mono-data transition-all ${PALETTE[status] ?? PALETTE.unvisited}`}
            style={{
              background: status === 'answered' ? '#4f46e5' : status === 'marked' ? '#d97706' : 'rgba(255,255,255,0.04)',
            }}
          >
            {item.id}
          </motion.button>
        );
      })}
    </div>
  );
};

const ExamInterface: React.FC = () => {
  const {
    currentQuestionIndex, setCurrentQuestionIndex, questions,
    timeLeft, currentSubject, setCurrentSubject,
    updateUserAnswer, toggleMarked, clearResponse, submitQuiz, questionPalette,
  } = useQuiz();

  const [showModal, setShowModal] = useState(false);

  const safeIdx = Math.min(currentQuestionIndex, Math.max(questions.length - 1, 0));
  const q = questions.length > 0 ? questions[safeIdx] : undefined;

  const subjects = ['Physics', 'Chemistry', 'Math'];
  const counts = useCallback(() =>
    subjects.reduce<Record<string, { total: number; done: number }>>((acc, sub) => {
      const sq = questions.filter(x => x.subject === sub);
      acc[sub] = { total: sq.length, done: sq.filter(x => x.userAnswer).length };
      return acc;
    }, {}),
    [questions]
  )();

  const answered = questionPalette.filter(p => p.status === 'answered').length;
  const urgent = timeLeft < 300;
  const critical = timeLeft < 120;

  if (!q || questions.length === 0) {
    return (
      <div className="min-h-screen surface-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl karl-card-inset flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" style={{ color: '#94A3B8' }} />
          </div>
          <p className="text-white/60 text-sm">No questions loaded</p>
          <div className="flex items-center justify-center gap-1.5" style={{ color: '#94A3B8' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs">Waiting for quiz data...</span>
          </div>
        </div>
      </div>
    );
  }

  const qType = (q?.type ?? 'mcq').toLowerCase();
  const isAR = qType === 'ar' || qType === 'assertion-reason';

  return (
    <div className="min-h-screen surface-0 flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="sticky top-0 z-50" style={{ background: '#000', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="label-caps">Project Karl</p>
              <p className="text-white text-sm font-semibold leading-none mt-0.5">Exam Mode</p>
            </div>
            <div className="hidden md:flex gap-1">
              {subjects.map(sub => (
                <button
                  key={sub}
                  onClick={() => setCurrentSubject(sub)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: currentSubject === sub ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: currentSubject === sub ? '#6366F1' : '#94A3B8',
                    border: currentSubject === sub ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  }}
                >
                  {sub}
                  <span className="font-mono-data" style={{ color: currentSubject === sub ? '#6366F1' : '#475569' }}>
                    {counts[sub]?.done ?? 0}/{counts[sub]?.total ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.div
              animate={critical ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.7 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: critical ? 'rgba(239,68,68,0.1)' : urgent ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${critical ? 'rgba(239,68,68,0.3)' : urgent ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <Clock className="w-3.5 h-3.5" style={{ color: critical ? '#ef4444' : urgent ? '#f59e0b' : '#94A3B8' }} />
              <span className="font-mono-data text-base font-bold" style={{ color: critical ? '#ef4444' : urgent ? '#f59e0b' : '#fff' }}>
                {formatTime(timeLeft)}
              </span>
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: '#dc2626', border: '1px solid rgba(220,38,38,0.5)' }}
            >
              <Send className="w-3.5 h-3.5" /> Submit
            </motion.button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="label-caps">{currentSubject?.toUpperCase() ?? ''}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="label-caps">{isAR ? 'Assertion–Reason' : 'Multiple Choice'}</span>
              </div>
              <p className="text-white/40 text-xs font-mono-data">
                Q{safeIdx + 1} <span style={{ color: '#94A3B8' }}>of {questions.length}</span>
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={safeIdx}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {isAR ? (
                  <ARQuestion question={q} onAnswer={a => q?.id != null && updateUserAnswer(q.id, a)} />
                ) : (
                  <MCQQuestion question={q} onAnswer={a => q?.id != null && updateUserAnswer(q.id, a)} />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-2 mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => q?.id != null && toggleMarked(q.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: q?.marked ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                  border: q?.marked ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: q?.marked ? '#f59e0b' : '#94A3B8',
                }}
              >
                <Flag className="w-3.5 h-3.5" /> {q?.marked ? 'Marked' : 'Mark for Review'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => q?.id != null && clearResponse(q.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </motion.button>
            </div>
          </div>
        </main>

        <aside className="w-64 hidden lg:flex flex-col" style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', background: '#000' }}>
          <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="label-caps mb-3">Question Palette</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Done', val: answered, color: '#6366F1' },
                { label: 'Review', val: questionPalette.filter(p => p.status === 'marked').length, color: '#f59e0b' },
                { label: 'Left', val: questions.length - answered, color: '#94A3B8' },
              ].map(({ label, val, color }) => (
                <div key={label} className="karl-card-inset py-2">
                  <p className="font-mono-data font-bold text-base" style={{ color }}>{val}</p>
                  <p className="label-caps mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-1.5">
              {questionPalette.map(item => {
                const isCurr = safeIdx === item.id - 1;
                const s = isCurr ? 'current' : item.status;
                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setCurrentQuestionIndex(Math.min(item.id - 1, questions.length - 1))}
                    className="aspect-square rounded-lg text-xs font-bold font-mono-data transition-all"
                    style={{
                      background: s === 'answered' ? '#4f46e5' : s === 'marked' ? '#d97706' : 'rgba(255,255,255,0.04)',
                      color: s === 'current' ? '#fff' : s === 'answered' || s === 'marked' ? '#fff' : '#475569',
                      outline: isCurr ? '1px solid #6366F1' : 'none',
                      outlineOffset: '2px',
                    }}
                  >
                    {item.id}
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { color: '#4f46e5', label: 'Answered' },
              { color: '#d97706', label: 'Marked' },
              { color: 'rgba(255,255,255,0.04)', label: 'Not Visited' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 mb-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ background: color, border: '1px solid rgba(255,255,255,0.1)' }} />
                <span className="label-caps">{label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <footer className="sticky bottom-0" style={{ background: '#000', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-6 py-3 flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentQuestionIndex(Math.max(0, safeIdx - 1))}
            disabled={safeIdx === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </motion.button>

          <div className="flex-1 overflow-hidden">
            <Palette onJump={setCurrentQuestionIndex} />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, safeIdx + 1))}
            disabled={safeIdx === questions.length - 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-30"
            style={{ background: '#6366F1', border: '1px solid rgba(99,102,241,0.5)' }}
          >
            Next <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </footer>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="karl-card p-8 max-w-sm w-full"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="text-base font-bold text-white">Submit Exam?</h3>
              </div>
              <div className="space-y-2 mb-6">
                {[
                  { label: 'Answered', val: answered, color: '#6366F1' },
                  { label: 'Unanswered', val: questions.length - answered, color: '#ef4444' },
                  { label: 'Marked for Review', val: questionPalette.filter(p => p.status === 'marked').length, color: '#f59e0b' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center justify-between text-sm karl-card-inset px-3 py-2">
                    <span style={{ color: '#94A3B8' }}>{label}</span>
                    <span className="font-mono-data font-bold" style={{ color }}>{val}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="karl-btn-ghost flex-1">Cancel</button>
                <button onClick={() => { submitQuiz(); setShowModal(false); }} className="karl-btn-primary flex-1">Submit Now</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamInterface;
