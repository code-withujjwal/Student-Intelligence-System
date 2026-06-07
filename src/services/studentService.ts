import { apiClient } from '../lib/apiClient';
import type {
  QuizCard,
  QuizAttempt,
  AttemptAnswer,
  DetailedResult,
  QuizHistoryEntry,
  StudentProgress,
  EngSubject,
  Department
} from '../types/projectKarl';

export interface QuizListFilters {
  subject?: EngSubject;
  department?: Department;
  semester?: number;
  search?: string;
}

export const studentService = {
  async getPublishedQuizzes(filters: QuizListFilters = {}): Promise<QuizCard[]> {
    const params = new URLSearchParams();
    if (filters.subject) params.set('subject', filters.subject);
    if (filters.department) params.set('department', filters.department);
    if (filters.semester) params.set('semester', String(filters.semester));
    if (filters.search) params.set('search', filters.search);
    const qs = params.toString();
    return apiClient.get<QuizCard[]>(`/quizzes/published${qs ? `?${qs}` : ''}`);
  },

  async validateAccess(quizId: string, password?: string): Promise<{ allowed: boolean; reason?: string }> {
    return apiClient.post<{ allowed: boolean; reason?: string }>(
      `/quizzes/${quizId}/validate-access`,
      { password: password ?? null }
    );
  },

  async startAttempt(quizId: string, userId: string): Promise<QuizAttempt> {
    return apiClient.post<QuizAttempt>('/attempts', { quizId, userId });
  },

  async submitAttempt(attemptId: string, answers: AttemptAnswer[]): Promise<DetailedResult> {
    return apiClient.put<DetailedResult>(`/attempts/${attemptId}/submit`, { answers });
  },

  async getAttemptHistory(userId: string): Promise<QuizHistoryEntry[]> {
    return apiClient.get<QuizHistoryEntry[]>(`/students/${userId}/history`);
  },

  async getDetailedResult(attemptId: string): Promise<DetailedResult> {
    return apiClient.get<DetailedResult>(`/attempts/${attemptId}/result`);
  },

  async getStudentProgress(userId: string): Promise<StudentProgress> {
    return apiClient.get<StudentProgress>(`/students/${userId}/progress`);
  },

  async getAttemptsByQuiz(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return apiClient.get<QuizAttempt[]>(`/students/${userId}/attempts?quizId=${quizId}`);
  }
};
