import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { VocabularyEntry } from '@/models/VocabularyEntry';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const entries = await VocabularyEntry.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Vocabulary GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { word, contextSentence, translatedDefinition } = await req.json();

    if (!word || !contextSentence || !translatedDefinition) {
      return NextResponse.json(
        { error: 'word, contextSentence, and translatedDefinition are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const entry = new VocabularyEntry({
      userId: session.user.id,
      word: word.trim().slice(0, 100),
      contextSentence: contextSentence.trim().slice(0, 500),
      translatedDefinition: translatedDefinition.trim().slice(0, 500),
    });

    await entry.save();

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Vocabulary POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await dbConnect();
    const result = await VocabularyEntry.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!result) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vocabulary DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
