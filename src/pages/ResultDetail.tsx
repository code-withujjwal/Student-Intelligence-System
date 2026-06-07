import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Award, Target,
  Zap, BookOpen, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, Sparkles, Loader2
} from 'lucide-react';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { aiApi } from '../api/aiApi';
import type { DetailedResult, QuestionResult } from '../types/projectKarl';

// Temporary mock result for the prototype UI
const mockDetailedResult: DetailedResult = {
  attemptId: 'demo-attempt',
  quizId: 'q1',
  quizTitle: 'Data Structures Mid-Term Mock',
  userId: 'u1',
  score: 45,
  totalMarks: 60,
  accuracy: 75,
  timeTakenSeconds: 3200,
  rank: 12,
  correctCount: 22,
  incorrectCount: 5,
  skippedCount: 3,
  subjectBreakdown: [
    { subject: 'Data Structures', correct: 22, total: 30, accuracy: 73, avgTimeSeconds: 105 }
  ],
  weakTopics: ['AVL Trees', 'Graph Traversal'],
  strongTopics: ['Arrays', 'Linked Lists', 'Stacks'],
  completedAt: new Date().toISOString(),
  questionResults: [
    {
      questionId: 'q1',
      questionText: 'Which data structure uses LIFO principle?',
      studentAnswer: ['Stack'],
      correctAnswer: ['Stack'],
      isCorrect: true,
      marksEarned: 1,
      timeSpentSeconds: 15,
      explanation: 'Stack uses the Last-In-First-Out (LIFO) principle.'
    },
    {
      questionId: 'q2',
      questionText: 'What is the time complexity of searching in a perfectly balanced BST?',
      studentAnswer: ['O(n)'],
      correctAnswer: ['O(log n)'],
      isCorrect: false,
      marksEarned: 0,
      timeSpentSeconds: 45,
      explanation: 'A perfectly balanced BST halves the search space at each step, yielding O(log n).'
    }
  ]
};

export default function ResultDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useAnalyticsStore();
  const [expandedQs, setExpandedQs] = useState<Record<string, boolean>>({});
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [loadingExpl, setLoadingExpl] = useState<Record<string, boolean>>({});

  const toggleQ = (qid: string) => setExpandedQs(p => ({ ...p, [qid]: !p[qid] }));

  const handleExplain = async (qid: string, question: string, correctAnswer: string, userAnswer: string) => {
    if (explanations[qid]) return;
    setLoadingExpl(p => ({ ...p, [qid]: true }));
    try {
      const resp = await aiApi.explainMistake({ question, correctAnswer, userAnswer, topic: 'General' });
      setExplanations(p => ({ ...p, [qid]: resp.data }));
    } catch (e) {
      setExplanations(p => ({ ...p, [qid]: 'Failed to generate explanation. Please try again.' }));
    } finally {
      setLoadingExpl(p => ({ ...p, [qid]: false }));
    }
  };

  useEffect(() => {
    if (id) {
      // For prototype: set mock data. In production: store.fetchDetailedResult(id)
      useAnalyticsStore.setState({ activeDetailedResult: mockDetailedResult });
      store.fetchGeminiInsights('mock-user');
    }
    return () => store.clearDetailedResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const result = store.activeDetailedResult;

  if (store.loading || !result) {
    return (
      <div className="min-h-screen bg-[#060912] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-blue-400 font-mono text-xs uppercase tracking-widest animate-pulse">Compiling Analytics Data...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div
      className="min-h-screen text-slate-200 pb-16"
      style={{
        background: '#060912',
        backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        fontFamily: '"Inter", system-ui, sans-serif'
      }}
    >
      <header className="sticky top-0 z-40 bg-[#060912]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/karl-log')}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold text-blue-400 font-mono tracking-widest uppercase">
                DETAILED ATTEMPT REPORT
              </p>
              <h1 className="text-sm font-black text-white tracking-wide mt-0.5">{result.quizTitle}</h1>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Completed At</p>
            <p className="text-xs font-bold text-white mt-0.5">{new Date(result.completedAt).toLocaleString()}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0e1322]/50 border border-white/5 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-3xl pointer-events-none" />
            
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Performance Snapshot</h2>
            
            <div className="flex items-end gap-3 mb-8">
              <span className="text-6xl font-black text-white leading-none tracking-tighter">
                {result.score}
              </span>
              <span className="text-lg text-slate-500 font-bold mb-1.5">/ {result.totalMarks}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
                <Target className="w-4 h-4 text-blue-400 mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Accuracy</p>
                <p className="text-lg font-black text-white">{result.accuracy}%</p>
              </div>
              <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
                <Clock className="w-4 h-4 text-purple-400 mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Time Taken</p>
                <p className="text-lg font-black text-white">{formatTime(result.timeTakenSeconds)}</p>
              </div>
              <div className="bg-black/20 border border-white/5 rounded-2xl p-4 col-span-2 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Class Rank</p>
                  <p className="text-lg font-black text-white">{result.rank ? `#${result.rank}` : 'N/A'}</p>
                </div>
                <Award className="w-8 h-8 text-amber-400 opacity-80" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0e1322]/50 border border-white/5 rounded-3xl p-6"
          >
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">Answer Distribution</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-green-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Correct
                </div>
                <span className="text-white font-mono">{result.correctCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <XCircle className="w-4 h-4" /> Incorrect
                </div>
                <span className="text-white font-mono">{result.incorrectCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400 font-bold">
                  <BookOpen className="w-4 h-4" /> Skipped
                </div>
                <span className="text-white font-mono">{result.skippedCount}</span>
              </div>
            </div>
            
            <div className="w-full h-2 rounded-full flex overflow-hidden mt-6 gap-0.5">
              <div style={{ width: `${(result.correctCount / result.questionResults.length) * 100}%` }} className="bg-green-500 h-full" />
              <div style={{ width: `${(result.incorrectCount / result.questionResults.length) * 100}%` }} className="bg-red-500 h-full" />
              <div style={{ width: `${(result.skippedCount / result.questionResults.length) * 100}%` }} className="bg-slate-600 h-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0e1322]/50 border border-white/5 rounded-3xl p-6"
          >
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5">AI Insights</h2>
            {store.insightsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-5/6" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            ) : store.geminiInsights ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-100 leading-relaxed">
                  {store.geminiInsights.summary}
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Recommended Review</h3>
                  <div className="flex flex-wrap gap-2">
                    {store.geminiInsights.recommendedTopics.map((topic, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-black/20 border border-white/5 flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-400">
                  Based on this attempt, your weakest area was <span className="text-white font-bold">{result.weakTopics[0]}</span>. Spend more time reviewing this before the next test.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-4">
          <h2 className="text-lg font-black text-white">Question Analysis</h2>
          <div className="flex flex-col gap-4">
            {result.questionResults.map((qr, idx) => {
              const expanded = expandedQs[qr.questionId];
              return (
                <div key={qr.questionId} className="bg-[#0e1322]/40 border border-white/5 rounded-2xl overflow-hidden">
                  <div 
                    onClick={() => toggleQ(qr.questionId)}
                    className="p-5 flex gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-shrink-0 pt-0.5">
                      {qr.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : qr.studentAnswer.length === 0 ? (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider border border-white/10 px-1.5 py-0.5 rounded">
                          Q{idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {qr.marksEarned} / {qr.marksEarned || 1} mark(s)
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {qr.timeSpentSeconds}s
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-200 line-clamp-2 pr-8 relative">
                        {qr.questionText}
                        {expanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-500 absolute right-0 top-1" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-0 top-1" />
                        )}
                      </p>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-white/5 p-5 bg-black/20 flex flex-col gap-4">
                      <p className="text-sm text-white leading-relaxed">{qr.questionText}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="p-4 rounded-xl border border-white/5 bg-[#0e1322]">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Your Answer</p>
                          <p className={`text-sm font-mono ${!qr.studentAnswer.length ? 'text-slate-500' : qr.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {qr.studentAnswer.length ? qr.studentAnswer.join(', ') : 'Not Answered'}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-[#0e1322]">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Correct Answer</p>
                          <p className="text-sm font-mono text-green-400">{qr.correctAnswer.join(', ')}</p>
                        </div>
                      </div>

                      {!qr.isCorrect && (
                        <button
                          onClick={() => handleExplain(qr.questionId, qr.questionText, qr.correctAnswer.join(', '), qr.studentAnswer.join(', '))}
                          disabled={loadingExpl[qr.questionId]}
                          className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-xs font-bold uppercase tracking-wider w-fit"
                        >
                          {loadingExpl[qr.questionId] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          {loadingExpl[qr.questionId] ? 'Thinking...' : 'Explain My Mistake ✨'}
                        </button>
                      )}

                      {(qr.explanation || explanations[qr.questionId]) && (
                        <div className="mt-2 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Zap className="w-3 h-3" /> {explanations[qr.questionId] ? 'AI Explanation' : 'Explanation'}
                          </p>
                          <p className="text-sm text-slate-300 leading-relaxed">{explanations[qr.questionId] || qr.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
