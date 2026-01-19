import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
import { User } from '@/lib/models/Users';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    await connectDatabase();

    // Check if an admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return NextResponse.json({ 
        success: false, 
        message: 'Admin account already exists. Please login with your existing admin credentials.' 
      }, { status: 400 });
    }

    // Create default admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const newAdmin = await User.create({
      user_id: 'admin',
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@example.com',
      role: 'admin',
      password: hashedPassword,
      department: 'System',
      bio: 'System Administrator'
    });

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully!',
      credentials: {
        email: 'admin@example.com',
        password: 'admin123'
      },
      note: 'Please delete this route (app/api/setup-admin/route.ts) after use for security.'
    });

  } catch (error: any) {
    console.error('Setup Admin Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
