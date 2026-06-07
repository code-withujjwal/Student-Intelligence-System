import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import quizRoutes from './routes/quiz';
import analyticsRoutes from './routes/analyticsRoutes';
import leaderboardRoutes from './routes/leaderboardRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Project Karl API is running', timestamp: new Date().toISOString() });
});

app.post('/api/generate-neural-quiz', async (req, res, next) => {
  try {
    const subjectKey = req.body.subjectKey || req.body.subject;
    const targetNode = req.body.targetNode || req.body.concept;
    const personaMode = req.body.personaMode || req.body.persona;
    if (!subjectKey || !targetNode || !personaMode) {
      res.status(400).json({ success: false, error: 'Missing parameters.' });
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an elite, adaptive engineering evaluator. Create a proctored dynamic assessment for target nodeId: "${targetNode}" under subject: "${subjectKey}".
The assessment is calibrated for the selected exam profile (personaMode: "${personaMode}").

Generate exactly 5 advanced, algorithmic multiple-choice questions.

Crucially, each question object must include:
1. "id": e.g., "Q1", "Q2", etc.
2. "questionText": The text of the question.
3. "options": An array of exactly 4 choices.
4. "correctIdx": The 0-based index of the correct option.
5. "realTimeHelp": An object containing:
   - "progressiveHint": A progressive contextual hint string that scaffolds learning if the student gets stuck without revealing the answer.
   - "distractorAnalysis": An array of exactly 4 strings, where each element is an explicit plain-text explanation of the underlying logic flaw that each option (distractor) represents for the student.

Strict Format Restriction: Output ONLY a raw, parsable JSON array wrapped inside a markdown \`\`\`json code block. Do NOT include any leading, trailing, or introductory conversational text. Follow this schema exactly:
[
  {
    "id": "Q1",
    "questionText": "...",
    "options": ["...", "...", "...", "..."],
    "correctIdx": 2,
    "realTimeHelp": {
      "progressiveHint": "...",
      "distractorAnalysis": ["...", "...", "...", "..."]
    }
  }
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    const quizData = JSON.parse(jsonString.trim());

    res.json({ success: true, data: quizData });
  } catch (err) {
    next(err);
  }
});

app.post('/api/synthesize-cognitive-analysis', async (req, res, next) => {
  try {
    const { subjectKey, targetNode, questionText, selectedOptionText, correctOptionText, timeSpentSeconds } = req.body;
    if (!subjectKey || !targetNode || !questionText || !selectedOptionText || !correctOptionText) {
      res.status(400).json({ success: false, error: 'Missing parameters.' });
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a hyper-personalized computer science coach performing Cognitive Failure Profiling.
Perform a diagnostic analysis of a student's answer selection:
- Subject: ${subjectKey}
- Concept Node: ${targetNode}
- Question: ${questionText}
- Selected Option: ${selectedOptionText}
- Correct Option: ${correctOptionText}
- Time Spent: ${timeSpentSeconds} seconds

Provide your response as a clean, markdown-supported text response divided strictly into three uppercase console blocks:

[ COGNITIVE GAP DIAGNOSIS ]
Explain the exact semantic, logic, or architectural misunderstanding that led the student to pick that specific incorrect option, taking their timing behavior into account (e.g. if they answered very fast it might be guessing or a shallow heuristic, if slow it's a deep misconception).

[ CRITICAL SUB-TOPIC REMEDIAL TRACE ]
Break down the core foundational rule they need to review right now to patch this hole.

[ IMMEDIATE ACTIONABLE SPRINT STEP ]
Provide a direct, code-based practice drill or mental shortcut they can execute in under 2 minutes to verify they have understood the fix.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ success: true, data: text });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT ?? '5000', 10);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Project Karl server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });

export default app;
