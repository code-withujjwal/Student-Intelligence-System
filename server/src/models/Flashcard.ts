import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFlashcard extends Document {
  userId: Types.ObjectId;
  originalQuestionId: Types.ObjectId;
  subject: 'Physics' | 'Chemistry' | 'Math';
  front: string;
  back: string;
  tags: string[];
  reviewCount: number;
  nextReviewAt: Date;
  difficulty: 1 | 2 | 3;
  createdAt: Date;
  updatedAt: Date;
}

const flashcardSchema = new Schema<IFlashcard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalQuestionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    subject: {
      type: String,
      required: true,
      enum: ['Physics', 'Chemistry', 'Math'],
    },
    front: { type: String, required: true },
    back: { type: String, required: true },
    tags: { type: [String], default: [] },
    reviewCount: { type: Number, default: 0, min: 0 },
    nextReviewAt: { type: Date, default: Date.now },
    difficulty: { type: Number, enum: [1, 2, 3], default: 2 },
  },
  { timestamps: true }
);

flashcardSchema.index({ userId: 1, nextReviewAt: 1 });
flashcardSchema.index({ userId: 1, subject: 1 });
flashcardSchema.index({ originalQuestionId: 1 }, { unique: true, sparse: true });

export const Flashcard = mongoose.model<IFlashcard>('Flashcard', flashcardSchema);
