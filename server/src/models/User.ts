import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  institution: string;
  role: 'student' | 'teacher';
  performanceMeta: {
    physicsScore: number;
    chemistryScore: number;
    mathScore: number;
    totalAttempts: number;
    avgAccuracy: number;
    streakDays: number;
    lastAttemptAt: Date | null;
  };
  xp: number;
  level: number;
  streak: number;
  lastActive: Date;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

const performanceMetaSchema = new Schema(
  {
    physicsScore: { type: Number, default: 0, min: 0, max: 100 },
    chemistryScore: { type: Number, default: 0, min: 0, max: 100 },
    mathScore: { type: Number, default: 0, min: 0, max: 100 },
    totalAttempts: { type: Number, default: 0, min: 0 },
    avgAccuracy: { type: Number, default: 0, min: 0, max: 100 },
    streakDays: { type: Number, default: 0, min: 0 },
    lastAttemptAt: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: { type: String, required: true },
    institution: { type: String, default: 'LNCT Main Campus', trim: true },
    role: { type: String, enum: ['student', 'teacher'], default: 'student' },
    performanceMeta: { type: performanceMetaSchema, default: () => ({}) },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    achievements: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
