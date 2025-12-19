import mongoose, { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  user_id?: string;
  email: string;
  password: string;
  role: string;
  department: string;
  firstName: string;
  lastName: string;
  bio: string;
  lastLogin?: Date;
  lineId?: string;
}

const userSchema = new Schema<IUser>({
  user_id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  bio: { type: String },
  lastLogin: { type: Date },
  lineId: { type: String },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema)
