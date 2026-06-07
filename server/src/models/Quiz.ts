import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuiz extends Document {
  title: string;
  subject: 'Physics' | 'Chemistry' | 'Math' | 'Mixed';
  difficulty: 1 | 2 | 3;
  timeLimitSeconds: number;
  questions: Types.ObjectId[];
  createdBy: Types.ObjectId;
  shareToken: string;
  isPublic: boolean;
  generatedByAI: boolean;
  originalPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subject: {
      type: String,
      required: true,
      enum: ['Physics', 'Chemistry', 'Math', 'Mixed'],
      default: 'Mixed',
    },
    difficulty: { type: Number, enum: [1, 2, 3], default: 2 },
    timeLimitSeconds: { type: Number, default: 10800, min: 60 },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shareToken: { type: String, unique: true, sparse: true },
    isPublic: { type: Boolean, default: false },
    generatedByAI: { type: Boolean, default: false },
    originalPrompt: { type: String },
  },
  { timestamps: true }
);

quizSchema.index({ shareToken: 1 });
quizSchema.index({ createdBy: 1, createdAt: -1 });
quizSchema.index({ subject: 1, difficulty: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
