import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { WritingSubmission } from '@/models/WritingSubmission';
import { AIService } from '@/lib/ai/service';
import { awardXP, awardStreakBonus, XP } from '@/lib/scoring';

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

    // Award XP via scoring engine (replaces raw $inc)
    const xpResult = await awardXP(
      session.user.id,
      "writing",
      feedback.score * XP.WRITING_MULTIPLIER,
      {
        submissionId: submission._id.toString(),
        details: `Writing submission scored ${feedback.score}/100`,
        score: feedback.score,
      }
    );

    // Check for streak bonus
    await awardStreakBonus(session.user.id);

    return NextResponse.json({
      score: feedback.score,
      correctedText: feedback.correctedText,
      feedback: {
        grammar: feedback.grammar,
        style: feedback.style,
      },
      xp: {
        awarded: xpResult.awarded,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
      },
    });
  } catch (error) {
    console.error('Writing API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
