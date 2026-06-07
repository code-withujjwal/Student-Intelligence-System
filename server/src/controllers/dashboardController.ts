import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Attempt } from '../models/Attempt';
import { User } from '../models/User';
import { Flashcard } from '../models/Flashcard';
import { createError } from '../middleware/errorHandler';

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId as string;

    const [user, attempts, pendingFlashcards] = await Promise.all([
      User.findById(userId).select('name institution performanceMeta').lean(),
      Attempt.find({ userId })
        .sort({ completedAt: -1 })
        .limit(30)
        .populate('quizId', 'title subject')
        .lean(),
      Flashcard.countDocuments({ userId, nextReviewAt: { $lte: new Date() } }),
    ]);

    if (!user) return next(createError('User not found', 404));

    const radarData = [
      { subject: 'Physics', value: user.performanceMeta.physicsScore },
      { subject: 'Chemistry', value: user.performanceMeta.chemistryScore },
      { subject: 'Math', value: user.performanceMeta.mathScore },
    ];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const scoreTrend = last7Days.map(dayStart => {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const dayAttempts = attempts.filter(a => {
        const at = new Date(a.completedAt);
        return at >= dayStart && at < dayEnd;
      });
      const avgScore =
        dayAttempts.length > 0
          ? Math.round(dayAttempts.reduce((s, a) => s + a.accuracy, 0) / dayAttempts.length)
          : null;
      return {
        day: dayStart.toLocaleDateString('en-IN', { weekday: 'short' }),
        score: avgScore,
      };
    });

    const topicFrequency: Record<string, { topic: string; subject: string; count: number }> = {};
    for (const attempt of attempts) {
      for (const wt of attempt.wrongTopics) {
        const key = wt.topic;
        if (!topicFrequency[key]) {
          topicFrequency[key] = { topic: wt.topic, subject: wt.subject, count: 0 };
        }
        topicFrequency[key].count += 1;
      }
    }

    const neuralGaps = Object.values(topicFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(t => ({
        ...t,
        urgency: Math.min(t.count / 5, 1),
      }));

    const recentActivity = attempts.slice(0, 5).map(a => ({
      quizTitle: (a.quizId as any)?.title ?? 'Unknown Quiz',
      subject: (a.quizId as any)?.subject ?? 'Mixed',
      score: a.score,
      accuracy: a.accuracy,
      timeTaken: a.timeTaken,
      completedAt: a.completedAt,
    }));

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          institution: user.institution,
          performanceMeta: user.performanceMeta,
        },
        radarData,
        scoreTrend,
        neuralGaps,
        recentActivity,
        pendingFlashcards,
        totalAttempts: user.performanceMeta.totalAttempts,
        avgAccuracy: user.performanceMeta.avgAccuracy,
      },
    });
  } catch (err) {
    next(err);
  }
};
