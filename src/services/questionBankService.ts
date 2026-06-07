import { 
  QbQuestion, 
  QbDashboardStats, 
  QbFilters, 
  QbPaginatedResponse,
  QbQuestionType,
  QbSourceType,
  QbDifficulty,
  QbStatus,
  QbAcademicImportance,
  QbQualityStatus,
  QbMetadata
} from '../types/questionBank';

// Generate 150 mock questions to demonstrate pagination and performance
const generateMockQuestions = (): QbQuestion[] => {
  const subjects = ['DBMS', 'OS', 'DSA', 'OOP', 'CN'];
  const depts = ['Computer Science', 'Information Technology'];
  const types: QbQuestionType[] = ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'THEORY', 'CODE_WRITING', 'NUMERICAL'];
  const sources: QbSourceType[] = ['RGPV_PYQ', 'TEXTBOOK', 'GATE', 'FACULTY_CREATED'];
  const diffs: QbDifficulty[] = ['EASY', 'MEDIUM', 'HARD', 'UNIVERSITY_EXAM', 'GATE_LEVEL'];
  const statuses: QbStatus[] = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'];

  const questions: QbQuestion[] = [];
  
  for (let i = 1; i <= 150; i++) {
    const subject = subjects[i % subjects.length];
    const source = sources[i % sources.length];
    const year = 2020 + (i % 4);
    const pubId = `Q-CSE-${subject}-${source.split('_')[0]}-${year}-${i.toString().padStart(4, '0')}`;
    const status = i < 80 ? 'APPROVED' : i < 110 ? 'PENDING_REVIEW' : i < 130 ? 'DRAFT' : i < 140 ? 'REJECTED' : 'ARCHIVED';
    const difficulty = diffs[i % diffs.length];

    let metadata: QbMetadata;
    if (source === 'RGPV_PYQ') {
      metadata = {
        sourceType: 'RGPV_PYQ',
        university: 'RGPV',
        year: year,
        branch: depts[i % depts.length],
        semester: (i % 8) + 1,
        subject: subject,
        examType: 'END_SEMESTER',
        questionNumber: `${(i % 5) + 1}(a)`,
        marks: (i % 7) + 1
      };
    } else if (source === 'TEXTBOOK') {
      metadata = {
        sourceType: 'TEXTBOOK',
        bookName: `Mastering ${subject} Concepts`,
        author: 'John Doe',
        edition: '4th Edition',
        chapter: `Chapter ${(i % 10) + 1}`,
        topic: `Topic Module ${i % 20}`,
        pageNumber: 100 + i,
      };
    } else if (source === 'GATE') {
      metadata = {
        sourceType: 'GATE',
        examYear: year,
        branch: depts[i % depts.length],
        marks: i % 2 === 0 ? 1 : 2,
        questionType: types[i % types.length],
        difficulty: difficulty
      };
    } else {
      metadata = {
        sourceType: 'FACULTY_CREATED',
        facultyName: `Prof. Smith`,
        institution: 'RGPV University',
        createdDate: new Date(Date.now() - i * 86400000).toISOString()
      };
    }

    questions.push({
      id: i,
      publicId: pubId,
      title: `Concept evaluation on ${subject} ${i}`,
      questionText: `Explain the fundamental concept of ${subject} referencing standard operating procedures. Discuss implications of the ${types[i % types.length]} mechanism in this context.`,
      questionType: types[i % types.length],
      department: depts[i % depts.length],
      subject: subject,
      unit: (i % 5) + 1,
      topic: `Topic Module ${i % 20}`,
      difficulty: difficulty,
      sourceType: metadata.sourceType,
      status: status,
      marks: (i % 10) + 1,
      negativeMarks: (i % 3) === 0 ? 1 : 0,
      createdBy: `faculty_${(i % 5) + 1}`,
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - (i/2) * 86400000).toISOString(),
      metadata: metadata,
      tags: i % 4 === 0 ? ['Important', 'Repeated PYQ'] : [],
      academicImportance: i % 5 === 0 ? 'IMPORTANT' : 'NORMAL',
      qualityStatus: status === 'APPROVED' ? 'ADMIN_APPROVED' : 'UNVERIFIED',
      
      // Phase 4: Governance
      version: 1,
      versions: [],
      auditTrail: [{
        id: `aud-${i}-0`,
        timestamp: new Date(Date.now() - i * 86400000).toISOString(),
        user: `faculty_${(i % 5) + 1}`,
        action: 'Question Created',
        notes: 'Initial creation.'
      }],
      qualityScore: Math.floor(Math.random() * 40) + 60,
    });
  }
  return questions;
};

const MOCK_DB = generateMockQuestions();

class QuestionBankService {
  // Simulate API delay
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getQuestions(page: number = 1, pageSize: number = 50, filters?: QbFilters): Promise<QbPaginatedResponse<QbQuestion>> {
    await this.delay(400); // Simulate network latency

    let filtered = [...MOCK_DB];

    if (filters) {
      if (filters.department) filtered = filtered.filter(q => q.department === filters.department);
      if (filters.subject) filtered = filtered.filter(q => q.subject === filters.subject);
      if (filters.unit) filtered = filtered.filter(q => q.unit === filters.unit);
      if (filters.topic) filtered = filtered.filter(q => q.topic.toLowerCase().includes(filters.topic!.toLowerCase()));
      if (filters.difficulty) filtered = filtered.filter(q => q.difficulty === filters.difficulty);
      if (filters.sourceType) filtered = filtered.filter(q => q.sourceType === filters.sourceType);
      if (filters.status) filtered = filtered.filter(q => q.status === filters.status);
      if (filters.academicImportance) filtered = filtered.filter(q => q.academicImportance === filters.academicImportance);
      if (filters.qualityStatus) filtered = filtered.filter(q => q.qualityStatus === filters.qualityStatus);

      // Metadata JSON filters
      if (filters.year) filtered = filtered.filter(q => (q.metadata as any)?.year === filters.year || (q.metadata as any)?.examYear === filters.year);
      if (filters.companyName) filtered = filtered.filter(q => (q.metadata as any)?.companyName?.includes(filters.companyName) || (q.metadata as any)?.company?.includes(filters.companyName));
      if (filters.bookName) filtered = filtered.filter(q => (q.metadata as any)?.bookName?.includes(filters.bookName));
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(q => 
          q.publicId.toLowerCase().includes(query) || 
          q.questionText.toLowerCase().includes(query) ||
          q.title.toLowerCase().includes(query) ||
          (q.metadata as any)?.bookName?.toLowerCase().includes(query) ||
          (q.metadata as any)?.companyName?.toLowerCase().includes(query)
        );
      }
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const startIdx = (page - 1) * pageSize;
    const paginatedData = filtered.slice(startIdx, startIdx + pageSize);

    return {
      data: paginatedData,
      totalPages,
      totalElements,
      currentPage: page,
      pageSize
    };
  }

  async getStats(): Promise<QbDashboardStats> {
    await this.delay(300);
    
    return {
      totalQuestions: MOCK_DB.length,
      pendingReview: MOCK_DB.filter(q => q.status === 'PENDING_REVIEW').length,
      underReview: MOCK_DB.filter(q => q.status === 'UNDER_REVIEW').length,
      approvedQuestions: MOCK_DB.filter(q => q.status === 'APPROVED').length,
      publishedQuestions: MOCK_DB.filter(q => q.status === 'PUBLISHED').length,
      rejectedQuestions: MOCK_DB.filter(q => q.status === 'REJECTED' || q.status === 'CHANGES_REQUESTED').length,
      archivedQuestions: MOCK_DB.filter(q => q.status === 'ARCHIVED').length,
      drafts: MOCK_DB.filter(q => q.status === 'DRAFT').length,
    };
  }

  async addQuestion(question: Omit<QbQuestion, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<QbQuestion> {
    await this.delay(400);
    const id = MOCK_DB.length + 1;
    const year = new Date().getFullYear();
    const sourcePrefix = question.sourceType.split('_')[0];
    const pubId = `Q-${question.department.substring(0, 3).toUpperCase()}-${question.subject.substring(0, 4).toUpperCase()}-${sourcePrefix}-${year}-${id.toString().padStart(4, '0')}`;
    
    const newQuestion: QbQuestion = {
      ...question,
      id,
      publicId: pubId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      versions: [],
      auditTrail: [{
        id: `aud-${id}-0`,
        timestamp: new Date().toISOString(),
        user: question.createdBy || 'currentUser',
        action: 'Question Created',
        notes: 'Created via Form'
      }]
    };
    
    MOCK_DB.unshift(newQuestion); // Add to beginning
    return newQuestion;
  }

  async bulkAddQuestions(questions: Omit<QbQuestion, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>[]): Promise<QbQuestion[]> {
    await this.delay(800); // Simulate large payload processing
    const year = new Date().getFullYear();
    const addedQuestions: QbQuestion[] = [];
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const id = MOCK_DB.length + 1;
      const sourcePrefix = q.sourceType ? q.sourceType.split('_')[0] : 'UNK';
      const pubId = `Q-${q.department?.substring(0, 3).toUpperCase() || 'GEN'}-${q.subject?.substring(0, 4).toUpperCase() || 'GEN'}-${sourcePrefix}-${year}-${id.toString().padStart(4, '0')}`;
      
      const newQuestion: QbQuestion = {
        ...q,
        id,
        publicId: pubId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        versions: [],
        auditTrail: [{
          id: `aud-${id}-bulk-0`,
          timestamp: new Date().toISOString(),
          user: 'currentUser',
          action: 'Question Imported',
          notes: 'Imported via Bulk Import System'
        }]
      };
      
      MOCK_DB.unshift(newQuestion);
      addedQuestions.push(newQuestion);
    }
    
    return addedQuestions;
  }

  async updateQuestion(id: number, updates: Partial<QbQuestion>): Promise<QbQuestion> {
    await this.delay(400);
    const index = MOCK_DB.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Question not found');
    
    const existing = MOCK_DB[index];
    const newVersionNum = (existing.version || 1) + 1;
    
    // Store old state as a version snapshot
    const oldSnapshot = JSON.parse(JSON.stringify(existing));
    const versionEntry = {
      version: existing.version || 1,
      timestamp: new Date().toISOString(),
      modifiedBy: 'currentUser',
      changeSummary: 'Question properties updated',
      snapshot: oldSnapshot
    };

    const auditEntry = {
      id: `aud-${existing.id}-${newVersionNum}`,
      timestamp: new Date().toISOString(),
      user: 'currentUser',
      action: `Question Edited (v${newVersionNum})`,
      notes: updates.reviewNotes || 'Updated fields.'
    };

    const updatedQuestion = {
      ...existing,
      ...updates,
      version: newVersionNum,
      versions: [versionEntry, ...(existing.versions || [])],
      auditTrail: [auditEntry, ...(existing.auditTrail || [])],
      updatedAt: new Date().toISOString()
    };
    
    MOCK_DB[index] = updatedQuestion;
    return updatedQuestion;
  }

  async transitionStatus(id: number, newStatus: QbStatus, notes: string = '', user: string = 'currentUser', rejectionReason?: string): Promise<QbQuestion> {
    await this.delay(300);
    const index = MOCK_DB.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Question not found');
    
    const existing = MOCK_DB[index];
    
    const auditEntry = {
      id: `aud-${existing.id}-trans-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: user,
      action: `Status changed to ${newStatus.replace(/_/g, ' ')}`,
      notes: notes
    };

    const updatedQuestion = {
      ...existing,
      status: newStatus,
      reviewNotes: notes,
      rejectionReason: rejectionReason,
      auditTrail: [auditEntry, ...(existing.auditTrail || [])],
      updatedAt: new Date().toISOString()
    };
    
    MOCK_DB[index] = updatedQuestion;
    return updatedQuestion;
  }
}

export const questionBankService = new QuestionBankService();
