import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Question, IQuestion } from '../models/Question';
import { Quiz } from '../models/Quiz';
import { Attempt } from '../models/Attempt';
import { User } from '../models/User';
import { Flashcard } from '../models/Flashcard';
import { createError } from '../middleware/errorHandler';
import { generateQuestions, generateFlashcardContent } from '../services/geminiService';
import { calculateQuizXP } from '../services/gamificationService';

const generateToken = (len = 10): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const generateQuiz = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { prompt, count = 10, difficulty = 2, subject = 'Mixed', timeLimitSeconds = 3600 } = req.body;
    if (!prompt) return next(createError('prompt is required', 400));

    const parsedCount = Math.min(Math.max(parseInt(String(count)), 1), 50);
    const parsedDiff = ([1, 2, 3].includes(difficulty) ? difficulty : 2) as 1 | 2 | 3;

    const generated = await generateQuestions(prompt, parsedCount, parsedDiff);

    const savedQuestions = await Question.insertMany(
      generated.map(q => ({
        text: q.text,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
        subject: q.subject,
        type: q.type,
        difficulty: q.difficulty,
        tags: q.tags ?? [],
        hasLatex: q.hasLatex ?? false,
      }))
    );

    const quiz = await Quiz.create({
      title: `${subject} Quiz — ${prompt.slice(0, 60)}`,
      subject,
      difficulty: parsedDiff,
      timeLimitSeconds,
      questions: savedQuestions.map(q => q._id),
      createdBy: req.userId,
      shareToken: generateToken(10),
      isPublic: true,
      generatedByAI: true,
      originalPrompt: prompt,
    });

    const populated = await Quiz.findById(quiz._id)
      .populate<{ questions: IQuestion[] }>('questions')
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

export const getQuizByToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const quiz = await Quiz.findOne({ shareToken: token })
      .populate<{ questions: IQuestion[] }>('questions', '-__v')
      .lean();

    if (!quiz) return next(createError('Quiz not found', 404));
    res.json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
};

export const submitQuiz = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { quizId, answers, timeTaken, behavioralMetrics } = req.body;
    if (!quizId || !Array.isArray(answers)) {
      return next(createError('quizId and answers[] are required', 400));
    }

    const finalMetrics = behavioralMetrics || {
      timeSpentPerQuestion: [],
      confusionSpikes: [],
      topicAccuracy: {},
    };

    const quiz = await Quiz.findById(quizId)
      .populate<{ questions: IQuestion[] }>('questions')
      .lean();

    if (!quiz) return next(createError('Quiz not found', 404));

    const questions = quiz.questions as IQuestion[];
    const subjectBreakdown = {
      Physics: { correct: 0, total: 0 },
      Chemistry: { correct: 0, total: 0 },
      Math: { correct: 0, total: 0 },
    };
    const wrongQuestions: IQuestion[] = [];
    const wrongTopics: { questionId: string; topic: string; subject: 'Physics' | 'Chemistry' | 'Math' }[] = [];
    let score = 0;

    questions.forEach((q, i) => {
      const sub = q.subject as 'Physics' | 'Chemistry' | 'Math';
      subjectBreakdown[sub].total += 1;
      if (answers[i] === q.correctAnswerIndex) {
        score += 1;
        subjectBreakdown[sub].correct += 1;
      } else {
        wrongQuestions.push(q);
        const topic = q.tags?.[0] ?? q.subject;
        wrongTopics.push({ questionId: String(q._id), topic, subject: sub });
      }
    });

    const accuracy = parseFloat(((score / questions.length) * 100).toFixed(2));

    const attempt = await Attempt.create({
      userId: req.userId,
      quizId,
      answers,
      score,
      totalQuestions: questions.length,
      accuracy,
      timeTaken: timeTaken ?? 0,
      wrongTopics,
      subjectBreakdown,
      behavioralMetrics: finalMetrics,
    });

    const user = await User.findById(req.userId);
    if (user) {
      const meta = user.performanceMeta;
      const n = meta.totalAttempts;
      meta.totalAttempts = n + 1;
      meta.avgAccuracy = parseFloat(((meta.avgAccuracy * n + accuracy) / (n + 1)).toFixed(2));
      meta.lastAttemptAt = new Date();

      const subjects: ('Physics' | 'Chemistry' | 'Math')[] = ['Physics', 'Chemistry', 'Math'];
      for (const sub of subjects) {
        const bd = subjectBreakdown[sub];
        if (bd.total > 0) {
          const subAcc = (bd.correct / bd.total) * 100;
          const key = `${sub.toLowerCase()}Score` as 'physicsScore' | 'chemistryScore' | 'mathScore';
          meta[key] = parseFloat(((meta[key] * n + subAcc) / (n + 1)).toFixed(2));
        }
      }

      // Gamification Updates
      const now = new Date();
      const lastActive = user.lastActive || now;
      const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24));
      
      let newStreak = user.streak;
      if (daysDiff === 1) {
        newStreak += 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      } else if (user.streak === 0) {
        newStreak = 1;
      }

      const xpEarned = calculateQuizXP(score, true, newStreak);
      user.xp += xpEarned;
      user.level = Math.max(1, Math.floor(user.xp / 1000) + 1);
      user.streak = newStreak;
      user.lastActive = now;
      
      if (user.xp >= 1000 && !user.achievements.includes('Rookie')) user.achievements.push('Rookie');
      if (user.streak >= 5 && !user.achievements.includes('Consistent')) user.achievements.push('Consistent');

      await user.save();
    }

    if (wrongQuestions.length > 0) {
      const flashcardContents = await generateFlashcardContent(
        wrongQuestions.map(q => ({
          text: q.text,
          explanation: q.explanation,
          tags: q.tags,
          subject: q.subject,
        }))
      );

      const flashcardDocs = wrongQuestions.map((q, i) => ({
        userId: req.userId,
        originalQuestionId: q._id,
        subject: q.subject,
        front: flashcardContents[i]?.front ?? q.text.slice(0, 120),
        back: flashcardContents[i]?.back ?? q.explanation,
        tags: flashcardContents[i]?.tags ?? q.tags,
        difficulty: q.difficulty,
      }));

      await Flashcard.insertMany(flashcardDocs, { ordered: false }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      data: {
        attemptId: attempt._id,
        score,
        totalQuestions: questions.length,
        accuracy,
        timeTaken: timeTaken ?? 0,
        subjectBreakdown,
        flashcardsGenerated: wrongQuestions.length,
        xpEarned: calculateQuizXP(score, true, user ? user.streak : 1),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getFlashcards = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { subject, dueOnly } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId };
    if (subject) filter.subject = subject;
    if (dueOnly === 'true') filter.nextReviewAt = { $lte: new Date() };

    const cards = await Flashcard.find(filter)
      .sort({ nextReviewAt: 1 })
      .limit(50)
      .lean();

    res.json({ success: true, data: cards, count: cards.length });
  } catch (err) {
    next(err);
  }
};
