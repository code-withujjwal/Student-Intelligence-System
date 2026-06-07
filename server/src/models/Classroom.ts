import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClassroom extends Document {
  name: string;
  inviteCode: string;
  teacherId: Types.ObjectId;
  students: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const classroomSchema = new Schema<IClassroom>({
  name: { type: String, required: true, trim: true },
  inviteCode: { type: String, required: true, unique: true, uppercase: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const Classroom = mongoose.model<IClassroom>('Classroom', classroomSchema);
