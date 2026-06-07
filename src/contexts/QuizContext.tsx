import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserStore } from '../store/useUserStore';

export type QuestionStatus = 'unvisited' | 'answered' | 'marked' | 'current';

export interface QuestionPaletteItem {
  id: number;
  status: QuestionStatus;
}

export interface Question {
  id: number;
  type: 'mcq' | 'msq' | 'assertion-reason' | 'true-false' | 'diagram';
  subject: string;
  content: string;
  options?: string[];
  correctAnswer?: string | string[];
  userAnswer?: string | string[] | null;
  marked: boolean;
}

interface QuizContextType {
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  questionPalette: QuestionPaletteItem[];
  updateQuestionStatus: (id: number, status: QuestionStatus) => void;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  currentSubject: string;
  setCurrentSubject: (subject: string) => void;
  updateUserAnswer: (questionId: number, answer: string | string[] | null) => void;
  toggleMarked: (questionId: number) => void;
  clearResponse: (questionId: number) => void;
  submitQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

interface QuizProviderProps {
  children: ReactNode;
  initialQuestions?: Question[];
  totalTime?: number;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({
  children,
  initialQuestions = [],
  totalTime = 10800
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [currentSubject, setCurrentSubject] = useState('Physics');
  const [questionPalette, setQuestionPalette] = useState<QuestionPaletteItem[]>([]);

  useEffect(() => {
    const initialPalette = questions.map((q, idx) => ({
      id: idx + 1,
      status: 'unvisited' as QuestionStatus,
    }));
    setQuestionPalette(initialPalette);
  }, [questions]);

  useEffect(() => {
    if (questionPalette.length > 0) {
      const updatedPalette = [...questionPalette];
      updatedPalette[currentQuestionIndex] = {
        ...updatedPalette[currentQuestionIndex],
        status: 'current',
      };
      setQuestionPalette(updatedPalette);
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const updateQuestionStatus = (id: number, status: QuestionStatus) => {
    setQuestionPalette(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const updateUserAnswer = (questionId: number, answer: string | string[] | null) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, userAnswer: answer } : q
      )
    );
    updateQuestionStatus(questionId, answer ? 'answered' : 'unvisited');
  };

  const toggleMarked = (questionId: number) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, marked: !q.marked } : q
      )
    );
    const currentStatus = questionPalette.find(p => p.id === questionId)?.status;
    if (currentStatus !== 'answered') {
      updateQuestionStatus(questionId, 'marked');
    }
  };

  const clearResponse = (questionId: number) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, userAnswer: null, marked: false } : q
      )
    );
    updateQuestionStatus(questionId, 'unvisited');
  };

  const submitQuiz = () => {
    console.log('Quiz submitted', { questions, timeLeft });
    let correctCount = 0;
    questions.forEach((q) => {
      // Simplistic check for demo purposes
      if (Array.isArray(q.correctAnswer) && Array.isArray(q.userAnswer)) {
        if (q.correctAnswer.sort().join(',') === q.userAnswer.sort().join(',')) correctCount++;
      } else if (q.correctAnswer === q.userAnswer) {
        correctCount++;
      }
    });
    useUserStore.getState().processQuizResult(correctCount);
  };

  return (
    <QuizContext.Provider
      value={{
        currentQuestionIndex,
        setCurrentQuestionIndex,
        questions,
        setQuestions,
        questionPalette,
        updateQuestionStatus,
        timeLeft,
        setTimeLeft,
        currentSubject,
        setCurrentSubject,
        updateUserAnswer,
        toggleMarked,
        clearResponse,
        submitQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
