import axiosInstance from './axios';

export interface QuizPayload {
  title: string;
  description?: string;
  subject?: string;
  department?: string;
  semester?: number;
  difficulty?: string;
  sections: Array<{
    title: string;
    questions: Array<{
      questionId: number;
      marks: number;
      negativeMarks: number;
    }>;
  }>;
  settings?: {
    durationMinutes: number;
    visibility: string;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResultImmediately: boolean;
    maxAttempts: number;
  };
}

export const quizApi = {
  createQuiz: async (payload: QuizPayload) => {
    const response = await axiosInstance.post('/quizzes', payload);
    return response.data;
  },
  
  getAllQuizzes: async () => {
    const response = await axiosInstance.get('/quizzes');
    return response.data;
  },

  getQuizById: async (id: number) => {
    const response = await axiosInstance.get(`/quizzes/${id}`);
    return response.data;
  }
};
