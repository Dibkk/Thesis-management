// app/api/query/thesis/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
import { Thesis } from '@/lib/models/Thesis';
import { User } from '@/lib/models/Users'; 

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDatabase();
    // const id = params.id;
    const { id } = await params;

    const thesis = await Thesis.findById(id)
      .populate('author', 'firstName lastName email role department user_id')
      .populate('advisor', 'firstName lastName email');

    if (!thesis) {
      return NextResponse.json({ success: false, error: 'Thesis not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, thesis });

  } catch (error: any) {
    console.error('Get Thesis Detail Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}