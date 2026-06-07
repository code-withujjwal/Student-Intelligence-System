import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProjectKarl } from '../hooks/useProjectKarl';
import { useQuiz } from '../contexts/QuizContext';
import ExamInterface from '../components/ExamInterface';
import type { Quiz, Question } from '../types/projectKarl';
import { BookOpen, AlertTriangle, Loader2 } from 'lucide-react';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000002';

const StudentPortal: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { fetchQuizByToken, submitAttempt, isFetching, error } = useProjectKarl();
  const { setQuestions, questions, timeLeft, questionPalette } = useQuiz();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetchQuizByToken(token).then(result => {
      if (!result) return;

      setQuiz(result.quiz);

      const mapped = result.questions.map((q, idx) => ({
        id: idx + 1,
        type: q.type === 'AR' ? 'assertion-reason' : 'mcq',
        subject: q.subject,
        content: q.content,
        options: q.options,
        correctAnswer: q.correct_answer,
        userAnswer: null as string | null,
        marked: false,
      }));

      setQuestions(mapped as any);
      setLoaded(true);
    });
  }, [token]);

  const handleSubmit = async () => {
    if (!quiz || submitted) return;

    const answeredCount = questionPalette.filter(p => p.status === 'answered').length;
    const analytics = [
      { subject: 'Physics' as const, correct: 0, total: 0, accuracy: 0 },
      { subject: 'Chemistry' as const, correct: 0, total: 0, accuracy: 0 },
      { subject: 'Math' as const, correct: 0, total: 0, accuracy: 0 },
    ];

    await submitAttempt({
      quizId: quiz.id,
      userId: MOCK_USER_ID,
      score: answeredCount,
      timeTaken: (quiz.time_limit_seconds ?? 10800) - timeLeft,
      analytics,
    });

    setSubmitted(true);
    navigate('/analytics');
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-slate-400 font-medium">Loading your exam...</p>
          <p className="text-slate-600 text-sm font-mono">{token}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Quiz Not Found</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <p className="text-xs text-slate-600 font-mono">Token: {token}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold hover:border-slate-500 transition-all"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (!loaded || !quiz) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-slate-700 mx-auto" />
          <p className="text-slate-500">Preparing your exam environment...</p>
        </div>
      </div>
    );
  }

  return <ExamInterface />;
};

export default StudentPortal;
