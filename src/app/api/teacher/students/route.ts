import { NextResponse, NextRequest } from 'next/server';
import { requireTeacher } from '@/lib/guards';
import dbConnect from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { Classroom } from '@/models/Classroom';
import { ScoreEvent } from '@/models/ScoreEvent';
import { WritingSubmission } from '@/models/WritingSubmission';
import { ChatSession } from '@/models/ChatSession';
import { VocabularyEntry } from '@/models/VocabularyEntry';
import mongoose from 'mongoose';

/**
 * GET /api/teacher/students
 * Returns all students in the teacher's classroom(s) with summary stats.
 */
export async function GET() {
  const auth = await requireTeacher();
  if (!auth.authorized) return auth.response;

  try {
    await dbConnect();

    const teacherId = auth.session.user.id;

    // Find the teacher's classroom(s)
    const classrooms = await Classroom.find({ teacherId }).lean();
    const allStudentIds = classrooms.flatMap(c => c.studentIds);

    if (allStudentIds.length === 0) {
      return NextResponse.json({
        students: [],
        classrooms: classrooms.map(c => ({
          id: (c as any)._id.toString(),
          name: c.name,
          joinCode: c.joinCode,
          studentCount: c.studentIds.length,
          maxStudents: c.maxStudents,
        })),
      });
    }

    // Fetch all students
    const students = await User.find({ _id: { $in: allStudentIds } })
      .select('displayName email level totalScore avatarUrl streak createdAt')
      .lean();

    // Fetch per-student counts in parallel
    const enrichedStudents = await Promise.all(
      students.map(async (student: any) => {
        const sid = student._id.toString();
        const objId = new mongoose.Types.ObjectId(sid);

        const [writingCount, chatCount, vocabCount, recentEvents] = await Promise.all([
          WritingSubmission.countDocuments({ userId: sid }),
          ChatSession.countDocuments({ userId: sid }),
          VocabularyEntry.countDocuments({ userId: sid }),
          ScoreEvent.find({ userId: objId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('type points metadata.details createdAt')
            .lean(),
        ]);

        return {
          ...student,
          _id: sid,
          writingCount,
          chatCount,
          vocabCount,
          recentEvents: recentEvents.map((e: any) => ({
            type: e.type,
            points: e.points,
            details: e.metadata?.details || '',
            createdAt: e.createdAt,
          })),
        };
      })
    );

    // Sort by totalScore descending
    enrichedStudents.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

    return NextResponse.json({
      students: enrichedStudents,
      classrooms: classrooms.map(c => ({
        id: (c as any)._id.toString(),
        name: c.name,
        joinCode: c.joinCode,
        studentCount: c.studentIds.length,
        maxStudents: c.maxStudents,
      })),
    });
  } catch (error) {
    console.error('Teacher Students API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
