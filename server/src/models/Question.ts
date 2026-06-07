import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subject: 'Physics' | 'Chemistry' | 'Math';
  type: 'MCQ' | 'AR' | 'Numeric';
  difficulty: 1 | 2 | 3;
  tags: string[];
  hasLatex: boolean;
  createdAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 2 && v.length <= 4,
        message: 'options must have 2–4 items',
      },
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'correctAnswerIndex must be an integer',
      },
    },
    explanation: { type: String, required: true },
    subject: {
      type: String,
      required: true,
      enum: ['Physics', 'Chemistry', 'Math'],
    },
    type: {
      type: String,
      required: true,
      enum: ['MCQ', 'AR', 'Numeric'],
      default: 'MCQ',
    },
    difficulty: { type: Number, enum: [1, 2, 3], default: 2 },
    tags: { type: [String], default: [] },
    hasLatex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });

export const Question = mongoose.model<IQuestion>('Question', questionSchema);
