// app/api/thesis/advisor/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { connectDatabase } from '@/lib/databaseconnect';
import { Thesis } from '@/lib/models/Thesis';
import { User } from '@/lib/models/Users'; 

interface TokenPayload {
  id: string;
  role: string;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    if (decoded.role !== 'advisor') {
        return NextResponse.json({ success: false, error: 'Authorized for Advisor only' }, { status: 403 });
    }

    await connectDatabase();
    const theses = await Thesis.find({ advisor: decoded.id })
      .populate('author', 'firstName lastName email user_id department') 
      .sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, theses });

  } catch (error: any) {
    console.error('API Advisor Thesis Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}