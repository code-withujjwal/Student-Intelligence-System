import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

export const getLeaderboard = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const topUsers = await User.find({ role: 'student' })
      .sort({ xp: -1, level: -1 })
      .limit(10)
      .select('name institution xp level streak achievements')
      .lean();

    res.json({
      success: true,
      data: topUsers,
    });
  } catch (err) {
    next(err);
  }
};
