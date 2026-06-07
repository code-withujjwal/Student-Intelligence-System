// Master Question Bank Types

export type QbStatus = 
  | 'DRAFT' 
  | 'PENDING_REVIEW' 
  | 'UNDER_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED' 
  | 'PUBLISHED'
  | 'REJECTED' 
  | 'ARCHIVED';

export type QbQuestionType = 
  | 'SINGLE_CHOICE'
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'ASSERTION_REASON'
  | 'MATCH_THE_FOLLOWING'
  | 'FILL_IN_THE_BLANK'
  | 'NUMERICAL'
  | 'THEORY'
  | 'SHORT_ANSWER'
  | 'LONG_ANSWER'
  | 'CODE_OUTPUT'
  | 'CODE_DEBUGGING'
  | 'CODE_WRITING'
  | 'CASE_STUDY'
  | 'DIAGRAM_BASED'
  | 'IMAGE_BASED';

export type QbSourceType = 
  | 'RGPV_PYQ'
  | 'TEXTBOOK'
  | 'FACULTY_CREATED'
  | 'PLACEMENT'
  | 'GATE'
  | 'AI_GENERATED'
  | 'LAB_VIVA'
  | 'INTERVIEW_QUESTION'
  | 'ASSIGNMENT_QUESTION'
  | 'UNIVERSITY_QUESTION_BANK'
  | 'OTHER';

export type QbDifficulty = 
  | 'EASY'
  | 'MEDIUM'
  | 'HARD'
  | 'UNIVERSITY_EXAM'
  | 'PLACEMENT_LEVEL'
  | 'GATE_LEVEL';

export type QbExamType =
  | 'MID_SEMESTER'
  | 'END_SEMESTER'
  | 'SUPPLEMENTARY'
  | 'RETEST'
  | 'PRACTICAL_EXAM'
  | 'LAB_EXAM'
  | 'VIVA'
  | 'SESSIONAL'
  | 'INTERNAL_ASSESSMENT'
  | 'ASSIGNMENT'
  | 'MODEL_PAPER'
  | 'UNIVERSITY_QUESTION_BANK';

export type QbVerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'APPROVED';

export type QbAcademicImportance = 
  | 'NORMAL' 
  | 'IMPORTANT' 
  | 'REPEATED_PYQ' 
  | 'HIGH_WEIGHTAGE' 
  | 'MUST_PRACTICE';

export type QbQualityStatus = 
  | 'UNVERIFIED' 
  | 'VERIFIED' 
  | 'FACULTY_APPROVED' 
  | 'ADMIN_APPROVED';

// --------------------------------------------------------
// POLYMORPHIC METADATA UNIONS
// --------------------------------------------------------

export interface RGPV_PYQ_Metadata {
  sourceType: 'RGPV_PYQ';
  university: string;
  year: number;
  branch: string;
  semester: number;
  subject: string;
  examType: QbExamType;
  questionNumber: string;
  marks: number;
}

export interface TextbookMetadata {
  sourceType: 'TEXTBOOK';
  bookName: string;
  author: string;
  edition: string;
  chapter: string;
  topic: string;
  pageNumber: number;
  isbn?: string;
}

export interface GateMetadata {
  sourceType: 'GATE';
  examYear: number;
  branch: string;
  marks: number;
  questionType: QbQuestionType;
  difficulty: QbDifficulty;
}

export interface PlacementMetadata {
  sourceType: 'PLACEMENT';
  companyName: string;
  recruitmentYear: number;
  roundType: string;
  difficulty: QbDifficulty;
}

export interface LabVivaMetadata {
  sourceType: 'LAB_VIVA';
  subject: string;
  labName: string;
  experimentNumber: number;
  experimentTopic: string;
}

export interface FacultyCreatedMetadata {
  sourceType: 'FACULTY_CREATED';
  facultyName: string;
  institution: string;
  createdDate: string;
}

export interface AIGeneratedMetadata {
  sourceType: 'AI_GENERATED';
  generatedDate: string;
  promptSummary: string;
  verificationStatus: QbVerificationStatus;
}

export interface AssignmentMetadata {
  sourceType: 'ASSIGNMENT_QUESTION';
  assignmentNumber: number;
  subject: string;
  semester: number;
}

export interface InterviewMetadata {
  sourceType: 'INTERVIEW_QUESTION';
  company: string;
  role: string;
  interviewRound: string;
}

export interface BaseOtherMetadata {
  sourceType: 'UNIVERSITY_QUESTION_BANK' | 'OTHER';
  notes?: string;
}

export type QbMetadata =
  | RGPV_PYQ_Metadata
  | TextbookMetadata
  | GateMetadata
  | PlacementMetadata
  | LabVivaMetadata
  | FacultyCreatedMetadata
  | AIGeneratedMetadata
  | AssignmentMetadata
  | InterviewMetadata
  | BaseOtherMetadata;


export interface QbVersionHistory {
  version: number;
  timestamp: string;
  modifiedBy: string;
  changeSummary: string;
  snapshot: any; // Deep copy of the question state at that time
}

export interface QbAuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  notes?: string;
}

export interface QbQuestion {
  id: number;              // Internal Database ID
  publicId: string;        // E.g., Q-CSE-DBMS-PYQ-2023-0001
  title: string;           // E.g., ACID Properties Explanation
  questionText: string;
  questionType: QbQuestionType;
  department: string;
  subject: string;
  unit: number;
  topic: string;
  difficulty: QbDifficulty;
  sourceType: QbSourceType;
  status: QbStatus;
  marks: number;
  negativeMarks: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Phase 2: Metadata Extensions
  metadata?: QbMetadata;
  tags: string[];
  academicImportance: QbAcademicImportance;
  qualityStatus: QbQualityStatus;

  // Phase 4: Governance Extensions
  version: number;
  versions?: QbVersionHistory[];
  auditTrail?: QbAuditEvent[];
  qualityScore?: number;
  reviewNotes?: string;
  rejectionReason?: string;
}

export interface QbDashboardStats {
  totalQuestions: number;
  pendingReview: number;
  underReview: number;
  approvedQuestions: number;
  publishedQuestions: number;
  rejectedQuestions: number;
  archivedQuestions: number;
  drafts: number;
}

export interface QbFilters {
  department?: string;
  subject?: string;
  unit?: number;
  topic?: string;
  difficulty?: QbDifficulty;
  sourceType?: QbSourceType;
  status?: QbStatus;
  searchQuery?: string;

  // Phase 2: Metadata Filters
  year?: number;
  branch?: string;
  semester?: number;
  examType?: QbExamType;
  companyName?: string;
  bookName?: string;
  author?: string;
  tags?: string[];
  academicImportance?: QbAcademicImportance;
  qualityStatus?: QbQualityStatus;
}

export interface QbPaginatedResponse<T> {
  data: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}
