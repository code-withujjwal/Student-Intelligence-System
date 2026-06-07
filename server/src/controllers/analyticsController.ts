import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Attempt } from '../models/Attempt';
import { User } from '../models/User';
import { createError } from '../middleware/errorHandler';

export const getNeuralReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const attempts = await Attempt.find({ userId: req.userId })
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();

    if (!attempts.length) {
      res.json({
        success: true,
        data: {
          masteryRadar: { Physics: 0, Chemistry: 0, Math: 0 },
          progressVector: 0,
          latestAccuracy: 0,
          totalAttempts: 0
        },
      });
      return;
    }

    let pCorrect = 0, pTotal = 0;
    let cCorrect = 0, cTotal = 0;
    let mCorrect = 0, mTotal = 0;

    attempts.forEach(a => {
      pCorrect += a.subjectBreakdown.Physics.correct;
      pTotal += a.subjectBreakdown.Physics.total;
      cCorrect += a.subjectBreakdown.Chemistry.correct;
      cTotal += a.subjectBreakdown.Chemistry.total;
      mCorrect += a.subjectBreakdown.Math.correct;
      mTotal += a.subjectBreakdown.Math.total;
    });

    const masteryRadar = {
      Physics: pTotal ? parseFloat(((pCorrect / pTotal) * 100).toFixed(1)) : 0,
      Chemistry: cTotal ? parseFloat(((cCorrect / cTotal) * 100).toFixed(1)) : 0,
      Math: mTotal ? parseFloat(((mCorrect / mTotal) * 100).toFixed(1)) : 0,
    };

    const oldest = attempts[attempts.length - 1].accuracy;
    const newest = attempts[0].accuracy;
    const progressVector = parseFloat((newest - oldest).toFixed(1));

    const user = await User.findById(req.userId).lean();

    res.json({
      success: true,
      data: {
        masteryRadar,
        progressVector,
        latestAccuracy: newest,
        totalAttempts: attempts.length,
        gamification: {
          xp: user?.xp ?? 0,
          level: user?.level ?? 1,
          streak: user?.streak ?? 0,
          achievements: user?.achievements ?? [],
        }
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMistakesLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const attempts = await Attempt.find({ userId: req.userId, "wrongTopics.0": { $exists: true } })
      .sort({ completedAt: -1 })
      .limit(20)
      .populate('wrongTopics.questionId')
      .lean();

    const mistakes: any[] = [];
    attempts.forEach(attempt => {
      attempt.wrongTopics.forEach(wt => {
        mistakes.push({
          attemptId: attempt._id,
          completedAt: attempt.completedAt,
          topic: wt.topic,
          subject: wt.subject,
          question: wt.questionId
        });
      });
    });

    res.json({ success: true, data: mistakes });
  } catch (err) {
    next(err);
  }
};
