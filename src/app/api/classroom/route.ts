import { NextResponse, NextRequest } from 'next/server';
import { requireTeacher } from '@/lib/guards';
import dbConnect from '@/lib/db/mongoose';
import { Classroom, generateJoinCode } from '@/models/Classroom';
import { User } from '@/models/User';

/**
 * GET /api/classroom
 * Returns the teacher's classrooms.
 */
export async function GET() {
  const auth = await requireTeacher();
  if (!auth.authorized) return auth.response;

  try {
    await dbConnect();
    const classrooms = await Classroom.find({ teacherId: auth.session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(classrooms.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description,
      joinCode: c.joinCode,
      studentCount: c.studentIds?.length || 0,
      maxStudents: c.maxStudents,
      createdAt: c.createdAt,
    })));
  } catch (error) {
    console.error('Classroom GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/classroom
 * Creates a new classroom for the teacher.
 */
export async function POST(req: NextRequest) {
  const auth = await requireTeacher();
  if (!auth.authorized) return auth.response;

  try {
    const { name, description } = await req.json();
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Classroom name is required' }, { status: 400 });
    }

    await dbConnect();

    // Generate a unique join code
    let joinCode = generateJoinCode();
    let attempts = 0;
    while (await Classroom.findOne({ joinCode }) && attempts < 10) {
      joinCode = generateJoinCode();
      attempts++;
    }

    const classroom = await Classroom.create({
      teacherId: auth.session.user.id,
      name: name.trim().slice(0, 100),
      description: (description || '').trim().slice(0, 500),
      joinCode,
    });

    return NextResponse.json({
      id: classroom._id.toString(),
      name: classroom.name,
      description: classroom.description,
      joinCode: classroom.joinCode,
      studentCount: 0,
      maxStudents: classroom.maxStudents,
    }, { status: 201 });
  } catch (error) {
    console.error('Classroom POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/classroom?id=xxx
 * Deletes a classroom and removes all student associations.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireTeacher();
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get('id');

    if (!classroomId) {
      return NextResponse.json({ error: 'Classroom ID is required' }, { status: 400 });
    }

    await dbConnect();

    // Verify this classroom belongs to the teacher
    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacherId: auth.session.user.id,
    });

    if (!classroom) {
      return NextResponse.json({ error: 'Classroom not found or not yours' }, { status: 404 });
    }

    // Remove classroomId from all students in this class
    if (classroom.studentIds.length > 0) {
      await User.updateMany(
        { _id: { $in: classroom.studentIds } },
        { $set: { classroomId: null } }
      );
    }

    // Delete the classroom
    await Classroom.findByIdAndDelete(classroomId);

    return NextResponse.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    console.error('Classroom DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
