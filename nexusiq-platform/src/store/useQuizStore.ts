'use client';

import { create } from 'zustand';

export interface QuizQuestion {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string | string[];
  explanation?: string;
  subject?: string;
  topic?: string;
  difficulty: string;
  points: number;
  negativePoints: number;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  subject: string;
  topic?: string;
  difficulty: string;
  duration: number; // seconds
  isAIGen: boolean;
  questions: QuizQuestion[];
  _count?: { attempts: number };
}

export type AnswerMap = Record<string, string | string[] | null>; // questionId -> answer

interface QuizState {
  // Current quiz session
  quiz: Quiz | null;
  attemptId: string | null;
  answers: AnswerMap;
  timeLeft: number; // seconds
  currentIndex: number;
  status: 'idle' | 'active' | 'submitting' | 'completed';
  results: any | null;

  // Actions
  startQuiz: (quiz: Quiz, attemptId: string) => void;
  setAnswer: (questionId: string, answer: string | string[] | null) => void;
  setCurrentIndex: (index: number) => void;
  tick: () => void; // called every second by timer
  submitQuiz: (token: string) => Promise<void>;
  reset: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const useQuizStore = create<QuizState>((set, get) => ({
  quiz: null,
  attemptId: null,
  answers: {},
  timeLeft: 0,
  currentIndex: 0,
  status: 'idle',
  results: null,

  startQuiz: (quiz, attemptId) =>
    set({
      quiz,
      attemptId,
      answers: {},
      timeLeft: quiz.duration,
      currentIndex: 0,
      status: 'active',
      results: null,
    }),

  setAnswer: (questionId, answer) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: answer } })),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  tick: () => {
    const { timeLeft, status } = get();
    if (status !== 'active') return;
    if (timeLeft <= 1) {
      // Time's up — auto submit
      get().submitQuiz('');
    } else {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  submitQuiz: async (token) => {
    const { quiz, attemptId, answers } = get();
    if (!quiz || !attemptId) return;
    set({ status: 'submitting' });

    try {
      // Submit all answers
      for (const [questionId, userAnswer] of Object.entries(answers)) {
        await fetch(`${API}/attempts/${attemptId}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questionId, userAnswer }),
        });
      }

      // Complete attempt
      const res = await fetch(`${API}/attempts/${attemptId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      set({ status: 'completed', results: json.data ?? json });
    } catch {
      set({ status: 'active' }); // rollback on failure
    }
  },

  reset: () =>
    set({
      quiz: null,
      attemptId: null,
      answers: {},
      timeLeft: 0,
      currentIndex: 0,
      status: 'idle',
      results: null,
    }),
}));
