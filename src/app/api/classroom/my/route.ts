import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { Classroom } from '@/models/Classroom';
import { User } from '@/models/User';

/**
 * GET /api/classroom/my
 * Returns the classrooms the current student is enrolled in.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Find classrooms where this user is a member
    const classrooms = await Classroom.find({ studentIds: session.user.id })
      .select('name description joinCode teacherId maxStudents studentIds')
      .lean();

    // Get teacher names
    const teacherIds = classrooms.map((c: any) => c.teacherId);
    const teachers = await User.find({ _id: { $in: teacherIds } })
      .select('displayName')
      .lean();

    const teacherMap = new Map(teachers.map((t: any) => [t._id.toString(), t.displayName]));

    return NextResponse.json(classrooms.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description || '',
      teacherName: teacherMap.get(c.teacherId?.toString()) || 'Unknown',
      studentCount: c.studentIds?.length || 0,
      maxStudents: c.maxStudents || 30,
    })));
  } catch (error) {
    console.error('My Classrooms Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
