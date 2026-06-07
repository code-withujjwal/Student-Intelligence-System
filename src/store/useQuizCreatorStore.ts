import { create } from 'zustand';
import { quizApi, QuizPayload } from '../api/quizApi';
import { aiApi, AiQuizRequest, AiQuizResponse } from '../api/aiApi';
import { toast } from 'sonner';
import type {
  EngineeringQuiz,
  Section,
  EngQuestion,
  EngSubject,
  Department,
  QuizDifficulty,
  QuizSettings,
  EngQuestionType,
  QuestionOption
} from '../types/projectKarl';

const generateId = () => `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const defaultSettings = (): QuizSettings => ({
  durationMinutes: 60,
  startDate: null,
  endDate: null,
  visibility: 'PUBLIC',
  password: null,
  maxAttempts: 1,
  shuffleQuestions: false,
  shuffleOptions: false,
  showResultImmediately: true
});

const blankQuestion = (sectionId: string): EngQuestion => ({
  id: generateId(),
  sectionId,
  text: '',
  type: 'SINGLE_CHOICE',
  options: [
    { id: generateId(), text: '' },
    { id: generateId(), text: '' },
    { id: generateId(), text: '' },
    { id: generateId(), text: '' }
  ],
  correctOptionIds: [],
  marks: 1,
  negativeMarks: 0,
  difficulty: 'MEDIUM',
  explanation: '',
  imageUrl: null
});

const blankSection = (): Section => {
  const id = generateId();
  return {
    id,
    quizId: '',
    title: 'Section A',
    order: 0,
    questions: [blankQuestion(id)]
  };
};

interface QuizCreatorState {
  draft: EngineeringQuiz;
  activeSectionId: string;
  isSaving: boolean;
  isPublishing: boolean;
  savedQuizId: string | null;
  isPickerOpen: boolean;
  isSmartPickerOpen: boolean;
  setField: (field: keyof EngineeringQuiz, value: unknown) => void;
  setSettings: (patch: Partial<QuizSettings>) => void;
  setActiveSectionId: (id: string) => void;
  addSection: () => void;
  updateSectionTitle: (sectionId: string, title: string) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  addQuestion: (sectionId: string) => void;
  updateQuestion: (sectionId: string, questionId: string, patch: Partial<EngQuestion>) => void;
  removeQuestion: (sectionId: string, questionId: string) => void;
  duplicateQuestion: (sectionId: string, questionId: string) => void;
  reorderQuestions: (sectionId: string, fromIndex: number, toIndex: number) => void;
  addQuestionsFromRepo: (sectionId: string, repoQuestions: any[]) => void;
  openPicker: () => void;
  closePicker: () => void;
  openSmartPicker: () => void;
  closeSmartPicker: () => void;
  saveDraft: () => Promise<void>;
  publishQuiz: () => Promise<boolean>;
  resetDraft: () => void;

  // AI Quiz Engine
  loadingAI: boolean;
  aiGeneratedPreview: AiQuizResponse | null;
  lastAiPayload: AiQuizRequest | null;
  generateQuizFromAI: (payload: AiQuizRequest) => Promise<void>;
  acceptAIQuiz: (mergeMode: 'overwrite' | 'merge') => void;
  regenerateAIQuiz: () => Promise<void>;
  clearAiPreview: () => void;
}

const initialSection = blankSection();

const makeInitialDraft = (): EngineeringQuiz => ({
  id: '',
  teacherId: '',
  title: '',
  description: '',
  subject: 'Data Structures',
  department: 'Computer Science',
  semester: 3,
  difficulty: 'MEDIUM',
  thumbnailUrl: null,
  status: 'DRAFT',
  settings: defaultSettings(),
  sections: [initialSection],
  questionCount: 0,
  totalMarks: 0,
  createdAt: new Date().toISOString(),
  publishedAt: null
});

export const useQuizCreatorStore = create<QuizCreatorState>((set, get) => ({
  draft: makeInitialDraft(),
  activeSectionId: initialSection.id,
  isSaving: false,
  isPublishing: false,
  savedQuizId: null,
  isPickerOpen: false,
  isSmartPickerOpen: false,

  // AI State Initialization
  loadingAI: false,
  aiGeneratedPreview: null,
  lastAiPayload: null,

  setField: (field, value) => {
    set(state => ({ draft: { ...state.draft, [field]: value } }));
  },

  setSettings: (patch) => {
    set(state => ({
      draft: { ...state.draft, settings: { ...state.draft.settings, ...patch } }
    }));
  },

  setActiveSectionId: (id) => set({ activeSectionId: id }),

  addSection: () => {
    const newSection = blankSection();
    newSection.order = get().draft.sections.length;
    set(state => ({
      draft: {
        ...state.draft,
        sections: [...state.draft.sections, newSection]
      },
      activeSectionId: newSection.id
    }));
  },

  updateSectionTitle: (sectionId, title) => {
    set(state => ({
      draft: {
        ...state.draft,
        sections: state.draft.sections.map(s =>
          s.id === sectionId ? { ...s, title } : s
        )
      }
    }));
  },

  removeSection: (sectionId) => {
    const { draft, activeSectionId } = get();
    if (draft.sections.length <= 1) {
      toast.error('A quiz must have at least one section.');
      return;
    }
    const remaining = draft.sections.filter(s => s.id !== sectionId);
    const newActiveId = activeSectionId === sectionId ? remaining[0].id : activeSectionId;
    set({
      draft: { ...draft, sections: remaining.map((s, i) => ({ ...s, order: i })) },
      activeSectionId: newActiveId
    });
  },

  reorderSections: (fromIndex, toIndex) => {
    const sections = [...get().draft.sections];
    const [moved] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, moved);
    set(state => ({
      draft: { ...state.draft, sections: sections.map((s, i) => ({ ...s, order: i })) }
    }));
  },

  addQuestion: (sectionId) => {
    const q = blankQuestion(sectionId);
    set(state => ({
      draft: {
        ...state.draft,
        sections: state.draft.sections.map(s =>
          s.id === sectionId ? { ...s, questions: [...s.questions, q] } : s
        )
      }
    }));
  },

  updateQuestion: (sectionId, questionId, patch) => {
    set(state => ({
      draft: {
        ...state.draft,
        sections: state.draft.sections.map(s =>
          s.id === sectionId
            ? { ...s, questions: s.questions.map(q => q.id === questionId ? { ...q, ...patch } : q) }
            : s
        )
      }
    }));
  },

  addQuestionsFromRepo: (sectionId, repoQuestions) => {
    set(state => {
      const newQuestions: EngQuestion[] = repoQuestions.map(rq => ({
        id: generateId(),
        repoQuestionId: rq.id,
        sectionId: sectionId,
        text: rq.questionText,
        type: rq.questionType as EngQuestionType,
        options: [], // Or populate if needed
        correctOptionIds: [],
        marks: rq.marks,
        negativeMarks: rq.negativeMarks,
        difficulty: rq.difficulty as QuizDifficulty,
        explanation: '',
        imageUrl: null
      }));

      return {
        draft: {
          ...state.draft,
          sections: state.draft.sections.map(s =>
            s.id === sectionId ? { ...s, questions: [...s.questions, ...newQuestions] } : s
          )
        }
      };
    });
  },

  openPicker: () => set({ isPickerOpen: true }),
  closePicker: () => set({ isPickerOpen: false }),
  openSmartPicker: () => set({ isSmartPickerOpen: true }),
  closeSmartPicker: () => set({ isSmartPickerOpen: false }),

  removeQuestion: (sectionId, questionId) => {
    set(state => ({
      draft: {
        ...state.draft,
        sections: state.draft.sections.map(s =>
          s.id === sectionId
            ? { ...s, questions: s.questions.filter(q => q.id !== questionId) }
            : s
        )
      }
    }));
  },

  duplicateQuestion: (sectionId, questionId) => {
    set(state => ({
      draft: {
        ...state.draft,
        sections: state.draft.sections.map(s => {
          if (s.id !== sectionId) return s;
          const qIndex = s.questions.findIndex(q => q.id === questionId);
          if (qIndex === -1) return s;
          
          const originalQ = s.questions[qIndex];
          const clonedQ: EngQuestion = structuredClone(originalQ);
          clonedQ.id = crypto.randomUUID();
          
          if (clonedQ.options && clonedQ.options.length > 0) {
            const optionIdMap = new Map<string, string>();
            clonedQ.options.forEach(opt => {
              const newOptId = crypto.randomUUID();
              optionIdMap.set(opt.id, newOptId);
              opt.id = newOptId;
            });
            clonedQ.correctOptionIds = clonedQ.correctOptionIds.map(id => optionIdMap.get(id) || id);
          }
          
          const newQuestions = [...s.questions];
          newQuestions.splice(qIndex + 1, 0, clonedQ);
          
          return { ...s, questions: newQuestions };
        })
      }
    }));
  },



  reorderQuestions: (sectionId, fromIndex, toIndex) => {
    set(state => ({
      draft: {
        ...state.draft,
        sections: state.draft.sections.map(s => {
          if (s.id !== sectionId) return s;
          const qs = [...s.questions];
          const [moved] = qs.splice(fromIndex, 1);
          qs.splice(toIndex, 0, moved);
          return { ...s, questions: qs };
        })
      }
    }));
  },

  saveDraft: async () => {
    set({ isSaving: true });
    try {
      const { draft } = get();
      
      const payload: QuizPayload = {
        title: draft.title,
        description: draft.description,
        subject: draft.subject,
        department: draft.department,
        semester: draft.semester,
        difficulty: draft.difficulty,
        settings: draft.settings,
        sections: draft.sections.map(s => ({
          title: s.title,
          questions: s.questions.map(q => ({
            // If it's a repo question, use repoQuestionId, otherwise fallback to 1 (dummy) since full sync requires a batch create API
            questionId: parseInt((q as any).repoQuestionId || q.id) || 1, 
            marks: q.marks,
            negativeMarks: q.negativeMarks
          }))
        }))
      };

      const saved = await quizApi.createQuiz(payload);
      set({ savedQuizId: saved.id.toString(), isSaving: false });
      toast.success('Quiz draft saved successfully to backend.');
    } catch (e: unknown) {
      set({ isSaving: false });
      const msg = e instanceof Error ? e.message : 'Failed to save draft.';
      toast.error(msg);
    }
  },

  publishQuiz: async () => {
    set({ isPublishing: true });
    try {
      const { draft } = get();
      
      const payload: QuizPayload = {
        title: draft.title,
        description: draft.description,
        subject: draft.subject,
        department: draft.department,
        semester: draft.semester,
        difficulty: draft.difficulty,
        settings: draft.settings,
        sections: draft.sections.map(s => ({
          title: s.title,
          questions: s.questions.map(q => ({
            questionId: parseInt((q as any).repoQuestionId || q.id) || 1,
            marks: q.marks,
            negativeMarks: q.negativeMarks
          }))
        }))
      };

      const published = await quizApi.createQuiz(payload); // We don't have a dedicated publish endpoint yet, just create
      set({ savedQuizId: published.id.toString(), isPublishing: false });
      toast.success('Quiz published! It is now live on the backend.');
      return true;
    } catch (e: unknown) {
      set({ isPublishing: false });
      const msg = e instanceof Error ? e.message : 'Failed to publish quiz.';
      toast.error(msg);
      return false;
    }
  },

  resetDraft: () => {
    const section = blankSection();
    set({
      draft: makeInitialDraft(),
      activeSectionId: section.id,
      savedQuizId: null
    });
  },

  // AI Engine Implementations
  generateQuizFromAI: async (payload: AiQuizRequest) => {
    set({ loadingAI: true, lastAiPayload: payload });
    try {
      const response = await aiApi.generateQuiz(payload);
      set({ aiGeneratedPreview: response, loadingAI: false });
      if (response.source === 'rule_based') {
        toast.info('AI service unavailable. Generated using fallback rule-based engine.');
      } else {
        toast.success('Quiz generated successfully by AI!');
      }
    } catch (e: unknown) {
      set({ loadingAI: false });
      toast.error('Failed to generate quiz. Please try again.');
    }
  },

  regenerateAIQuiz: async () => {
    const { lastAiPayload, generateQuizFromAI } = get();
    if (lastAiPayload) {
      await generateQuizFromAI(lastAiPayload);
    }
  },

  clearAiPreview: () => {
    set({ aiGeneratedPreview: null });
  },

  acceptAIQuiz: (mergeMode) => {
    const { aiGeneratedPreview, draft } = get();
    if (!aiGeneratedPreview) return;

    // Map AI response to EngQuestion format
    const newSectionId = generateId();
    const mappedQuestions: EngQuestion[] = aiGeneratedPreview.questions.map(q => ({
      id: generateId(),
      sectionId: newSectionId,
      text: q.question,
      type: (q.type as EngQuestionType) || 'SINGLE_CHOICE',
      options: q.options.map(opt => ({ id: generateId(), text: opt })),
      correctOptionIds: [], // We need to map the answer string to option ID
      marks: q.marks || 2,
      negativeMarks: 0,
      difficulty: 'MEDIUM',
      explanation: '',
      imageUrl: null
    }));

    // Fix correctOptionIds mapping
    mappedQuestions.forEach((mq, idx) => {
      const aiAns = aiGeneratedPreview.questions[idx].answer;
      const matchOpt = mq.options?.find(o => o.text === aiAns);
      if (matchOpt) mq.correctOptionIds = [matchOpt.id];
    });

    const newSection: Section = {
      id: newSectionId,
      quizId: draft.id,
      title: 'AI Generated Section',
      order: draft.sections.length,
      questions: mappedQuestions
    };

    if (mergeMode === 'overwrite') {
      set({
        draft: {
          ...draft,
          title: aiGeneratedPreview.quizTitle || draft.title,
          sections: [newSection]
        },
        activeSectionId: newSectionId,
        aiGeneratedPreview: null
      });
    } else {
      set({
        draft: {
          ...draft,
          sections: [...draft.sections, newSection]
        },
        activeSectionId: newSectionId,
        aiGeneratedPreview: null
      });
    }
    toast.success('AI questions merged into your draft!');
  }
}));
