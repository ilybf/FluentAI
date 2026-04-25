import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/guards';
import dbConnect from '@/lib/db/mongoose';
import { Classroom, generateJoinCode } from '@/models/Classroom';
import { User } from '@/models/User';

/**
 * GET /api/admin/classrooms — List all classrooms with teacher info.
 */
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    await dbConnect();
    const classrooms = await Classroom.find().sort({ createdAt: -1 }).lean();

    const teacherIds = [...new Set(classrooms.map((c: any) => c.teacherId?.toString()).filter(Boolean))];
    const teachers = await User.find({ _id: { $in: teacherIds } }).select('displayName email').lean();
    const teacherMap = new Map(teachers.map((t: any) => [t._id.toString(), { name: t.displayName, email: t.email }]));

    return NextResponse.json(classrooms.map((c: any) => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description || '',
      joinCode: c.joinCode,
      teacherId: c.teacherId?.toString() || null,
      teacherName: teacherMap.get(c.teacherId?.toString())?.name || 'Unassigned',
      teacherEmail: teacherMap.get(c.teacherId?.toString())?.email || '',
      studentCount: c.studentIds?.length || 0,
      maxStudents: c.maxStudents || 30,
      studentIds: c.studentIds?.map((id: any) => id.toString()) || [],
      createdAt: c.createdAt,
    })));
  } catch (error) {
    console.error('Admin Classrooms GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/classrooms — Create a classroom (optionally assign a teacher).
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { name, description, teacherId } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Classroom name required' }, { status: 400 });

    await dbConnect();

    let joinCode = generateJoinCode();
    let attempts = 0;
    while (await Classroom.findOne({ joinCode }) && attempts < 10) {
      joinCode = generateJoinCode(); attempts++;
    }

    const classroom = await Classroom.create({
      teacherId: teacherId || auth.session.user.id,
      name: name.trim().slice(0, 100),
      description: (description || '').trim().slice(0, 500),
      joinCode,
    });

    return NextResponse.json({
      id: classroom._id.toString(),
      name: classroom.name,
      joinCode: classroom.joinCode,
      teacherId: classroom.teacherId?.toString(),
      studentCount: 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Admin Classrooms POST:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/classrooms — Edit a classroom (reassign teacher, rename, etc.).
 */
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const { classroomId, name, description, teacherId } = await req.json();
    if (!classroomId) return NextResponse.json({ error: 'classroomId required' }, { status: 400 });

    await dbConnect();

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim().slice(0, 100);
    if (description !== undefined) updateData.description = description.trim().slice(0, 500);
    if (teacherId !== undefined) updateData.teacherId = teacherId;

    const updated = await Classroom.findByIdAndUpdate(classroomId, updateData, { new: true }).lean();
    if (!updated) return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });

    return NextResponse.json({ message: 'Classroom updated' });
  } catch (error) {
    console.error('Admin Classrooms PUT:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/classrooms?id=xxx — Delete a classroom, unlink students.
 */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.authorized) return auth.response;

  try {
    const classroomId = new URL(req.url).searchParams.get('id');
    if (!classroomId) return NextResponse.json({ error: 'Classroom ID required' }, { status: 400 });

    await dbConnect();

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });

    // Unlink all students
    if (classroom.studentIds.length > 0) {
      await User.updateMany(
        { _id: { $in: classroom.studentIds } },
        { $set: { classroomId: null } }
      );
    }

    await Classroom.findByIdAndDelete(classroomId);
    return NextResponse.json({ message: 'Classroom deleted' });
  } catch (error) {
    console.error('Admin Classrooms DELETE:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
