// lib/models/Thesis.ts
import mongoose, { Schema, model, Document, Types } from 'mongoose';
interface IThesis extends Document {
  thesis_id: string;      
  title: string;
  abstract: string;   
  author: Types.ObjectId; 
  advisor: Types.ObjectId;
  file_path: string;   
  isPublic: boolean;    
  keywords?: string;    
  category?: string;    
  year?: string;        
  department?: string;  
  createdAt: Date;
  updatedAt: Date;
}

const ThesisSchema = new Schema<IThesis>({
  thesis_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  advisor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  file_path: { type: String, required: true },
  status: { type: String, required: true, default: 'pending' },
  isPublic: { type: Boolean, default: false },

  keywords: { type: String },
  category: { type: String },
  year: { type: String },
  department: { type: String },
  
}, { timestamps: true }); // (timestamps: true จะสร้าง createdAt และ updatedAt ให้อัตโนมัติ)

export const Thesis = mongoose.models.Thesis || mongoose.model<IThesis>('Thesis', ThesisSchema);