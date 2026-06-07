import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle2,
  AlertCircle, LayoutGrid, List, CheckSquare, Circle,
  Type, AlignLeft
} from 'lucide-react';
import { useAttemptStore, getCurrentQuestion } from '../store/useAttemptStore';
import { useAuth } from '../contexts/AuthContext';
import type { QuizCard, EngineeringQuiz, Section, EngQuestion, QuestionOption } from '../types/projectKarl';
import { quizApi } from '../api/quizApi';
import { toast } from 'sonner';

// Helper to map backend QuizResponseDTO to frontend EngineeringQuiz model
const mapBackendQuizToEngineeringQuiz = (backendQuiz: any): EngineeringQuiz => {
  const settings = backendQuiz.settings || {
    durationMinutes: backendQuiz.durationMinutes || 60,
    startDate: null,
    endDate: null,
    visibility: 'PUBLIC',
    password: null,
    maxAttempts: backendQuiz.maxAttempts || 1,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResultImmediately: true
  };

  const sections: Section[] = (backendQuiz.sections || []).map((sec: any, secIdx: number) => {
    const sectionId = sec.id ? String(sec.id) : `sec-${secIdx}`;
    const questions: EngQuestion[] = (sec.questions || []).map((q: any, qIdx: number) => {
      const details = q.questionDetails || {};
      const options: QuestionOption[] = (details.options || []).map((opt: any) => ({
        id: String(opt.id),
        text: opt.optionText || ''
      }));
      const correctOptionIds = (details.options || [])
        .filter((opt: any) => opt.isCorrect)
        .map((opt: any) => String(opt.id));

      return {
        id: String(details.id || q.questionId || `q-${secIdx}-${qIdx}`),
        sectionId: sectionId,
        text: details.questionText || details.title || 'Question Text',
        type: details.questionType || 'SINGLE_CHOICE',
        options: options,
        correctOptionIds: correctOptionIds,
        marks: q.marks || details.marks || 1,
        negativeMarks: q.negativeMarks || details.negativeMarks || 0,
        difficulty: details.difficulty || 'MEDIUM',
        explanation: details.explanation || '',
        imageUrl: details.imageUrl || null
      };
    });

    return {
      id: sectionId,
      quizId: String(backendQuiz.id),
      title: sec.title || `Section ${secIdx + 1}`,
      order: secIdx,
      questions: questions
    };
  });

  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const totalMarks = sections.reduce((acc, s) => acc + s.questions.reduce((qAcc, q) => qAcc + q.marks, 0), 0);

  return {
    id: String(backendQuiz.id),
    teacherId: backendQuiz.teacherId ? String(backendQuiz.teacherId) : 'teacher-1',
    title: backendQuiz.title || 'AI Generated Quiz',
    description: backendQuiz.description || '',
    subject: backendQuiz.subject || 'CS',
    department: backendQuiz.department || 'Computer Science',
    semester: backendQuiz.semester || 1,
    difficulty: backendQuiz.difficulty || 'MEDIUM',
    thumbnailUrl: null,
    status: backendQuiz.status || 'PUBLISHED',
    settings: {
      durationMinutes: settings.durationMinutes ?? (backendQuiz.durationMinutes || 60),
      startDate: settings.startDate ?? null,
      endDate: settings.endDate ?? null,
      visibility: settings.visibility ?? 'PUBLIC',
      password: settings.password ?? null,
      maxAttempts: settings.maxAttempts ?? (backendQuiz.maxAttempts || 1),
      shuffleQuestions: settings.shuffleQuestions ?? false,
      shuffleOptions: settings.shuffleOptions ?? false,
      showResultImmediately: settings.showResultImmediately ?? true
    },
    sections: sections,
    questionCount: totalQuestions,
    totalMarks: totalMarks,
    createdAt: backendQuiz.createdAt || new Date().toISOString(),
    publishedAt: backendQuiz.createdAt || new Date().toISOString()
  };
};

// Temporary mock fetcher for development since we don't have the backend wired completely
// In production, loadQuiz would fetch the full quiz structure
const mockLoadFullQuiz = (quizCard: QuizCard): EngineeringQuiz => ({
  ...quizCard,
  teacherId: 'teacher-1',
  description: 'Complete this test within the allotted time.',
  settings: {
    durationMinutes: quizCard.durationMinutes,
    startDate: quizCard.startDate,
    endDate: quizCard.endDate,
    visibility: 'PUBLIC',
    password: null,
    maxAttempts: 1,
    shuffleQuestions: false,
    shuffleOptions: false,
    showResultImmediately: true
  },
  sections: [
    {
      id: 's1',
      quizId: quizCard.id,
      title: 'Section A - Core Concepts',
      order: 0,
      questions: [
        {
          id: 'q1',
          sectionId: 's1',
          text: 'Which data structure uses LIFO principle?',
          type: 'SINGLE_CHOICE',
          options: [
            { id: 'o1', text: 'Queue' },
            { id: 'o2', text: 'Stack' },
            { id: 'o3', text: 'Linked List' },
            { id: 'o4', text: 'Tree' }
          ],
          correctOptionIds: ['o2'],
          marks: 1,
          negativeMarks: 0,
          difficulty: 'EASY',
          explanation: 'Stack is Last In First Out.',
          imageUrl: null
        }
      ]
    }
  ],
  createdAt: new Date().toISOString()
});

export default function QuizAttempt() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useAttemptStore();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const quizCard = location.state?.quiz as QuizCard | undefined;

  useEffect(() => {
    if (!user) {
      navigate('/start');
      return;
    }

    let isMounted = true;

    const initQuiz = async () => {
      try {
        if (!id) throw new Error('No Quiz ID specified');
        
        // Fetch full quiz details from the backend
        const response = await quizApi.getQuizById(Number(id));
        
        if (!isMounted) return;

        // If the backend returns a successful response containing data
        if (response && response.success && response.data) {
          const fullQuiz = mapBackendQuizToEngineeringQuiz(response.data);
          store.loadQuiz(fullQuiz, user.id);
        } else {
          // If the backend response is invalid, fallback to mock if quizCard is present
          if (quizCard) {
            const fullQuiz = mockLoadFullQuiz(quizCard);
            store.loadQuiz(fullQuiz, user.id);
          } else {
            throw new Error('Failed to load quiz details from server.');
          }
        }
      } catch (err: any) {
        console.error('Error fetching quiz details:', err);
        if (!isMounted) return;

        // Fallback to mock if quizCard is provided (backward compatibility)
        if (quizCard) {
          const fullQuiz = mockLoadFullQuiz(quizCard);
          store.loadQuiz(fullQuiz, user.id);
        } else {
          setFetchError(err.message || 'Failed to fetch quiz');
        }
      }
    };

    initQuiz();

    return () => {
      isMounted = false;
      store.resetAttempt();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  useEffect(() => {
    if (!store.timerActive) return;
    const interval = setInterval(() => {
      store.tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [store.timerActive]);

  const handleSubmit = async () => {
    setShowSubmitModal(false);
    const result = await store.submitAttempt();
    if (result || !result) {
      // Navigate to result anyway for demo purposes. In real app, check if result exists
      navigate(`/quiz/${store.attempt?.id || 'demo-attempt'}/result`);
    }
  };

  const currentQ = getCurrentQuestion(store);
  const section = store.quiz?.sections[store.currentSectionIndex];
  const answer = currentQ ? store.answers[currentQ.id] : null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (store.timeRemaining === 600) toast('10 Minutes Remaining', { icon: '⏳' });
    if (store.timeRemaining === 300) toast.warning('5 Minutes Remaining!');
    if (store.timeRemaining === 60) toast.error('1 Minute Remaining! Prepare to submit.');
    if (store.timeRemaining === 1 && store.timerActive) {
       toast.error('Time Expired. Auto-submitting...');
       setShowSubmitModal(false);
    }
  }, [store.timeRemaining, store.timerActive]);

  if (fetchError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-slate-200"
        style={{
          background: '#060912',
          backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          fontFamily: '"Space Mono", "JetBrains Mono", "Fira Code", monospace'
        }}
      >
        <div className="bg-[#0e1322]/80 backdrop-blur-md border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2 uppercase tracking-widest text-white">Failed to Load Quiz</h3>
          <p className="text-xs text-slate-400 mb-6 font-mono">{fetchError}</p>
          <button
            onClick={() => navigate('/features')}
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer text-slate-300 hover:text-white"
          >
            Return to Features
          </button>
        </div>
      </div>
    );
  }

  if (store.isLoading || !store.quiz) {
    return (
      <div className="min-h-screen bg-[#060912] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-blue-400 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Test Environment...</p>
        </div>
      </div>
    );
  }

  const isLastQuestion =
    store.currentSectionIndex === store.quiz.sections.length - 1 &&
    store.currentQuestionIndex === (section?.questions.length ?? 1) - 1;

  const totalQCount = store.quiz.questionCount || store.quiz.sections.reduce((acc, s) => acc + s.questions.length, 0);

  const answeredCount = Object.values(store.answers).filter(a => a.status === 'answered' || a.status === 'answered_marked').length;
  const markedCount = Object.values(store.answers).filter(a => a.status === 'marked' || a.status === 'answered_marked').length;
  const notVisitedCount = Object.values(store.answers).filter(a => a.status === 'not_visited').length;

  return (
    <div
      className="min-h-screen flex flex-col text-slate-200"
      style={{
        background: '#060912',
        backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        fontFamily: '"Inter", system-ui, sans-serif'
      }}
    >
      <header className="sticky top-0 z-40 bg-[#060912]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-black text-white truncate max-w-sm">{store.quiz.title}</h1>
          <p className="text-[10px] text-blue-400 font-mono uppercase tracking-widest mt-0.5">
            {store.quiz.subject} · {store.quiz.department}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">Progress</p>
              <p className="text-xs font-mono font-bold text-white">
                <span className="text-blue-400">{answeredCount}</span> / {totalQCount}
              </p>
            </div>
            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(answeredCount / Math.max(totalQCount, 1)) * 100}%` }}
              />
            </div>
          </div>

          {store.quiz.settings.durationMinutes > 0 && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              store.timeRemaining < 300
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              <Clock className={`w-4 h-4 ${store.timeRemaining < 300 ? 'animate-pulse' : ''}`} />
              <span className="font-mono font-bold tracking-wider">{formatTime(store.timeRemaining)}</span>
            </div>
          )}

          <button
            onClick={() => setShowSubmitModal(true)}
            className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          >
            Submit Test
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-4 overflow-y-auto max-h-[calc(100vh-120px)] sticky top-24">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Question Navigator
            </h3>

            <div className="flex flex-col gap-5">
              {store.quiz.sections.map((s, sIdx) => (
                <div key={s.id}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${
                    store.currentSectionIndex === sIdx ? 'text-blue-400' : 'text-slate-500'
                  }`}>
                    {s.title}
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {s.questions.map((q, qIdx) => {
                      const ans = store.answers[q.id];
                      const status = ans?.status || 'not_visited';
                      const isCurrent = store.currentSectionIndex === sIdx && store.currentQuestionIndex === qIdx;

                      let btnClass = 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'; // not_visited
                      if (isCurrent) {
                        btnClass = 'bg-blue-600 border-2 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)] scale-110';
                      } else if (status === 'answered_marked') {
                        btnClass = 'bg-purple-600 border border-purple-400 text-white';
                      } else if (status === 'marked') {
                        btnClass = 'bg-amber-600 border border-amber-400 text-white';
                      } else if (status === 'answered') {
                        btnClass = 'bg-green-600 border border-green-400 text-white';
                      } else if (status === 'visited') {
                        btnClass = 'bg-slate-700 border border-slate-500 text-white';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            store.goToSection(sIdx);
                            store.goToQuestion(qIdx);
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-all cursor-pointer ${btnClass}`}
                        >
                          {qIdx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-600 border border-green-400" /> Answered</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-purple-600 border border-purple-400" /> Ans & Marked</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-amber-600 border border-amber-400" /> Marked</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-slate-700 border border-slate-500" /> Visited</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/10" /> Not Visited</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-600 border border-blue-400" /> Current</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col"
            >
              {currentQ ? (
                <div className="bg-[#0e1322]/40 border border-white/5 rounded-2xl p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono">
                      Question {store.currentQuestionIndex + 1} of {section?.questions.length}
                    </span>
                    <div className="flex gap-3 text-[10px] font-mono uppercase font-bold">
                      <span className="text-slate-400 border border-white/10 px-2 py-0.5 rounded">
                        Marks: <span className="text-green-400">+{currentQ.marks}</span>
                      </span>
                      {currentQ.negativeMarks > 0 && (
                        <span className="text-slate-400 border border-white/10 px-2 py-0.5 rounded">
                          Neg: <span className="text-red-400">-{currentQ.negativeMarks}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="text-xl font-medium text-white leading-relaxed mb-8 whitespace-pre-wrap">
                    {currentQ.text}
                  </h2>

                  <div className="flex-1 flex flex-col gap-3">
                    {(currentQ.type === 'SINGLE_CHOICE' || currentQ.type === 'TRUE_FALSE') && currentQ.options.map((opt, i) => {
                      const isSelected = answer?.selectedOptionIds.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => store.selectOption(currentQ.id, opt.id, false)}
                          className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                              : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'border-blue-400' : 'border-slate-600'
                          }`}>
                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                          </div>
                          <span className="text-sm font-medium text-slate-200">{opt.text}</span>
                        </button>
                      );
                    })}

                    {currentQ.type === 'MULTIPLE_CHOICE' && currentQ.options.map((opt, i) => {
                      const isSelected = answer?.selectedOptionIds.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => store.selectOption(currentQ.id, opt.id, true)}
                          className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                              : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected ? 'bg-blue-500 border-blue-400' : 'border-slate-600 bg-transparent'
                          }`}>
                            {isSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="text-sm font-medium text-slate-200">{opt.text}</span>
                        </button>
                      );
                    })}

                    {(currentQ.type === 'SUBJECTIVE' || currentQ.type === 'CODE_WRITING') && (
                      <textarea
                        value={answer?.textAnswer ?? ''}
                        onChange={e => store.setTextAnswer(currentQ.id, e.target.value)}
                        placeholder="Type your answer here..."
                        rows={6}
                        className={`w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors resize-none ${
                          currentQ.type === 'CODE_WRITING' ? 'font-mono' : ''
                        }`}
                      />
                    )}

                    {(currentQ.type === 'NUMERICAL' || currentQ.type === 'FILL_BLANK' || currentQ.type === 'CODE_OUTPUT' || currentQ.type === 'CODE_ERROR') && (
                      <input
                        type="text"
                        value={answer?.textAnswer ?? ''}
                        onChange={e => store.setTextAnswer(currentQ.id, e.target.value)}
                        placeholder="Enter your answer"
                        className={`w-full max-w-md bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors ${
                          ['CODE_OUTPUT', 'CODE_ERROR'].includes(currentQ.type) ? 'font-mono' : ''
                        }`}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#0e1322]/40 border border-white/5 rounded-2xl">
                  <p className="text-slate-500">Question not found.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => currentQ && store.toggleMarkForReview(currentQ.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 ${
                  answer?.isMarkedForReview 
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-400' 
                    : 'bg-black/30 border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5'
                }`}
              >
                Mark for Review
              </button>
              <button
                onClick={() => currentQ && store.clearAnswer(currentQ.id)}
                className="px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-sm font-bold text-slate-300 hover:text-white hover:border-white/20 uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={store.prevQuestion}
                disabled={store.currentSectionIndex === 0 && store.currentQuestionIndex === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-sm font-bold text-slate-300 hover:text-white hover:border-white/20 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {isLastQuestion ? (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-6 py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                >
                  Submit Test <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={store.nextQuestion}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl text-sm font-bold text-white uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#0e1322] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 mb-4 mx-auto">
                <AlertCircle className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-black text-white text-center mb-1">Submit Assessment?</h3>
              <p className="text-xs text-slate-400 text-center mb-6">
                You cannot change your answers after submission. Review your statistics below:
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                  <span className="text-xl font-bold text-green-400">{answeredCount}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Answered</span>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                  <span className="text-xl font-bold text-slate-400">{totalQCount - answeredCount}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Unanswered</span>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                  <span className="text-xl font-bold text-purple-400">{markedCount}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Marked</span>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col items-center">
                  <span className="text-xl font-bold text-slate-400">{notVisitedCount}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Not Visited</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Return to Test
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={store.isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                >
                  {store.isSubmitting ? 'Submitting...' : 'Confirm Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
