import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateQuestionsWithAI, generateFlashcards } from '../services/geminiService';
import type {
  Quiz,
  Question,
  Result,
  FlashCard,
  GeneratedQuestion,
  SubjectAnalytics,
  AttemptPayload,
  Subject,
  QuizMetadata,
} from '../types/projectKarl';

interface UseProjectKarlState {
  isGenerating: boolean;
  isSubmitting: boolean;
  isFetching: boolean;
  error: string | null;
}

interface GenerateResult {
  quiz: Quiz;
  questions: Question[];
  shareLink: string;
}

interface FetchQuizResult {
  quiz: Quiz;
  questions: Question[];
}

const generateNanoid = (length = 8): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
};

const buildShareUrl = (token: string): string =>
  `${window.location.origin}/quiz/share/${token}`;

const computeSubjectAnalytics = (
  questions: Question[],
  answers: Record<string, string>
): SubjectAnalytics[] => {
  const map: Record<Subject, { correct: number; total: number }> = {
    Physics: { correct: 0, total: 0 },
    Chemistry: { correct: 0, total: 0 },
    Math: { correct: 0, total: 0 },
  };

  for (const q of questions) {
    map[q.subject].total += 1;
    if (answers[q.id] === q.correct_answer) {
      map[q.subject].correct += 1;
    }
  }

  return (Object.keys(map) as Subject[])
    .filter(s => map[s].total > 0)
    .map(s => ({
      subject: s,
      correct: map[s].correct,
      total: map[s].total,
      accuracy: parseFloat((map[s].correct / map[s].total).toFixed(4)),
    }));
};

export const useProjectKarl = () => {
  const [state, setState] = useState<UseProjectKarlState>({
    isGenerating: false,
    isSubmitting: false,
    isFetching: false,
    error: null,
  });

  const setError = (msg: string) => setState(prev => ({ ...prev, error: msg }));
  const clearError = () => setState(prev => ({ ...prev, error: null }));

  const handleAIGeneration = useCallback(
    async (
      syllabus: string,
      count: number,
      teacherId: string
    ): Promise<GenerateResult | null> => {
      clearError();
      setState(prev => ({ ...prev, isGenerating: true }));

      try {
        const generated: GeneratedQuestion[] = await generateQuestionsWithAI(syllabus, count);

        const shareToken = generateNanoid(8);

        const metadata: QuizMetadata = {
          subject: 'Mixed',
          difficulty: 2,
          totalQuestions: generated.length,
          generatedAt: new Date().toISOString(),
        };

        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .insert({
            teacher_id: teacherId,
            title: `AI Quiz — ${syllabus.slice(0, 60)}`,
            metadata,
            share_token: shareToken,
          })
          .select()
          .single();

        if (quizError || !quizData) {
          throw new Error(quizError?.message ?? 'Failed to create quiz record');
        }

        const quiz = quizData as Quiz;

        const questionRows = generated.map(q => ({
          quiz_id: quiz.id,
          content: q.content,
          type: q.type,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          difficulty: 2,
          subject: q.subject,
        }));

        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .insert(questionRows)
          .select();

        if (questionsError || !questionsData) {
          throw new Error(questionsError?.message ?? 'Failed to batch insert questions');
        }

        const questions = questionsData as Question[];
        const shareLink = buildShareUrl(shareToken);

        return { quiz, questions, shareLink };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error during generation');
        return null;
      } finally {
        setState(prev => ({ ...prev, isGenerating: false }));
      }
    },
    []
  );

  const fetchQuizByToken = useCallback(
    async (token: string): Promise<FetchQuizResult | null> => {
      clearError();
      setState(prev => ({ ...prev, isFetching: true }));

      try {
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('share_token', token)
          .single();

        if (quizError || !quizData) {
          throw new Error(quizError?.message ?? 'Quiz not found for the given token');
        }

        const quiz = quizData as Quiz;

        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quiz.id);

        if (questionsError || !questionsData) {
          throw new Error(questionsError?.message ?? 'Failed to load questions');
        }

        return { quiz, questions: questionsData as Question[] };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error while fetching quiz');
        return null;
      } finally {
        setState(prev => ({ ...prev, isFetching: false }));
      }
    },
    []
  );

  const submitAttempt = useCallback(
    async (payload: AttemptPayload): Promise<Result | null> => {
      clearError();
      setState(prev => ({ ...prev, isSubmitting: true }));

      try {
        const accuracy = parseFloat(
          (payload.score / Math.max(
            payload.analytics.reduce((acc, s) => acc + s.total, 0),
            1
          )).toFixed(4)
        );

        const { data, error } = await supabase
          .from('results')
          .insert({
            user_id: payload.userId,
            quiz_id: payload.quizId,
            score: payload.score,
            accuracy,
            time_taken: payload.timeTaken,
            analytics: payload.analytics,
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message ?? 'Failed to record attempt');
        }

        return data as Result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error during submission');
        return null;
      } finally {
        setState(prev => ({ ...prev, isSubmitting: false }));
      }
    },
    []
  );

  const generateShareLink = useCallback(
    async (quizId: string): Promise<string | null> => {
      clearError();

      try {
        const token = generateNanoid(8);

        const { error } = await supabase
          .from('quizzes')
          .update({ share_token: token })
          .eq('id', quizId);

        if (error) throw new Error(error.message);

        return buildShareUrl(token);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate share link');
        return null;
      }
    },
    []
  );

  const fetchResults = useCallback(
    async (userId: string): Promise<Result[]> => {
      clearError();
      setState(prev => ({ ...prev, isFetching: true }));
      try {
        const { data, error } = await supabase
          .from('results')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        return (data ?? []) as Result[];
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
        return [];
      } finally {
        setState(prev => ({ ...prev, isFetching: false }));
      }
    },
    []
  );

  const generateWeakAreaFlashcards = useCallback(
    async (quizId: string, userId: string): Promise<FlashCard[]> => {
      clearError();
      setState(prev => ({ ...prev, isFetching: true }));
      try {
        const { data: resultData, error: resultError } = await supabase
          .from('results')
          .select('analytics')
          .eq('quiz_id', quizId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (resultError || !resultData) {
          throw new Error(resultError?.message ?? 'No result found for this quiz');
        }

        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId);

        if (questionsError || !questionsData) {
          throw new Error(questionsError?.message ?? 'Failed to load questions for flashcards');
        }

        const analytics = resultData.analytics as SubjectAnalytics[];
        const weakSubjects = analytics
          .filter(a => a.accuracy < 0.6)
          .map(a => a.subject);

        const weakQuestions = (questionsData as Question[]).filter(q =>
          weakSubjects.includes(q.subject)
        );

        return await generateFlashcards(weakQuestions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate flashcards');
        return [];
      } finally {
        setState(prev => ({ ...prev, isFetching: false }));
      }
    },
    []
  );

  return {
    ...state,
    handleAIGeneration,
    fetchQuizByToken,
    submitAttempt,
    generateShareLink,
    fetchResults,
    generateWeakAreaFlashcards,
    computeSubjectAnalytics,
  };
};
