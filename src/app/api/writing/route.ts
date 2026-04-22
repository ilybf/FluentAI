import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { WritingSubmission } from '@/models/WritingSubmission';
import { evaluateWriting } from '@/lib/ai/writing';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await req.json();
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Call the AI service
    const feedback = await evaluateWriting(text);

    await dbConnect();
    
    // Save submission
    const submission = new WritingSubmission({
      userId: session.user.id,
      originalText: text,
      correctedText: feedback.correctedText,
      score: feedback.score,
      feedback: {
        grammar: feedback.grammar,
        style: feedback.style
      }
    });
    
    await submission.save();

    // Update user score
    await User.findByIdAndUpdate(session.user.id, {
      $inc: { totalScore: feedback.score }
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Writing API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
