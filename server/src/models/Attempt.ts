import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWrongTopic {
  questionId: Types.ObjectId;
  topic: string;
  subject: 'Physics' | 'Chemistry' | 'Math';
}

export interface IAttempt extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  answers: number[];
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  wrongTopics: IWrongTopic[];
  subjectBreakdown: {
    Physics: { correct: number; total: number };
    Chemistry: { correct: number; total: number };
    Math: { correct: number; total: number };
  };
  behavioralMetrics: {
    timeSpentPerQuestion: number[];
    confusionSpikes: number[];
    topicAccuracy: Map<string, number>;
  };
  completedAt: Date;
}

const wrongTopicSchema = new Schema<IWrongTopic>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    topic: { type: String, required: true },
    subject: { type: String, required: true, enum: ['Physics', 'Chemistry', 'Math'] },
  },
  { _id: false }
);

const subjectStatSchema = new Schema(
  {
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const attemptSchema = new Schema<IAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: { type: [Number], required: true },
    score: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
    accuracy: { type: Number, required: true, min: 0, max: 100 },
    timeTaken: { type: Number, required: true, min: 0 },
    wrongTopics: { type: [wrongTopicSchema], default: [] },
    subjectBreakdown: {
      Physics: { type: subjectStatSchema, default: () => ({ correct: 0, total: 0 }) },
      Chemistry: { type: subjectStatSchema, default: () => ({ correct: 0, total: 0 }) },
      Math: { type: subjectStatSchema, default: () => ({ correct: 0, total: 0 }) },
    },
    behavioralMetrics: {
      timeSpentPerQuestion: { type: [Number], default: [] },
      confusionSpikes: { type: [Number], default: [] },
      topicAccuracy: { type: Map, of: Number, default: {} },
    },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

attemptSchema.index({ userId: 1, completedAt: -1 });
attemptSchema.index({ quizId: 1 });
attemptSchema.index({ userId: 1, quizId: 1 });

export const Attempt = mongoose.model<IAttempt>('Attempt', attemptSchema);
