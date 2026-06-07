// Abstract OCR service to prepare for future Gemini/Google Vision APIs.
import type { QbQuestionType } from '../types/questionBank';

export interface ExtractedQuestion {
  id: string; // Temporary UUID for UI management
  rawText: string;
  inferredType: QbQuestionType;
}

export interface OcrResult {
  imageUrl: string;
  extractedQuestions: ExtractedQuestion[];
}

export class MockOcrService {
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulates scanning an image and splitting it into distinct questions
  async processImages(imageUrls: string[], onProgress?: (percent: number) => void): Promise<OcrResult[]> {
    const results: OcrResult[] = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      // Simulate network request per image
      await this.delay(1200); 
      
      const percent = Math.round(((i + 1) / imageUrls.length) * 100);
      if (onProgress) onProgress(percent);

      // Generate fake extracted text patterns
      results.push({
        imageUrl: imageUrls[i],
        extractedQuestions: this.generateFakeQuestions(i)
      });
    }

    return results;
  }

  private generateFakeQuestions(seed: number): ExtractedQuestion[] {
    // Fake the extraction splitting algorithm
    const mockSets = [
      [
        "Q1. Explain the differences between clustered and non-clustered indexes.\n(a) Mention use cases\n(b) Write an example",
        "Q2. Write a SQL query to find the second highest salary from the Employee table.",
        "Q3. True or False: ACID properties guarantee high performance in NoSQL databases."
      ],
      [
        "1. What is Normalization? Explain 1NF, 2NF, 3NF, and BCNF.",
        "2. Which of the following is not a DML command?\nA) SELECT\nB) INSERT\nC) CREATE\nD) UPDATE"
      ]
    ];

    const chosenSet = mockSets[seed % mockSets.length];
    
    return chosenSet.map((text, idx) => ({
      id: `ocr-${Date.now()}-${seed}-${idx}`,
      rawText: text,
      inferredType: this.autoClassifyType(text)
    }));
  }

  private autoClassifyType(text: string): QbQuestionType {
    const lower = text.toLowerCase();
    
    if (lower.includes('a)') && lower.includes('b)') && lower.includes('c)')) {
      return 'SINGLE_CHOICE';
    }
    if (lower.includes('true or false') || lower.includes('true/false')) {
      return 'TRUE_FALSE';
    }
    if (lower.includes('write a sql query') || lower.includes('write a program') || lower.includes('code snippet')) {
      return 'CODE_WRITING';
    }
    
    return 'THEORY'; // Default assumption
  }
}

export const ocrService = new MockOcrService();
