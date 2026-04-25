import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { Classroom } from '@/models/Classroom';
import { User } from '@/models/User';

/**
 * POST /api/classroom/join
 * Student joins a classroom using an invite code.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { joinCode } = await req.json();
    if (!joinCode || joinCode.trim().length === 0) {
      return NextResponse.json({ error: 'Join code is required' }, { status: 400 });
    }

    await dbConnect();

    const classroom = await Classroom.findOne({ joinCode: joinCode.trim().toUpperCase() });
    if (!classroom) {
      return NextResponse.json({ error: 'Invalid join code. Please check and try again.' }, { status: 404 });
    }

    // Check if already a member
    const studentId = session.user.id;
    if (classroom.studentIds.some((id: any) => id.toString() === studentId)) {
      return NextResponse.json({ error: 'You are already a member of this classroom.' }, { status: 400 });
    }

    // Check capacity
    if (classroom.studentIds.length >= classroom.maxStudents) {
      return NextResponse.json({ error: 'This classroom is full.' }, { status: 400 });
    }

    // Add student to classroom
    classroom.studentIds.push(studentId as any);
    await classroom.save();

    // Update student's classroomId
    await User.findByIdAndUpdate(studentId, { classroomId: classroom._id });

    return NextResponse.json({
      message: `Successfully joined "${classroom.name}"!`,
      classroom: {
        id: classroom._id.toString(),
        name: classroom.name,
        description: classroom.description,
      },
    });
  } catch (error) {
    console.error('Classroom Join Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
