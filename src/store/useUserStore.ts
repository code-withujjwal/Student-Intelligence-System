import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

interface MasteryRadar {
  Physics: number;
  Chemistry: number;
  Math: number;
}

interface GamificationData {
  xp: number;
  level: number;
  streak: number;
  achievements: string[];
}

interface NeuralReport {
  masteryRadar: MasteryRadar;
  progressVector: number;
  latestAccuracy: number;
  totalAttempts: number;
  gamification: GamificationData;
}

interface MistakeLog {
  attemptId: string;
  completedAt: string;
  topic: string;
  subject: string;
  question: {
    _id: string;
    text: string;
    explanation: string;
    options: string[];
    correctAnswerIndex: number;
    tags: string[];
  };
}

interface UserState {
  neuralReport: NeuralReport | null;
  mistakes: MistakeLog[];

  loading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
  fetchMistakes: () => Promise<void>;

  processQuizResult: (correctAnswers: number) => void;
  checkLoginStreak: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  neuralReport: null,
  mistakes: [],
  loading: false,
  error: null,
  
  fetchAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*');
        
      if (error) throw error;
      
      const totalAttempts = data ? data.length : 0;
      const report: NeuralReport = {
        masteryRadar: { Physics: 80, Chemistry: 70, Math: 90 },
        progressVector: 5,
        latestAccuracy: 85,
        totalAttempts: totalAttempts,
        gamification: { xp: 850, level: 1, streak: 3, achievements: ['Rookie'] }
      };
      
      set({ neuralReport: report, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMistakes: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('mistakes')
        .select('*');
        
      if (error) throw error;
      set({ mistakes: data || [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  checkLoginStreak: () => {
    set((state) => {
      if (!state.neuralReport) return state;
      const g = { ...state.neuralReport.gamification };
      
      const lastActiveStr = localStorage.getItem('lastActive');
      const now = Date.now();
      
      if (lastActiveStr) {
        const lastActive = parseInt(lastActiveStr, 10);
        const diffHours = (now - lastActive) / (1000 * 60 * 60);
        
        if (diffHours < 24) {
          // Already logged in today, do nothing or keep streak
        } else if (diffHours >= 24 && diffHours <= 48) {
          g.streak += 1;
        } else if (diffHours > 48) {
          g.streak = 0;
        }
      } else {
        g.streak += 1; // First time
      }
      
      localStorage.setItem('lastActive', now.toString());
      if (g.streak === 5) localStorage.setItem('streakHit', 'true');

      return {
        neuralReport: {
          ...state.neuralReport,
          gamification: g
        }
      };
    });
  },

  processQuizResult: (correctAnswers: number) => {
    set((state) => {
      if (!state.neuralReport) return state;
      const g = { ...state.neuralReport.gamification };
      
      let earned = (correctAnswers * 10) + 50;
      const oldLevel = g.level;
      
      g.xp += earned;
      g.level = Math.floor(g.xp / 1000) + 1;
      
      if (g.level > oldLevel || g.xp >= 1000) {
        localStorage.setItem('leveledUp', 'true');
      }

      return {
        neuralReport: {
          ...state.neuralReport,
          gamification: g
        }
      };
    });
  }
}));
