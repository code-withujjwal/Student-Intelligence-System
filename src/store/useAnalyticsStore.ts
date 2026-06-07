import { create } from 'zustand';
import axiosInstance from '../api/axios';

interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  quizzesCreated: number;
  quizzesAttempted: number;
  averageScore: number;
  completionRate: number;
}

interface StudentAnalytics {
  strongestSubject: string;
  weakestSubject: string;
  averageAccuracy: number;
  averageCompletionTime: number;
  quizzesAttempted: number;
}

interface TeacherAnalytics {
  totalQuizzesCreated: number;
  totalStudentsReached: number;
  averageQuizScore: number;
  hardestQuestion: string;
  easiestQuestion: string;
}

interface AnalyticsState {
  platformStats: PlatformAnalytics | null;
  studentStats: StudentAnalytics | null;
  teacherStats: TeacherAnalytics | null;
  loading: boolean;
  error: string | null;
  
  fetchPlatformAnalytics: () => Promise<void>;
  fetchStudentAnalytics: (id: number) => Promise<void>;
  fetchTeacherAnalytics: (id: number) => Promise<void>;
  downloadStudentReport: (id: number) => Promise<void>;

  // Prototype properties for ResultDetail.tsx
  activeDetailedResult: any | null;
  geminiInsights: any | null;
  insightsLoading: boolean;
  fetchGeminiInsights: (userId: string) => Promise<void>;
  clearDetailedResult: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  platformStats: null,
  studentStats: null,
  teacherStats: null,
  loading: false,
  error: null,
  activeDetailedResult: null,
  geminiInsights: null,
  insightsLoading: false,

  fetchPlatformAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get('/analytics/platform');
      set({ platformStats: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchStudentAnalytics: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/analytics/student/${id}`);
      set({ studentStats: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchTeacherAnalytics: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get(`/analytics/teacher/${id}`);
      set({ teacherStats: res.data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  downloadStudentReport: async (id: number) => {
    try {
      const response = await axiosInstance.get(`/export/pdf/student/${id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  },

  fetchGeminiInsights: async (userId: string) => {
    set({ insightsLoading: true });
    // Mock simulation
    setTimeout(() => {
      set({
        geminiInsights: {
          summary: "You are doing great but need to focus on complex data structures.",
          recommendedTopics: ["AVL Trees", "Graphs"]
        },
        insightsLoading: false
      });
    }, 1500);
  },

  clearDetailedResult: () => {
    set({ activeDetailedResult: null, geminiInsights: null });
  }
}));
