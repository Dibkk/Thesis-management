import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  academicYear: string;
  submissionDeadline: Date;
  maintenanceMode: boolean;
  announcement: string;
  // New Fields
  systemName: string;
  contactEmail: string;
  allowStudentRegistration: boolean;
  allowAdvisorRegistration: boolean;
  emailTemplateSubject: string;
  emailTemplateBody: string;
}

const SystemSettingsSchema = new mongoose.Schema<ISystemSettings>({
  academicYear: { type: String, default: new Date().getFullYear().toString() },
  submissionDeadline: { type: Date },
  maintenanceMode: { type: Boolean, default: false },
  announcement: { type: String, default: "" },
  // New Fields
  systemName: { type: String, default: "Thesis Management System" },
  contactEmail: { type: String, default: "admin@university.edu" },
  allowStudentRegistration: { type: Boolean, default: true },
  allowAdvisorRegistration: { type: Boolean, default: true },
  emailTemplateSubject: { type: String, default: "Thesis Update Notification" },
  emailTemplateBody: { type: String, default: "Dear User,\n\nThere is an update regarding your thesis." },
}, { timestamps: true });

export const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);
