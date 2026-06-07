import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { geminiClient } from '../services/geminiClient';
import { studentService } from '../services/studentService';
import { toast } from 'sonner';
import type { QuizCard } from '../types/projectKarl';

interface FeaturesState {
  loading: boolean;
  activeQuiz: any | null;
  quizCategories: any[];
  userProgress: any | null;
  publishedQuizzes: QuizCard[];
  fetchQuizData: () => Promise<void>;
  fetchUserProgress: () => Promise<void>;
  generateAIQuiz: (topic: string) => Promise<void>;
  generateAIAnalysis: () => Promise<void>;

  fetchProfile: () => Promise<void>;
  createAdminQuiz: (title: string) => Promise<void>;
  fetchPublishedQuizzes: () => Promise<void>;
}

export const useFeaturesStore = create<FeaturesState>((set, get) => ({
  loading: false,
  activeQuiz: null,
  quizCategories: [],
  userProgress: null,
  publishedQuizzes: [],

  fetchQuizData: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('quizzes').select('*').limit(5);
      if (error) throw error;
      set({ quizCategories: data });
      toast.success('Core Systems: Quiz data synchronized.');
    } catch (error: any) {
      toast.error(`Fetch error: ${error.message}`);
    } finally {
      set({ loading: false });
    }
  },

  fetchUserProgress: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('quiz_attempts').select('*');
      if (error) throw error;
      set({ userProgress: data });
      toast.success(`Progress Tracker: Retrieved ${data?.length || 0} attempt records.`);
    } catch (error: any) {
      toast.error(`Fetch error: ${error.message}`);
    } finally {
      set({ loading: false });
    }
  },

  generateAIQuiz: async (topic: string) => {
    set({ loading: true });
    const loadToast = toast.loading(`Generating AI Quiz for: ${topic}...`);
    try {
      const prompt = `Generate a JSON object containing a technical quiz about ${topic}. Format: {"title": "${topic} Challenge", "category": "${topic}", "difficulty": "hard", "time_limit_secs": 600, "questions": [{"question_text": "...", "options": ["A", "B", "C", "D"], "correct_option_idx": 0}]}. Generate exactly 2 questions. Only output the raw JSON.`;
      
      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      const responseText = response.text?.replace(/```json/gi, '').replace(/```/g, '').trim() || '{}';
      const parsed = JSON.parse(responseText);

      // Insert Quiz
      const { data: quizData, error: quizError } = await supabase.from('quizzes').insert([{
        title: parsed.title,
        category: parsed.category,
        difficulty: parsed.difficulty,
        time_limit_secs: parsed.time_limit_secs
      }]).select().single();

      if (quizError) throw quizError;

      // Insert Questions
      if (parsed.questions && parsed.questions.length > 0) {
        const qs = parsed.questions.map((q: any) => ({
          quiz_id: quizData.id,
          question_text: q.question_text,
          options: q.options,
          correct_option_idx: q.correct_option_idx
        }));

        const { error: qError } = await supabase.from('questions').insert(qs);
        if (qError) throw qError;
      }

      toast.success('Neural Intelligence: AI Quiz successfully compiled and injected.', { id: loadToast });
    } catch (error: any) {
      toast.error(`Generation failed: ${error.message}`, { id: loadToast });
    } finally {
      set({ loading: false });
    }
  },

  generateAIAnalysis: async () => {
    set({ loading: true });
    const loadToast = toast.loading(`Analyzing tactical performance...`);
    try {
      const { data, error } = await supabase.from('quiz_attempts').select('*').limit(5);
      if (error) throw error;
      
      const prompt = `You are a tactical AI coach. Analyze this brief performance data and give a 1-sentence recommendation: ${JSON.stringify(data || [])}`;
      
      const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      
      toast.success(`AI Analysis: ${response.text}`, { id: loadToast, duration: 6000 });
    } catch (error: any) {
      toast.error(`Analysis failed: ${error.message}`, { id: loadToast });
    } finally {
      set({ loading: false });
    }
  },

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      if (error) throw error;
      toast.success(`Profile Data: Retrieved session identity for Operative.`);
    } catch (error: any) {
      toast.error(`Fetch error: ${error.message}`);
    } finally {
      set({ loading: false });
    }
  },

  createAdminQuiz: async (title: string) => {
    set({ loading: true });
    try {
      const { error } = await supabase.from('quizzes').insert([{
        title: title,
        category: 'Admin Generated',
        difficulty: 'medium',
        time_limit_secs: 1200
      }]);
      if (error) throw error;
      toast.success(`Protocol Control: Data node "${title}" securely constructed.`);
    } catch (error: any) {
      toast.error(`Mutation error: ${error.message}`);
    } finally {
      set({ loading: false });
    }
  },

  fetchPublishedQuizzes: async () => {
    set({ loading: true });
    try {
      const quizzes = await studentService.getPublishedQuizzes();
      set({ publishedQuizzes: quizzes, loading: false });
    } catch (error: any) {
      toast.error(`Failed to load quizzes: ${error.message}`);
      set({ loading: false });
    }
  }
}));
