import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { WritingSubmission } from '@/models/WritingSubmission';
import { AIService } from '@/lib/ai/service';
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

    // Sanitize input length to prevent abuse
    const sanitizedText = text.trim().slice(0, 5000);

    // Call the AI service abstraction
    let feedback;
    try {
      feedback = await AIService.analyzeText(sanitizedText);
    } catch (aiError: any) {
      console.error('AI Analysis failed:', aiError);
      if (aiError?.message === 'RATE_LIMITED') {
        return NextResponse.json(
          { error: 'Too many requests. Please wait about a minute before trying again.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    await dbConnect();
    
    // Save submission
    const submission = new WritingSubmission({
      userId: session.user.id,
      originalText: sanitizedText,
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

    return NextResponse.json({
      score: feedback.score,
      correctedText: feedback.correctedText,
      feedback: {
        grammar: feedback.grammar,
        style: feedback.style,
      },
    });
  } catch (error) {
    console.error('Writing API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
