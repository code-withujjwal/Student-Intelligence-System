import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const signToken = (id: string, role: string): string =>
  jwt.sign(
    { id, role },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as any }
  );

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, institution, role } = req.body;
    if (!name || !email || !password) {
      return next(createError('name, email, and password are required', 400));
    }
    const existing = await User.findOne({ email }).lean();
    if (existing) return next(createError('Email already registered', 409));

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      institution: institution ?? 'LNCT Main Campus',
      role: role === 'teacher' ? 'teacher' : 'student',
    });

    res.status(201).json({
      success: true,
      token: signToken(String(user._id), user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(createError('email and password are required', 400));

    const user = await User.findOne({ email });
    if (!user) return next(createError('Invalid credentials', 401));

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return next(createError('Invalid credentials', 401));

    res.json({
      success: true,
      token: signToken(String(user._id), user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        performanceMeta: user.performanceMeta,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash').lean();
    if (!user) return next(createError('User not found', 404));
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
