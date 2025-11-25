// app/api/thesis/upload/route.ts
import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
import { Thesis } from '@/lib/models/Thesis';
import path from 'path';
import fs from 'fs/promises'; 
import { cookies } from 'next/headers'; 
import jwt from 'jsonwebtoken';       
interface TokenPayload {
  id: string;
  role: string;
}


const uploadDir = path.join(process.cwd(), 'uploads');
async function saveFile(file: File) {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (e) {
    console.error("Failed to create upload dir", e);
    throw new Error("Failed to create storage directory.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name);
  const filename = `${Date.now()}-${file.name.replace(ext, "")}${ext}`;
  const filePath = path.join(uploadDir, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}


export async function POST(req: Request) {
  try {

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    const secureAuthorId = decoded.id; 

    await connectDatabase();

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;
    
    const advisor = data.get('advisor') as string;
    const title = data.get('title') as string;
    const abstract = data.get('abstract') as string;
    const keywords = data.get('keywords') as string;
    const category = data.get('category') as string;
    const year = data.get('year') as string;
    const department = data.get('department') as string;

    if (!file) {

      return NextResponse.json({ success: false, error: "File is required." }, { status: 400 });
    }
    if (!advisor || !title || !abstract) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }
    if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return NextResponse.json({ success: false, error: "Only .pdf or .docx files are allowed" }, { status: 400 });
    }

    const filePath = await saveFile(file);

    const lastThesis = await Thesis.findOne().sort({ createdAt: -1 }); 
    let nextIdNumber = 1;
    if (lastThesis && lastThesis.thesis_id) {
      const lastNum = parseInt(lastThesis.thesis_id.replace("TH", ""), 10);
      if (!isNaN(lastNum)) {
        nextIdNumber = lastNum + 1;
      }
    }
    const newThesisId = `TH${String(nextIdNumber).padStart(3, '0')}`;

    const thesis = await Thesis.create({
      thesis_id: newThesisId, 
      title: title,
      abstract: abstract,
      author: secureAuthorId, 
      advisor: advisor,
      file_path: filePath, 
      status: 'pending',
      isPublic: false,
      keywords: keywords,
      category: category,
      year: year,
      department: department,
    });

    return NextResponse.json({ success: true, thesis: thesis }, { status: 201 });

  } catch (error: any) {
    console.error('Upload error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 });
  }
}