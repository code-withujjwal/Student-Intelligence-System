# Project Karl - Teacher Engine Setup Guide

## Installation

### 1. Install Required Dependencies
```bash
npm install @google/generative-ai
```

### 2. Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Get API Key"
3. Create a new API key for this project
4. Copy the key

### 3. Configure Environment Variables
Open `.env.local` and add your Gemini API key:
```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

Never commit `.env.local` to git. It's in `.gitignore` by default.

---

## Architecture Overview

### File Structure
```
src/
├── services/
│   └── geminiService.ts        # AI generation logic with JSON parsing
├── components/
│   ├── ExamInterface.tsx       # Student exam portal
│   ├── TeacherDashboard.tsx    # Teacher quiz creation UI
│   └── ui/button.tsx           # UI components
├── contexts/
│   └── QuizContext.tsx         # Global state management
└── App.tsx                     # Mode toggle (Teacher/Student)
```

### Data Flow

1. **Teacher Mode (TeacherDashboard.tsx)**
   - Teacher enters syllabus text
   - Selects subject, difficulty, question count
   - Clicks "Generate Exam with AI"
   - `geminiService.ts` sends prompt to Gemini API
   - AI returns JSON array of questions
   - Teacher can edit/delete questions
   - Clicks "Publish to Exam"
   - Questions are set in QuizContext via `setQuestions()`

2. **Student Mode (ExamInterface.tsx)**
   - Reads from QuizContext
   - Students take the exam
   - Timer counts down
   - Question palette tracks progress
   - Can mark for review, clear responses

### State Management (QuizContext)

Key functions available:
- `setQuestions(questions)` - Replace all questions
- `updateUserAnswer(id, answer)` - Save student response
- `toggleMarked(id)` - Mark question for review
- `clearResponse(id)` - Clear student's answer
- `submitQuiz()` - Submit the exam

---

## How geminiService Works

### System Prompt
Forces Gemini to return ONLY valid JSON with no markdown or extra text.

### JSON Schema
```typescript
{
  question: string;           // Question text
  options: string[];          // 4 options (A, B, C, D)
  correctIndex: number;       // Index of correct option (0-3)
  type: 'mcq' | 'assertion-reason';
  subject: 'Physics' | 'Chemistry' | 'Math';
  explanation: string;        // 1-2 sentence explanation
  assertion?: string;         // For assertion-reason only
  reason?: string;            // For assertion-reason only
}
```

### Input Parameters
```typescript
{
  syllabus: string;           // Topic description
  subject: 'Physics' | 'Chemistry' | 'Math';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionCount: number;      // 1-50 questions
}
```

### Error Handling
- Validates API key exists
- Parses JSON response safely
- Throws descriptive errors if JSON parsing fails
- Shows error messages in UI

---

## Using the App

### Switch Between Modes
A **"Teacher Mode"** button appears in the top-right corner (Student mode only).

### Teacher Dashboard
1. Paste syllabus (e.g., "Kinematics - 1D motion, 2D motion, projectile motion")
2. Select Subject, Difficulty, Question Count
3. Click **Generate Exam with AI**
4. Wait for generation (10-30 seconds)
5. Review questions in preview
6. Edit individual questions or delete them
7. Click **Publish to Exam** to make them live

### Student Portal
1. Switch to Student Mode
2. See generated or mock questions
3. Answer MCQ/Assertion-Reason questions
4. Use Question Palette to navigate
5. Mark questions for review
6. Submit exam

---

## Customization

### Change Model
In `geminiService.ts`, line 47:
```typescript
const model = client.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

Available models:
- `gemini-1.5-flash` (fast, good quality) ✓ Current
- `gemini-1.5-pro` (slower, higher quality)
- `gemini-2.0-flash` (newest)

### Adjust System Prompt
Edit `SYSTEM_PROMPT` constant in `geminiService.ts` to change:
- Question difficulty
- Answer format
- Subject-specific rules
- Explanation length

### Change UI Theme
- Colors: Edit `src/index.css` CSS variables
- Fonts: Already using 'Inter' and 'Geist'
- Animations: Controlled by Framer Motion in components

---

## Testing

### Mock Data
App.tsx includes 20 mock questions for testing without AI.

### Test AI Generation
1. Set up Gemini API key
2. Switch to Teacher Mode
3. Paste syllabus: "Kinematics: motion in 1D and 2D"
4. Generate 5 questions
5. Check preview

---

## Troubleshooting

### "VITE_GEMINI_API_KEY not set"
- Check `.env.local` exists
- Verify key is correct from Google AI Studio
- Restart dev server: `npm run dev`

### JSON Parsing Error
- Check Gemini response is valid JSON
- Verify system prompt hasn't been changed
- Try different model: `gemini-1.5-pro`

### Questions not appearing
- Confirm "Publish to Exam" was clicked
- Check QuizContext has setQuestions called
- Verify TeacherDashboard state is updating

---

## Performance Notes

- Gemini API calls take 5-30 seconds
- Loading spinner provides visual feedback
- JSON parsing happens client-side
- No server required (API calls directly from browser)

---

## Production Checklist

- [ ] Regenerate Gemini API key before deploying
- [ ] Add rate limiting for AI calls
- [ ] Store generated exams in database
- [ ] Add user authentication (Teacher/Student)
- [ ] Implement exam analytics and scoring
- [ ] Add more question types (MSQ, True/False, Diagram)
