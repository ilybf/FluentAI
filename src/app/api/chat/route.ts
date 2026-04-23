import { AIService } from '@/lib/ai/service';
import { TUTOR_SYSTEM_PROMPT } from '@/lib/ai/tutor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { ChatSession } from '@/models/ChatSession';
import { NextRequest } from 'next/server';

// Cap the number of messages sent to the AI to avoid unbounded token/memory usage
const MAX_AI_CONTEXT_MESSAGES = 30;
// Cap total stored messages per session to bound DB document size
const MAX_STORED_MESSAGES = 200;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();

    await dbConnect();
    
    // Use atomic $push with $slice to cap stored messages — avoids loading entire doc into memory
    const lastMessage = messages[messages.length - 1];
    await ChatSession.findOneAndUpdate(
      { userId: session.user.id },
      {
        $push: {
          messages: {
            $each: [{ role: 'user', content: lastMessage.content, timestamp: new Date() }],
            $slice: -MAX_STORED_MESSAGES, // Keep only the latest N messages
          },
        },
        $set: { lastActive: new Date() },
      },
      { upsert: true } // Create session if it doesn't exist
    );

    const systemPrompt = TUTOR_SYSTEM_PROMPT + `\nThe user's native language is ${session.user.nativeLanguage} and their English level is ${session.user.level}.`;
    
    // Send only the most recent messages to the AI to limit token usage
    const trimmedMessages = messages.slice(-MAX_AI_CONTEXT_MESSAGES);
    const streamResponse = await AIService.getChatStream(trimmedMessages, systemPrompt);
    
    return streamResponse;
  } catch (error: any) {
    console.error('Chat API Error:', error);
    if (error?.message === 'RATE_LIMITED') {
      return new Response(JSON.stringify({ error: 'You are sending messages too fast. Please wait a moment and try again.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}
