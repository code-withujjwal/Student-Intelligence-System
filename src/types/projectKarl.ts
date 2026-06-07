export type QuestionType = 'MCQ' | 'AR';

export type Subject = 'Physics' | 'Chemistry' | 'Math';

export type Difficulty = 1 | 2 | 3;

export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  id: string;
  created_at: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
}

export interface QuizMetadata {
  subject: Subject | 'Mixed';
  difficulty: Difficulty;
  totalQuestions: number;
  generatedAt: string;
}

export interface Quiz {
  id: string;
  created_at: string;
  teacher_id: string;
  title: string;
  metadata: QuizMetadata;
  share_token: string;
  time_limit_seconds: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  content: string;
  type: QuestionType;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: Difficulty;
  subject: Subject;
  tags: string[];
  image_url: string | null;
}

export interface SubjectAnalytics {
  subject: Subject;
  correct: number;
  total: number;
  accuracy: number;
}

export interface Result {
  id: string;
  created_at: string;
  user_id: string;
  quiz_id: string;
  score: number;
  accuracy: number;
  time_taken: number;
  analytics: SubjectAnalytics[];
}

export interface GeneratedQuestion {
  subject: Subject;
  type: QuestionType;
  content: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface GenerationInput {
  syllabus: string;
  count: number;
  teacherId: string;
}

export interface ShareLink {
  token: string;
  url: string;
}

export interface AttemptPayload {
  quizId: string;
  userId: string;
  score: number;
  timeTaken: number;
  analytics: SubjectAnalytics[];
}

export interface FlashCard {
  id: string;
  questionId: string;
  subject: Subject;
  front: string;
  back: string;
  tags: string[];
}

export interface WeakAreaReport {
  subject: Subject;
  topics: string[];
  missedCount: number;
  accuracy: number;
}

export interface ResultWithQuiz extends Result {
  quiz: Pick<Quiz, 'title' | 'metadata'>;
}

export type EngSubject =
  | 'C Programming'
  | 'Data Structures'
  | 'OOP'
  | 'C++'
  | 'Java'
  | 'Python'
  | 'DBMS'
  | 'Operating Systems'
  | 'Computer Networks'
  | 'Software Engineering'
  | 'DAA'
  | 'TOC'
  | 'Compiler Design'
  | 'Web Technology'
  | 'Cloud Computing'
  | 'AI'
  | 'Machine Learning'
  | 'Cyber Security'
  | 'Computer Architecture'
  | 'Digital Electronics'
  | 'Discrete Mathematics';

export type Department =
  | 'Computer Science'
  | 'Information Technology'
  | 'Electronics'
  | 'Electrical'
  | 'Mechanical'
  | 'Civil';

export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'EXPIRED';

export type QuizVisibility = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

export type EngQuestionType =
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'SUBJECTIVE'
  | 'NUMERICAL'
  | 'ASSERTION_REASON'
  | 'MATCH_FOLLOWING'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'CODE_OUTPUT'
  | 'CODE_ERROR'
  | 'CODE_WRITING';

export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuizSettings {
  durationMinutes: number;
  startDate: string | null;
  endDate: string | null;
  visibility: QuizVisibility;
  password: string | null;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultImmediately: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface EngQuestion {
  id: string;
  repoQuestionId?: number; // Phase 6: Link to central question bank
  sectionId: string;
  text: string;
  type: EngQuestionType;
  options: QuestionOption[];
  correctOptionIds: string[];
  marks: number;
  negativeMarks: number;
  difficulty: QuizDifficulty;
  explanation: string;
  imageUrl: string | null;
}

export interface Section {
  id: string;
  quizId: string;
  title: string;
  order: number;
  questions: EngQuestion[];
}

export interface EngineeringQuiz {
  id: string;
  version?: number; // Phase 6: Quiz versioning
  teacherId: string;
  title: string;
  description: string;
  subject: EngSubject;
  department: Department;
  semester: number;
  difficulty: QuizDifficulty;
  thumbnailUrl: string | null;
  status: QuizStatus;
  settings: QuizSettings;
  sections: Section[];
  questionCount: number;
  totalMarks: number;
  createdAt: string;
  publishedAt: string | null;
}

export type AttemptAnswerStatus = 'not_visited' | 'visited' | 'answered' | 'marked' | 'answered_marked';

export interface AttemptAnswer {
  questionId: string;
  selectedOptionIds: string[];
  textAnswer: string | null;
  timeSpentSeconds: number;
  isMarkedForReview: boolean;
  status: AttemptAnswerStatus;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: AttemptAnswer[];
  startedAt: string;
  submittedAt: string | null;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  studentAnswer: string[];
  correctAnswer: string[];
  isCorrect: boolean;
  marksEarned: number;
  timeSpentSeconds: number;
  explanation: string;
}

export interface EngSubjectAnalytics {
  subject: EngSubject;
  correct: number;
  total: number;
  accuracy: number;
  avgTimeSeconds: number;
}

export interface DetailedResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTakenSeconds: number;
  rank: number | null;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  subjectBreakdown: EngSubjectAnalytics[];
  questionResults: QuestionResult[];
  weakTopics: string[];
  strongTopics: string[];
  completedAt: string;
}

export interface WeakAreaDetail {
  subject: EngSubject;
  topics: string[];
  missedCount: number;
  accuracy: number;
}

export interface StudentProgress {
  userId: string;
  totalAttempted: number;
  averageScore: number;
  averageAccuracy: number;
  totalStudyTimeSeconds: number;
  subjectPerformance: EngSubjectAnalytics[];
  weakAreas: WeakAreaDetail[];
}

export interface QuizHistoryEntry {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  subject: EngSubject;
  department: Department;
  semester: number;
  score: number;
  totalMarks: number;
  accuracy: number;
  completedAt: string;
}

export interface GeminiInsight {
  summary: string;
  improvements: string[];
  recommendedTopics: string[];
  studyPlan: string;
}

export interface QuizCard {
  id: string;
  title: string;
  subject: EngSubject;
  department: Department;
  semester: number;
  durationMinutes: number;
  questionCount: number;
  totalMarks: number;
  difficulty: QuizDifficulty;
  status: QuizStatus;
  startDate: string | null;
  endDate: string | null;
  isPasswordProtected: boolean;
  publishedAt: string | null;
}
