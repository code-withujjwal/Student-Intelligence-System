import axiosInstance from './axios';
import { QbQuestion } from '../types/questionBank';

// Define the paginated response structure if returned by the backend
export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export const questionApi = {
  /**
   * Fetch all questions with optional filters and pagination
   */
  getAllQuestions: async (
    page: number = 0,
    size: number = 50,
    filters?: any
  ): Promise<PaginatedResponse<QbQuestion>> => {
    // Transform filters into query parameters
    const params = {
      page,
      size,
      ...filters,
    };
    
    // Defaulting to GET /questions. The backend might return standard paginated JSON
    const response = await axiosInstance.get('/questions', { params });
    
    // Depending on Spring Data REST / custom controller format, adjust parsing:
    // This assumes a standard custom response: { data: [...], totalElements: X, totalPages: Y }
    // If backend returns raw list, it should be mapped accordingly.
    // For now we assume the backend returns the custom wrapper defined in your service layer
    return response.data;
  },

  /**
   * Fetch a single question by its ID
   */
  getQuestionById: async (id: number): Promise<QbQuestion> => {
    const response = await axiosInstance.get(`/questions/${id}`);
    return response.data;
  },

  /**
   * Create a new question
   */
  createQuestion: async (payload: Partial<QbQuestion>): Promise<QbQuestion> => {
    const response = await axiosInstance.post('/questions', payload);
    return response.data;
  },

  /**
   * Update an existing question
   */
  updateQuestion: async (id: number, payload: Partial<QbQuestion>): Promise<QbQuestion> => {
    const response = await axiosInstance.put(`/questions/${id}`, payload);
    return response.data;
  },

  /**
   * Delete a question
   */
  deleteQuestion: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/questions/${id}`);
  }
};
