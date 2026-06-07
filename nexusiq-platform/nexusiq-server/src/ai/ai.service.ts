import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QuizService } from '../quiz/quiz.service';
import { GenerateQuizDto } from './dto/generate-quiz.dto';

@Injectable()
export class AiService {
  private apiKey: string;

  constructor(
    private config: ConfigService,
    private quizService: QuizService,
  ) {
    this.apiKey = this.config.get<string>('GEMINI_API_KEY') ?? '';
  }

  async generateQuiz(dto: GenerateQuizDto, creatorId?: string) {
    const { subject, topic, difficulty = 'MEDIUM', questionCount = 10 } = dto;

    const prompt = `You are an expert ${subject} teacher preparing questions for a ${difficulty} level exam.

Generate exactly ${questionCount} multiple-choice questions (MCQ) about "${topic}" in the subject "${subject}".

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- Clearly indicate the correct answer
- Add a concise explanation (1-2 sentences)
- Questions should be at ${difficulty} difficulty
- For JEE/NEET style: include unit-based and conceptual questions

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "title": "${topic} — ${difficulty} Quiz",
  "description": "AI-generated quiz on ${topic} for ${subject}",
  "questions": [
    {
      "content": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation why A is correct.",
      "difficulty": "${difficulty}",
      "points": 4,
      "negativePoints": 1
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
    
    let raw: string;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
        }),
      });
      const json = await resp.json();
      raw = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    } catch (e) {
      throw new InternalServerErrorException('Gemini API call failed');
    }

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new InternalServerErrorException('Failed to parse AI response as JSON');
    }

    // Build the quiz
    return this.quizService.createQuiz(
      {
        title: parsed.title ?? `${topic} Quiz`,
        description: parsed.description,
        subject,
        topic,
        difficulty: difficulty as any,
        isPublic: true,
        questions: parsed.questions.map((q: any, i: number) => ({
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: difficulty as any,
          points: q.points ?? 4,
          negativePoints: q.negativePoints ?? 1,
          order: i,
        })),
      },
      creatorId,
    );
  }
}
