import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeneratedQuestion, FlashCard, Question, Subject } from '../types/projectKarl';

const PHYSICS_KEYWORDS = [
  'velocity', 'acceleration', 'force', 'momentum', 'energy', 'work', 'power',
  'newton', 'gravitation', 'friction', 'torque', 'current', 'voltage', 'resistance',
  'capacitor', 'inductor', 'magnetic', 'electric field', 'optics', 'lens', 'mirror',
  'refraction', 'wave', 'frequency', 'amplitude', 'projectile', 'thermodynamics',
  'entropy', 'pressure', 'density', 'buoyancy', 'semiconductor', 'photoelectric',
  'bohr', 'nucleus', 'radioactivity', 'fission', 'fusion', 'kinetic', 'potential',
];

const CHEMISTRY_KEYWORDS = [
  'mole', 'molarity', 'molality', 'atom', 'molecule', 'bond', 'ionic', 'covalent',
  'oxidation', 'reduction', 'redox', 'electrochemistry', 'electrolysis', 'acid',
  'base', 'ph', 'buffer', 'titration', 'equilibrium', 'enthalpy', 'entropy',
  'organic', 'inorganic', 'alkane', 'alkene', 'alkyne', 'benzene', 'aromatic',
  'polymer', 'reaction', 'reagent', 'catalyst', 'periodic table', 'element',
  'compound', 'mixture', 'solution', 'colloid', 'isomer', 'hybridization',
  'orbital', 'electron', 'proton', 'neutron', 'valence', 'avogadro',
];

const MATH_KEYWORDS = [
  'integral', 'derivative', 'limit', 'differentiation', 'integration', 'matrix',
  'determinant', 'vector', 'function', 'polynomial', 'quadratic', 'equation',
  'inequality', 'logarithm', 'trigonometry', 'sin', 'cos', 'tan', 'cot', 'sec',
  'cosec', 'probability', 'permutation', 'combination', 'binomial', 'series',
  'sequence', 'arithmetic', 'geometric', 'complex number', 'parabola', 'ellipse',
  'hyperbola', 'circle', 'coordinate', 'slope', 'calculus', 'statistics', 'mean',
  'median', 'mode', 'variance', 'standard deviation', 'set', 'relation',
];

export const detectSubject = (content: string): Subject => {
  const lower = content.toLowerCase();

  const physicsScore = PHYSICS_KEYWORDS.filter(k => lower.includes(k)).length;
  const chemistryScore = CHEMISTRY_KEYWORDS.filter(k => lower.includes(k)).length;
  const mathScore = MATH_KEYWORDS.filter(k => lower.includes(k)).length;

  if (physicsScore === 0 && chemistryScore === 0 && mathScore === 0) return 'Physics';

  if (physicsScore >= chemistryScore && physicsScore >= mathScore) return 'Physics';
  if (chemistryScore >= physicsScore && chemistryScore >= mathScore) return 'Chemistry';
  return 'Math';
};

const buildSystemPrompt = (): string =>
  `You are a Senior JEE/NEET faculty examiner with 20+ years of experience setting competitive entrance exam papers. You have deep expertise in Physics, Chemistry, and Mathematics at the JEE Advanced and NEET UG level. Your task is to generate high-quality, challenging exam questions. You must output ONLY a valid JSON array. Do not include any markdown, code blocks, explanations, or conversational text outside the JSON structure.`;

const buildUserPrompt = (syllabus: string, count: number): string =>
  `Generate exactly ${count} unique JEE/NEET level questions on: ${syllabus}.

Return a JSON array of exactly ${count} objects. Each object must have these exact keys:
- "subject": one of "Physics", "Chemistry", or "Math"
- "type": either "MCQ" or "AR"
- "content": the full question text (for AR type, begin with "Assertion: ..." and include "Reason: ..." in the same string)
- "options": an array of exactly 4 distinct strings representing answer choices
- "correct_answer": one of the 4 strings from options, copied exactly
- "explanation": a concise 1-2 sentence explanation of why the answer is correct

Rules:
- Mix MCQ and AR types across the set
- All questions must be JEE Main/Advanced difficulty
- correct_answer must be an exact copy of one option string
- Output only the JSON array, no other text`;

const createGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('VITE_GEMINI_API_KEY is not set in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
};

const safeParseQuestions = (text: string): GeneratedQuestion[] => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No valid JSON array found in AI response');
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      throw new Error('AI response contained malformed JSON that could not be recovered');
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI response is not a JSON array');
  }

  return parsed.map((item: Record<string, unknown>, index: number) => {
    if (
      typeof item.content !== 'string' ||
      !Array.isArray(item.options) ||
      typeof item.correct_answer !== 'string' ||
      typeof item.explanation !== 'string'
    ) {
      throw new Error(`Question at index ${index} has an invalid shape`);
    }

    const rawSubject = item.subject as string;
    const subject: Subject = (['Physics', 'Chemistry', 'Math'] as const).includes(rawSubject as Subject)
      ? (rawSubject as Subject)
      : detectSubject(item.content);

    const rawType = item.type as string;
    const type = rawType === 'AR' ? 'AR' : 'MCQ';

    return {
      subject,
      type,
      content: item.content,
      options: (item.options as unknown[]).map(String),
      correct_answer: item.correct_answer,
      explanation: item.explanation,
    } satisfies GeneratedQuestion;
  });
};

export const generateQuestionsWithAI = async (
  syllabus: string,
  count: number
): Promise<GeneratedQuestion[]> => {
  const client = createGeminiClient();

  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildSystemPrompt(),
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
      topP: 0.9,
    },
  });

  const result = await model.generateContent(buildUserPrompt(syllabus, count));
  const text = result.response.text();

  return safeParseQuestions(text);
};

export const validateQuestions = (data: unknown): data is GeneratedQuestion[] => {
  if (!Array.isArray(data)) return false;
  return data.every(
    item =>
      typeof item.content === 'string' &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      typeof item.correct_answer === 'string' &&
      typeof item.explanation === 'string' &&
      ['Physics', 'Chemistry', 'Math'].includes(item.subject) &&
      ['MCQ', 'AR'].includes(item.type)
  );
};

export const generateFlashcards = async (weakQuestions: Question[]): Promise<FlashCard[]> => {
  if (weakQuestions.length === 0) return [];

  const client = createGeminiClient();

  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: `You are a JEE/NEET study coach. Given a list of questions a student got wrong, generate concise revision flashcards. Output ONLY a valid JSON array. No markdown, no extra text.`,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.5,
    },
  });

  const payload = weakQuestions.map(q => ({
    id: q.id,
    subject: q.subject,
    content: q.content,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    tags: q.tags,
  }));

  const prompt = `For each question below, create a flashcard with:
- "questionId": the id field from the input
- "subject": the subject field from the input
- "front": a concise 1-sentence revision prompt (not the full question, a key concept cue)
- "back": the correct answer + a 1-2 sentence explanation
- "tags": array of 1-3 topic keywords

Input: ${JSON.stringify(payload)}

Return a JSON array of flashcard objects only.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('Flashcard response contained no valid JSON array');
    parsed = JSON.parse(match[0]);
  }

  if (!Array.isArray(parsed)) throw new Error('Flashcard response is not an array');

  return (parsed as Record<string, unknown>[]).map((item, i) => ({
    id: `fc-${i}-${Date.now()}`,
    questionId: String(item.questionId ?? weakQuestions[i]?.id ?? ''),
    subject: (['Physics', 'Chemistry', 'Math'] as const).includes(item.subject as Subject)
      ? (item.subject as Subject)
      : weakQuestions[i]?.subject ?? 'Physics',
    front: String(item.front ?? ''),
    back: String(item.back ?? ''),
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
  }));
};
