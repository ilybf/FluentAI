import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { User } from '@/models/User';
import { ChatSession } from '@/models/ChatSession';
import { WritingSubmission } from '@/models/WritingSubmission';
import { VocabularyEntry } from '@/models/VocabularyEntry';
import { ScoreEvent } from '@/models/ScoreEvent';
import { getLevelProgress } from '@/lib/scoring';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const userId = session.user.id;

    // Run all queries in parallel for speed
    const [
      user,
      conversationCount,
      vocabularyCount,
      writingCount,
      recentEvents,
      scoreSummary,
    ] = await Promise.all([
      User.findById(userId).select('totalScore level registrationLevel streak').lean(),
      ChatSession.countDocuments({ userId }),
      VocabularyEntry.countDocuments({ userId }),
      WritingSubmission.countDocuments({ userId }),
      ScoreEvent.find({ userId })
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
      ScoreEvent.aggregate([
        { $match: { userId: { $eq: new (await import("mongoose")).Types.ObjectId(userId) } } },
        { $group: { _id: '$type', total: { $sum: '$points' }, count: { $sum: 1 } } },
      ]),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build score breakdown
    const scoreBreakdown: Record<string, { total: number; count: number }> = {};
    for (const entry of scoreSummary) {
      scoreBreakdown[entry._id] = { total: entry.total, count: entry.count };
    }

    // Level progress
    const levelProgress = getLevelProgress(user.totalScore, user.level, user.registrationLevel || 'A1');

    return NextResponse.json({
      totalScore: user.totalScore,
      level: user.level,
      streak: user.streak || { current: 0, longest: 0, lastActiveDate: '' },
      conversations: conversationCount,
      vocabularyWords: vocabularyCount,
      writingSubmissions: writingCount,
      levelProgress,
      scoreBreakdown,
      recentActivity: recentEvents.map((e: any) => ({
        id: e._id.toString(),
        type: e.type,
        points: e.points,
        details: e.metadata?.details || '',
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
