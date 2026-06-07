import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProctorLog extends Document {
  userId: Types.ObjectId;
  attemptId: Types.ObjectId;
  violationType: string;
  timestamp: Date;
  details: any;
}

const proctorLogSchema = new Schema<IProctorLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  attemptId: { type: Schema.Types.ObjectId, ref: 'Attempt', required: true },
  violationType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: Schema.Types.Mixed }
});

export const ProctorLog = mongoose.model<IProctorLog>('ProctorLog', proctorLogSchema);
