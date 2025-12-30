// app/api/query/thesis/route.ts
import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
// We'll dynamically import models after connecting to ensure their schemas
// are registered on the active mongoose instance used by `connectDatabase()`.

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDatabase();

    // Ensure models are loaded and registered with mongoose used by connectDatabase()
    const { Thesis } = await import('@/lib/models/Thesis');
    await import('@/lib/models/Users');

    const Theses = await Thesis.find({ status: 'approved', isPublic: true })
      .populate('author', 'firstName lastName')
      .populate('advisor', 'firstName lastName')
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({ success: true, theses: Theses });

  } catch (error: any) {
    console.error('Query Thesis Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}