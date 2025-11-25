// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
import { User } from '@/lib/models/Users';
import { cookies } from 'next/headers'; 
import jwt from 'jsonwebtoken';     
interface TokenPayload {
  id: string;
  role: string;
}

export async function PUT(req: Request) {
  try {
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    const secureUserId = decoded.id; 
   

    await connectDatabase();
    
   
    const body = await req.json();
    const { firstname, lastname, email, department, user_id, bio } = body;

    
    const updatedUser = await User.findByIdAndUpdate(
      secureUserId, 
      {
        firstName: firstname,
        lastName: lastname,
        email: email,
        department: department,
        user_id: user_id, 
        bio: bio
      },
      { new: true } 
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        firstname: updatedUser.firstName,
        lastname: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        department: updatedUser.department,
        user_id: updatedUser.user_id
      },
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}