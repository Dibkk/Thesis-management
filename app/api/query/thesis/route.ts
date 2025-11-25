// app/api/query/thesis/route.ts
import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
import { Thesis } from '@/lib/models/Thesis';
import { User } from '@/lib/models/Users'; 

export const dynamic = 'force-dynamic'; 

export async function GET(req: Request) {
  try {
    await connectDatabase();

    // ดึง Thesis ทั้งหมด
    const theses = await Thesis.find({}) 
      .populate('author', 'firstName lastName') 
      .populate('advisor', 'firstName lastName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, theses });

  } catch (error: any) {
    console.error('Query Thesis Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}