import { apiClient } from '../lib/apiClient';
import type {
  EngineeringQuiz,
  Section,
  EngQuestion
} from '../types/projectKarl';

export const quizService = {
  async createQuiz(draft: Partial<EngineeringQuiz>): Promise<EngineeringQuiz> {
    return apiClient.post<EngineeringQuiz>('/quizzes', draft);
  },

  async updateQuiz(id: string, patch: Partial<EngineeringQuiz>): Promise<EngineeringQuiz> {
    return apiClient.put<EngineeringQuiz>(`/quizzes/${id}`, patch);
  },

  async publishQuiz(id: string): Promise<EngineeringQuiz> {
    return apiClient.post<EngineeringQuiz>(`/quizzes/${id}/publish`);
  },

  async saveDraft(id: string, patch: Partial<EngineeringQuiz>): Promise<EngineeringQuiz> {
    return apiClient.put<EngineeringQuiz>(`/quizzes/${id}/draft`, patch);
  },

  async getTeacherQuizzes(teacherId: string): Promise<EngineeringQuiz[]> {
    return apiClient.get<EngineeringQuiz[]>(`/quizzes/teacher/${teacherId}`);
  },

  async getQuizById(id: string): Promise<EngineeringQuiz> {
    return apiClient.get<EngineeringQuiz>(`/quizzes/${id}`);
  },

  async deleteQuiz(id: string): Promise<void> {
    return apiClient.del<void>(`/quizzes/${id}`);
  },

  async addSection(quizId: string, section: Partial<Section>): Promise<Section> {
    return apiClient.post<Section>(`/quizzes/${quizId}/sections`, section);
  },

  async updateSection(sectionId: string, patch: Partial<Section>): Promise<Section> {
    return apiClient.put<Section>(`/sections/${sectionId}`, patch);
  },

  async deleteSection(sectionId: string): Promise<void> {
    return apiClient.del<void>(`/sections/${sectionId}`);
  },

  async reorderSections(quizId: string, orderedIds: string[]): Promise<void> {
    return apiClient.put<void>(`/quizzes/${quizId}/sections/reorder`, { orderedIds });
  },

  async addQuestion(sectionId: string, question: Partial<EngQuestion>): Promise<EngQuestion> {
    return apiClient.post<EngQuestion>(`/sections/${sectionId}/questions`, question);
  },

  async updateQuestion(questionId: string, patch: Partial<EngQuestion>): Promise<EngQuestion> {
    return apiClient.put<EngQuestion>(`/questions/${questionId}`, patch);
  },

  async deleteQuestion(questionId: string): Promise<void> {
    return apiClient.del<void>(`/questions/${questionId}`);
  },

  async duplicateQuestion(questionId: string): Promise<EngQuestion> {
    return apiClient.post<EngQuestion>(`/questions/${questionId}/duplicate`);
  },

  async reorderQuestions(sectionId: string, orderedIds: string[]): Promise<void> {
    return apiClient.put<void>(`/sections/${sectionId}/questions/reorder`, { orderedIds });
  }
};
