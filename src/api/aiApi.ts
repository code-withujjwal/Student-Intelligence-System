import axiosInstance from './axios';

export interface AiQuizRequest {
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  includeTypes: string[];
  department: string;
  semester: number;
  mode?: string;
  unit?: string;
  style?: string;
  notesText?: string;
}

export interface AiQuestionResponse {
  type: string;
  question: string;
  options: string[];
  answer: string;
  marks: number;
}

export interface AiQuizResponse {
  quizTitle: string;
  source: string;
  questions: AiQuestionResponse[];
}

export const aiApi = {
  generateQuiz: async (payload: AiQuizRequest): Promise<AiQuizResponse> => {
    const response = await axiosInstance.post('/ai/generate-quiz', payload);
    return response.data as AiQuizResponse;
  },
  generateBlueprint: async (payload: Partial<AiQuizRequest>): Promise<any> => {
    const response = await axiosInstance.post('/ai/blueprint', payload);
    return response.data;
  },
  generateQuizAndSave: async (payload: Partial<AiQuizRequest>): Promise<any> => {
    const response = await axiosInstance.post('/ai/generate-quiz', payload);
    return response.data;
  },
  pdfToQuiz: async (formData: FormData): Promise<any> => {
    const response = await axiosInstance.post('/ai/pdf-to-quiz', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  explainMistake: async (payload: { question: string; correctAnswer: string; userAnswer: string; topic?: string }) => {
    const response = await axiosInstance.post('/ai/explain-mistake', payload);
    return response.data;
  },
  getFeedback: async (profileJson: string) => {
    const response = await axiosInstance.post('/ai/feedback', { profileJson });
    return response.data;
  }
};
