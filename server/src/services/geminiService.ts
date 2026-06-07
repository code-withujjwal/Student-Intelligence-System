import { GoogleGenerativeAI } from '@google/generative-ai';
import { IQuestion } from '../models/Question';

interface GeneratedQuestion {
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subject: 'Physics' | 'Chemistry' | 'Math';
  type: 'MCQ' | 'AR' | 'Numeric';
  difficulty: 1 | 2 | 3;
  tags: string[];
  hasLatex: boolean;
}

interface FlashcardContent {
  front: string;
  back: string;
  tags: string[];
}

const getClient = () => {
  const key = process.env.GEMINI_API_KEY as string;
  if (!key) throw new Error('GEMINI_API_KEY is not configured');
  return new GoogleGenerativeAI(key);
};

const getModel = (temperature = 0.7) =>
  getClient().getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json', temperature },
  });

const safeParseArray = <T>(text: string): T[] => {
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed as T[];
    if (parsed && typeof parsed === 'object') {
      const first = Object.values(parsed)[0];
      if (Array.isArray(first)) return first as T[];
    }
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as T[];
  }
  throw new Error('Could not extract a JSON array from Gemini response');
};

export const generateQuestions = async (
  prompt: string,
  count: number,
  difficulty: 1 | 2 | 3
): Promise<GeneratedQuestion[]> => {
  const difficultyMap: Record<number, string> = {
    1: 'JEE Main / NEET easy',
    2: 'JEE Main / NEET standard',
    3: 'JEE Advanced hard',
  };

  const systemPrompt = `You are a Senior JEE/NEET faculty examiner.
Generate exactly ${count} questions at ${difficultyMap[difficulty]} difficulty.
Topic: ${prompt}

Return a JSON array. Each element must have:
- "text": question string (may include LaTeX delimited by $...$)
- "options": array of 4 strings
- "correctAnswerIndex": integer 0-3
- "explanation": 2-3 sentence explanation
- "subject": one of "Physics", "Chemistry", "Math"
- "type": one of "MCQ", "AR", "Numeric"
- "difficulty": integer ${difficulty}
- "tags": array of 1-3 topic keyword strings
- "hasLatex": boolean, true if text or options contain LaTeX

Output ONLY the JSON array. No markdown, no prose.`;

  const model = getModel(0.75);
  const result = await model.generateContent(systemPrompt);
  const text = result.response.text();
  return safeParseArray<GeneratedQuestion>(text);
};

export const generateFlashcardContent = async (
  questions: Pick<IQuestion, 'text' | 'explanation' | 'tags' | 'subject'>[]
): Promise<FlashcardContent[]> => {
  if (questions.length === 0) return [];

  const payload = questions.map((q, i) => ({
    index: i,
    text: q.text,
    explanation: q.explanation,
    tags: q.tags,
    subject: q.subject,
  }));

  const systemPrompt = `You are a JEE/NEET revision coach.
Analyze these failed questions and generate a 'Gap-Bridge' flashcard.
Return a JSON array with exactly ${questions.length} objects, each containing:
- "front": A concise question about the missing concept.
- "back": A high-level professional explanation with the underlying formula.
- "tags": array of 1-3 topic keywords

Input: ${JSON.stringify(payload)}
Output ONLY the JSON array.`;

  const model = getModel(0.5);
  const result = await model.generateContent(systemPrompt);
  const text = result.response.text();
  return safeParseArray<FlashcardContent>(text);
};
