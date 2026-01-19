import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
import { User } from '@/lib/models/Users';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await connectDatabase();
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const body = await req.json();
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
  
      if (!token) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (decoded.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
  
      await connectDatabase();
      const updatedUser = await User.findByIdAndUpdate(id, body, { new: true }).select('-password');
  
      if (!updatedUser) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Update User Error:', error);
      return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
  }
