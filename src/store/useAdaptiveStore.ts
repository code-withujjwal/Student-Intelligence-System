import { create } from 'zustand';
import axiosInstance from '../api/axios';

interface AdaptiveProfile {
  studentId: number;
  weakAreas: string[];
  strongAreas: string[];
  preferredDifficulty: string;
  avgResponseTime: number;
}

interface Prediction {
  expectedScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
}

interface Recommendations {
  nextRecommendedQuiz: string;
  topicsToRevise: string[];
  difficultyUpgradeSuggestion: string;
}

interface AdaptiveState {
  profile: AdaptiveProfile | null;
  prediction: Prediction | null;
  recommendations: Recommendations | null;
  loading: boolean;
  error: string | null;

  fetchAdaptiveData: (studentId: number) => Promise<void>;
}

export const useAdaptiveStore = create<AdaptiveState>((set) => ({
  profile: null,
  prediction: null,
  recommendations: null,
  loading: false,
  error: null,

  fetchAdaptiveData: async (studentId: number) => {
    set({ loading: true, error: null });
    try {
      const [profileRes, predictionRes, recsRes] = await Promise.all([
        axiosInstance.get(`/adaptive/profile/${studentId}`),
        axiosInstance.get(`/adaptive/prediction/${studentId}`),
        axiosInstance.get(`/adaptive/recommendations/${studentId}`)
      ]);

      set({
        profile: profileRes.data,
        prediction: predictionRes.data,
        recommendations: recsRes.data,
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  }
}));
