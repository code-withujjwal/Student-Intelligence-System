import { User, IUser } from '../models/User';

export const calculateQuizXP = (score: number, isFinished: boolean, currentStreak: number): number => {
  let xp = 0;
  xp += score * 10;
  if (isFinished) xp += 50;
  if (currentStreak > 5) xp = Math.floor(xp * 1.5);
  return xp;
};

export const updateGamificationMetrics = async (
  userId: string,
  score: number,
  isFinished: boolean
): Promise<{ xpEarned: number; newLevel: number; leveledUp: boolean; newAchievements: string[] }> => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

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

  const xpEarned = calculateQuizXP(score, isFinished, newStreak);
  const oldLevel = user.level;
  
  user.xp += xpEarned;
  user.level = Math.max(1, Math.floor(user.xp / 1000) + 1);
  user.streak = newStreak;
  user.lastActive = now;

  const leveledUp = user.level > oldLevel;
  
  const newAchievements: string[] = [];
  if (user.xp >= 1000 && !user.achievements.includes('Rookie')) newAchievements.push('Rookie');
  if (user.streak >= 5 && !user.achievements.includes('Consistent')) newAchievements.push('Consistent');
  
  if (newAchievements.length > 0) {
    user.achievements.push(...newAchievements);
  }

  await user.save();

  return { xpEarned, newLevel: user.level, leveledUp, newAchievements };
};
