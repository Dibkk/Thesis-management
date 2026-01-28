import mongoose, { Schema, model, Document } from 'mongoose';

interface IDownload extends Document {
  date: Date;
  user_id: string;
  thesis_id: string;
}

const userSchema = new Schema<IDownload>({
  date: { type: Date, default: Date.now() },
  user_id: { type: String, required: true },
  thesis_id: { type: String, required: true },
});

export const Download = mongoose.models.Download || mongoose.model('Download', userSchema)
