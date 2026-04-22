import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { translateText, defineWordContext } from '@/lib/ai/translation';
import dbConnect from '@/lib/db/mongoose';
import { VocabularyEntry } from '@/models/VocabularyEntry';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, context, type } = await req.json();
    
    if (type === 'word' && context) {
      const definition = await defineWordContext(text, context, session.user.nativeLanguage);
      
      // Auto-save to vocabulary list
      await dbConnect();
      await VocabularyEntry.create({
        userId: session.user.id,
        word: text,
        contextSentence: context,
        translatedDefinition: definition
      });

      return NextResponse.json({ result: definition });
    } else {
      const translation = await translateText(text, session.user.nativeLanguage);
      return NextResponse.json({ result: translation });
    }
  } catch (error) {
    console.error('Translation API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
