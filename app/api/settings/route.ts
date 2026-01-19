import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/databaseconnect';
import { SystemSettings } from '@/lib/models/SystemSettings';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    await connectDatabase();
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Fetch Settings Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    await connectDatabase(); // Ensure database is connected before operations

    const { 
      academicYear, 
      submissionDeadline, 
      maintenanceMode, 
      announcement,
      systemName,
      contactEmail,
      allowStudentRegistration,
      allowAdvisorRegistration,
      emailTemplateSubject,
      emailTemplateBody
    } = await req.json();

    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = new SystemSettings({
        academicYear,
        submissionDeadline,
        maintenanceMode,
        announcement,
        systemName,
        contactEmail,
        allowStudentRegistration,
        allowAdvisorRegistration,
        emailTemplateSubject,
        emailTemplateBody
      });
    } else {
      settings.academicYear = academicYear;
      settings.submissionDeadline = submissionDeadline;
      settings.maintenanceMode = maintenanceMode;
      settings.announcement = announcement;
      settings.systemName = systemName;
      settings.contactEmail = contactEmail;
      settings.allowStudentRegistration = allowStudentRegistration;
      settings.allowAdvisorRegistration = allowAdvisorRegistration;
      settings.emailTemplateSubject = emailTemplateSubject;
      settings.emailTemplateBody = emailTemplateBody;
    }

    await settings.save();

    return NextResponse.json({ success: true, settings });

  } catch (error: any) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
