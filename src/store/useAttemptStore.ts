import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { studentService } from '../services/studentService';
import { toast } from 'sonner';
import type {
  QuizAttempt,
  AttemptAnswer,
  DetailedResult,
  EngineeringQuiz,
  Section,
  EngQuestion,
  AttemptAnswerStatus
} from '../types/projectKarl';

interface AttemptState {
  quiz: EngineeringQuiz | null;
  attempt: QuizAttempt | null;
  currentSectionIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, AttemptAnswer>;
  timeRemaining: number;
  timerActive: boolean;
  result: DetailedResult | null;
  isSubmitting: boolean;
  isLoading: boolean;
  startTime: number;
  questionStartTime: number;

  loadQuiz: (quiz: EngineeringQuiz, userId: string) => Promise<void>;
  selectOption: (questionId: string, optionId: string, isMulti: boolean) => void;
  setTextAnswer: (questionId: string, text: string) => void;
  toggleMarkForReview: (questionId: string) => void;
  clearAnswer: (questionId: string) => void;
  goToSection: (index: number) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  submitAttempt: () => Promise<DetailedResult | null>;
  resetAttempt: () => void;
}

const computeStatus = (ans: AttemptAnswer): AttemptAnswerStatus => {
  const hasAnswer = (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) || (ans.textAnswer && ans.textAnswer.trim() !== '');
  if (hasAnswer && ans.isMarkedForReview) return 'answered_marked';
  if (hasAnswer) return 'answered';
  if (ans.isMarkedForReview) return 'marked';
  return 'visited';
};

export const useAttemptStore = create<AttemptState>()(
  persist(
    (set, get) => ({
  quiz: null,
  attempt: null,
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 0,
  timerActive: false,
  result: null,
  isSubmitting: false,
  isLoading: false,
  startTime: 0,
  questionStartTime: Date.now(),

  loadQuiz: async (quiz, userId) => {
    // Check if we are resuming an existing attempt for this quiz
    const state = get();
    if (state.quiz?.id === quiz.id && state.attempt && !state.result && state.timeRemaining > 0) {
      toast.info('Restored your active attempt.');
      return;
    }

    set({ isLoading: true, quiz });
    try {
      // Create initial answers array with 'not_visited'
      const initialAnswers: Record<string, AttemptAnswer> = {};
      quiz.sections.forEach(sec => {
        sec.questions.forEach(q => {
          initialAnswers[q.id] = {
            questionId: q.id,
            selectedOptionIds: [],
            textAnswer: null,
            timeSpentSeconds: 0,
            isMarkedForReview: false,
            status: 'not_visited'
          };
        });
      });

      // Mark first question as visited
      const firstQ = quiz.sections[0]?.questions[0];
      if (firstQ) {
        initialAnswers[firstQ.id].status = 'visited';
      }

      const attempt = await studentService.startAttempt(quiz.id, userId);
      set({
        attempt,
        answers: initialAnswers,
        currentSectionIndex: 0,
        currentQuestionIndex: 0,
        timeRemaining: quiz.settings.durationMinutes * 60,
        timerActive: quiz.settings.durationMinutes > 0,
        result: null,
        startTime: Date.now(),
        questionStartTime: Date.now(),
        isLoading: false
      });
    } catch (e: unknown) {
      // MOCK FALLBACK for frontend-only
      set({ isLoading: false });
      
      const initialAnswers: Record<string, AttemptAnswer> = {};
      quiz.sections.forEach(sec => {
        sec.questions.forEach(q => {
          initialAnswers[q.id] = {
            questionId: q.id,
            selectedOptionIds: [],
            textAnswer: null,
            timeSpentSeconds: 0,
            isMarkedForReview: false,
            status: 'not_visited'
          };
        });
      });
      const firstQ = quiz.sections[0]?.questions[0];
      if (firstQ) initialAnswers[firstQ.id].status = 'visited';

      const mockAttempt: QuizAttempt = {
        id: `mock_attempt_${Date.now()}`,
        quizId: quiz.id,
        userId,
        answers: [],
        startedAt: new Date().toISOString(),
        submittedAt: null
      };

      set({
        attempt: mockAttempt,
        answers: initialAnswers,
        currentSectionIndex: 0,
        currentQuestionIndex: 0,
        timeRemaining: quiz.settings.durationMinutes * 60,
        timerActive: quiz.settings.durationMinutes > 0,
        result: null,
        startTime: Date.now(),
        questionStartTime: Date.now(),
        isLoading: false
      });
    }
  },

  selectOption: (questionId, optionId, isMulti) => {
    const { answers } = get();
    const existing = answers[questionId];
    if (!existing) return;
    const selected = existing.selectedOptionIds ?? [];
    let updated: string[];
    if (isMulti) {
      updated = selected.includes(optionId)
        ? selected.filter(id => id !== optionId)
        : [...selected, optionId];
    } else {
      updated = [optionId];
    }
    const timeSpent = existing.timeSpentSeconds + Math.round((Date.now() - get().questionStartTime) / 1000);
    const updatedAns: AttemptAnswer = {
      ...existing,
      selectedOptionIds: updated,
      timeSpentSeconds: timeSpent
    };
    updatedAns.status = computeStatus(updatedAns);

    set({
      answers: { ...answers, [questionId]: updatedAns },
      questionStartTime: Date.now()
    });
  },

  setTextAnswer: (questionId, text) => {
    const { answers } = get();
    const existing = answers[questionId];
    if (!existing) return;
    const timeSpent = existing.timeSpentSeconds + Math.round((Date.now() - get().questionStartTime) / 1000);
    const updatedAns: AttemptAnswer = {
      ...existing,
      textAnswer: text,
      timeSpentSeconds: timeSpent
    };
    updatedAns.status = computeStatus(updatedAns);

    set({
      answers: { ...answers, [questionId]: updatedAns },
      questionStartTime: Date.now()
    });
  },

  toggleMarkForReview: (questionId) => {
    const { answers } = get();
    const existing = answers[questionId];
    if (!existing) return;
    const updatedAns: AttemptAnswer = { ...existing, isMarkedForReview: !existing.isMarkedForReview };
    updatedAns.status = computeStatus(updatedAns);
    set({ answers: { ...answers, [questionId]: updatedAns } });
  },

  clearAnswer: (questionId) => {
    const { answers } = get();
    const existing = answers[questionId];
    if (!existing) return;
    const updatedAns: AttemptAnswer = { ...existing, selectedOptionIds: [], textAnswer: null };
    updatedAns.status = computeStatus(updatedAns);
    set({ answers: { ...answers, [questionId]: updatedAns } });
  },

  goToSection: (index) => {
    const { quiz, answers } = get();
    if (!quiz) return;
    const qId = quiz.sections[index]?.questions[0]?.id;
    const newAnswers = { ...answers };
    if (qId && newAnswers[qId] && newAnswers[qId].status === 'not_visited') {
      newAnswers[qId] = { ...newAnswers[qId], status: 'visited' };
    }
    set({ currentSectionIndex: index, currentQuestionIndex: 0, questionStartTime: Date.now(), answers: newAnswers });
  },

  goToQuestion: (index) => {
    const { quiz, currentSectionIndex, answers } = get();
    if (!quiz) return;
    const qId = quiz.sections[currentSectionIndex]?.questions[index]?.id;
    const newAnswers = { ...answers };
    if (qId && newAnswers[qId] && newAnswers[qId].status === 'not_visited') {
      newAnswers[qId] = { ...newAnswers[qId], status: 'visited' };
    }
    set({ currentQuestionIndex: index, questionStartTime: Date.now(), answers: newAnswers });
  },

  nextQuestion: () => {
    const { quiz, currentSectionIndex, currentQuestionIndex } = get();
    if (!quiz) return;
    const section: Section = quiz.sections[currentSectionIndex];
    if (currentQuestionIndex < section.questions.length - 1) {
      get().goToQuestion(currentQuestionIndex + 1);
    } else if (currentSectionIndex < quiz.sections.length - 1) {
      get().goToSection(currentSectionIndex + 1);
    }
  },

  prevQuestion: () => {
    const { quiz, currentSectionIndex, currentQuestionIndex } = get();
    if (!quiz) return;
    if (currentQuestionIndex > 0) {
      get().goToQuestion(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const prevSection: Section = quiz.sections[currentSectionIndex - 1];
      const newSecIdx = currentSectionIndex - 1;
      const newQIdx = prevSection.questions.length - 1;
      
      const qId = quiz.sections[newSecIdx]?.questions[newQIdx]?.id;
      const newAnswers = { ...get().answers };
      if (qId && newAnswers[qId] && newAnswers[qId].status === 'not_visited') {
        newAnswers[qId] = { ...newAnswers[qId], status: 'visited' };
      }

      set({
        currentSectionIndex: newSecIdx,
        currentQuestionIndex: newQIdx,
        questionStartTime: Date.now(),
        answers: newAnswers
      });
    }
  },

  tickTimer: () => {
    const { timeRemaining, timerActive } = get();
    if (!timerActive || timeRemaining <= 0) return;
    if (timeRemaining === 1) {
      set({ timeRemaining: 0, timerActive: false });
      get().submitAttempt();
      return;
    }
    set({ timeRemaining: timeRemaining - 1 });
  },

  submitAttempt: async () => {
    const { attempt, answers, quiz } = get();
    if (!attempt || !quiz) return null;
    set({ isSubmitting: true });
    try {
      const answerList = Object.values(answers);
      const result = await studentService.submitAttempt(attempt.id, answerList);
      set({ result, isSubmitting: false, timerActive: false });
      return result;
    } catch (e: unknown) {
      set({ isSubmitting: false, timerActive: false });
      toast.success('Test Submitted Successfully (Mock)');
      
      const mockResult: DetailedResult = {
        attemptId: attempt.id,
        quizId: quiz.id,
        quizTitle: quiz.title,
        userId: attempt.userId,
        score: 0,
        totalMarks: quiz.totalMarks,
        accuracy: 0,
        timeTakenSeconds: quiz.settings.durationMinutes * 60 - get().timeRemaining,
        rank: null,
        correctCount: 0,
        incorrectCount: 0,
        skippedCount: 0,
        subjectBreakdown: [],
        questionResults: [],
        weakTopics: [],
        strongTopics: [],
        completedAt: new Date().toISOString()
      };
      
      set({ result: mockResult });
      return mockResult;
    }
  },

  resetAttempt: () => {
    set({
      quiz: null,
      attempt: null,
      answers: {},
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      timeRemaining: 0,
      timerActive: false,
      result: null,
      isSubmitting: false,
      isLoading: false
    });
  }
}),
  {
    name: 'karl-quiz-attempt-v2',
    partialize: (state) => ({
      quiz: state.quiz,
      attempt: state.attempt,
      currentSectionIndex: state.currentSectionIndex,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      timeRemaining: state.timeRemaining,
      timerActive: state.timerActive,
      result: state.result,
      startTime: state.startTime,
      questionStartTime: state.questionStartTime
    })
  }
)
);

export const getCurrentQuestion = (state: AttemptState): EngQuestion | null => {
  if (!state.quiz) return null;
  const section = state.quiz.sections[state.currentSectionIndex];
  if (!section) return null;
  return section.questions[state.currentQuestionIndex] ?? null;
};
