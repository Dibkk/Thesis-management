
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { connectDatabase } from "@/lib/databaseconnect";
import mongoose from "mongoose";
import { Thesis } from '@/lib/models/Thesis';

const uploadDir = path.join(process.cwd(), "uploads");

// สร้างโฟลเดอร์เก็บไฟล์ถ้ายังไม่มี
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
}).single("file");

// === สร้าง schema สำหรับ metadata ===
const thesisSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  file_path: String,
  upload_date: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
});

const Thesis = mongoose.models.Thesis || mongoose.model("Thesis", thesisSchema);

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDatabase();

  upload(req as any, res as any, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { title, user_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const newThesis = new Thesis({
      user_id,
      title,
      file_path: `/uploads/${file.filename}`,
    });

    await newThesis.save();

    res.status(200).json({
      message: "PDF uploaded and metadata saved",
      thesis: newThesis,
    });
  });
}
