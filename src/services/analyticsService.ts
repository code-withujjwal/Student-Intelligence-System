import { apiClient } from '../lib/apiClient';
import type {
  StudentProgress,
  EngSubjectAnalytics,
  WeakAreaDetail,
  GeminiInsight
} from '../types/projectKarl';

export const analyticsService = {
  async getProgressSummary(userId: string): Promise<StudentProgress> {
    return apiClient.get<StudentProgress>(`/students/${userId}/progress`);
  },

  async getSubjectBreakdown(userId: string): Promise<EngSubjectAnalytics[]> {
    return apiClient.get<EngSubjectAnalytics[]>(`/analytics/${userId}/subjects`);
  },

  async getWeakAreas(userId: string): Promise<WeakAreaDetail[]> {
    return apiClient.get<WeakAreaDetail[]>(`/analytics/${userId}/weak-areas`);
  },

  async getGeminiInsights(userId: string): Promise<GeminiInsight> {
    return apiClient.post<GeminiInsight>('/analytics/gemini-insights', { userId });
  },

  async getClassAnalytics(quizId: string): Promise<{
    totalAttempts: number;
    averageScore: number;
    averageAccuracy: number;
    passRate: number;
    subjectBreakdown: EngSubjectAnalytics[];
  }> {
    return apiClient.get(`/analytics/quiz/${quizId}/class`);
  }
};
