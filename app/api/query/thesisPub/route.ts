// app/api/query/thesis/route.ts
import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
import { Thesis } from '@/lib/models/Thesis';
import { User } from '@/lib/models/Users';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDatabase();

    const Theses = await Thesis.find({ status: 'approved', isPublic:'true' })
      .populate('author', 'firstName lastName')
      .populate('advisor', 'firstName lastName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, theses: Theses });

  } catch (error: any) {
    console.error('Query Thesis Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}