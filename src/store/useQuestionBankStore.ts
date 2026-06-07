import { create } from 'zustand';
import { questionApi } from '../api/questionApi';
import type { 
  QbQuestion, 
  QbDashboardStats, 
  QbFilters 
} from '../types/questionBank';

interface QuestionBankState {
  questions: QbQuestion[];
  stats: QbDashboardStats | null;
  filters: QbFilters;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;

  // Editor State
  isEditorOpen: boolean;
  editingQuestion: QbQuestion | null;

  // Import Wizard State
  isImportWizardOpen: boolean;
  isOcrWizardOpen: boolean;
  importHistory: any[];

  // Review Panel State
  isReviewPanelOpen: boolean;
  reviewingQuestion: QbQuestion | null;

  // Actions
  setFilters: (filters: Partial<QbFilters>) => void;
  setPage: (page: number) => void;
  fetchQuestions: () => Promise<void>;
  fetchStats: () => Promise<void>;
  
  openEditor: (question?: QbQuestion) => void;
  closeEditor: () => void;
  addQuestion: (question: Omit<QbQuestion, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateQuestion: (id: number, updates: Partial<QbQuestion>) => Promise<void>;

  openImportWizard: () => void;
  closeImportWizard: () => void;
  openOcrWizard: () => void;
  closeOcrWizard: () => void;
  bulkAddQuestions: (questions: Omit<QbQuestion, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>[], log: any) => Promise<void>;

  openReviewPanel: (question: QbQuestion) => void;
  closeReviewPanel: () => void;
  transitionQuestionStatus: (id: number, status: QbStatus, notes: string, user?: string, rejectionReason?: string) => Promise<void>;
}

export const useQuestionBankStore = create<QuestionBankState>((set, get) => ({
  questions: [],
  stats: null,
  filters: {},
  currentPage: 1,
  pageSize: 50,
  totalPages: 1,
  totalElements: 0,
  loading: false,
  statsLoading: false,
  error: null,
  isEditorOpen: false,
  editingQuestion: null,
  isImportWizardOpen: false,
  isOcrWizardOpen: false,
  importHistory: [],
  isReviewPanelOpen: false,
  reviewingQuestion: null,

  setFilters: (newFilters) => {
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters },
      currentPage: 1 // Reset to first page when filters change
    }));
    get().fetchQuestions();
  },

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchQuestions();
  },

  fetchQuestions: async () => {
    const { currentPage, pageSize, filters } = get();
    set({ loading: true, error: null });
    try {
      const response = await questionApi.getAllQuestions(currentPage > 0 ? currentPage - 1 : 0, pageSize, filters);
      set({
        questions: response.data,
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        loading: false
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch questions';
      set({ error: msg, loading: false });
    }
  },

  fetchStats: async () => {
    set({ statsLoading: true, error: null });
    try {
      // Stub stats API call if it doesn't exist, falling back to dummy stats or actual implementation if present
      // const stats = await questionApi.getStats();
      // set({ stats, statsLoading: false });
      set({ statsLoading: false }); // Mocking finish
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch stats';
      set({ error: msg, statsLoading: false });
    }
  },

  openEditor: (question) => {
    set({ isEditorOpen: true, editingQuestion: question || null });
  },

  closeEditor: () => {
    set({ isEditorOpen: false, editingQuestion: null });
  },

  addQuestion: async (question) => {
    try {
      await questionApi.createQuestion(question);
      await get().fetchQuestions();
      await get().fetchStats();
      get().closeEditor();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add question';
      set({ error: msg });
    }
  },

  updateQuestion: async (id, updates) => {
    try {
      await questionApi.updateQuestion(id, updates);
      await get().fetchQuestions();
      await get().fetchStats();
      get().closeEditor();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update question';
      set({ error: msg });
    }
  },

  openImportWizard: () => set({ isImportWizardOpen: true }),
  closeImportWizard: () => set({ isImportWizardOpen: false }),
  openOcrWizard: () => set({ isOcrWizardOpen: true }),
  closeOcrWizard: () => set({ isOcrWizardOpen: false }),

  bulkAddQuestions: async (questions, log) => {
    try {
      // Loop over and create iteratively (as bulk endpoint is missing in phase 1)
      for (const q of questions) {
        await questionApi.createQuestion(q);
      }
      
      const historyEntry = {
        ...log,
        importDate: new Date().toISOString()
      };

      set(state => ({ importHistory: [historyEntry, ...state.importHistory] }));
      await get().fetchQuestions();
      await get().fetchStats();
      get().closeImportWizard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to bulk import questions';
      set({ error: msg });
    }
  },

  openReviewPanel: (question) => set({ isReviewPanelOpen: true, reviewingQuestion: question }),
  closeReviewPanel: () => set({ isReviewPanelOpen: false, reviewingQuestion: null }),

  transitionQuestionStatus: async (id, status, notes, user, rejectionReason) => {
    try {
      // We don't have a dedicated status transition endpoint, so we use full update
      await questionApi.updateQuestion(id, { status } as Partial<import('../types/questionBank').QbQuestion>);
      await get().fetchQuestions();
      await get().fetchStats();
      
      const { reviewingQuestion } = get();
      if (reviewingQuestion && reviewingQuestion.id === id) {
        get().closeReviewPanel();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to transition status';
      set({ error: msg });
    }
  }
}));
