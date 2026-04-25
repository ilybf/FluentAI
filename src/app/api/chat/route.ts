import { AIService } from '@/lib/ai/service';
import { TUTOR_SYSTEM_PROMPT } from '@/lib/ai/tutor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { ChatSession } from '@/models/ChatSession';
import { NextRequest } from 'next/server';
import { awardXP, awardStreakBonus, XP } from '@/lib/scoring';

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

    const { messages, sessionId } = await req.json();
    await dbConnect();
    
    const lastMessage = messages[messages.length - 1];
    
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      // Create new session
      const title = lastMessage.content.slice(0, 40) + (lastMessage.content.length > 40 ? '...' : '');
      const newSession = await ChatSession.create({
        userId: session.user.id,
        title: title || 'New Conversation',
        messages: [{ role: 'user', content: lastMessage.content, timestamp: new Date() }],
      });
      activeSessionId = newSession._id;
    } else {
      // Append to existing
      await ChatSession.findByIdAndUpdate(
        activeSessionId,
        {
          $push: {
            messages: {
              $each: [{ role: 'user', content: lastMessage.content, timestamp: new Date() }],
              $slice: -MAX_STORED_MESSAGES,
            },
          },
          $set: { lastActive: new Date() },
        }
      );
    }

    const systemPrompt = TUTOR_SYSTEM_PROMPT + `\nThe user's native language is ${session.user.nativeLanguage} and their English level is ${session.user.level}.`;
    const trimmedMessages = messages.slice(-MAX_AI_CONTEXT_MESSAGES);
    const streamResponse = await AIService.getChatStream(trimmedMessages, systemPrompt, async (completion) => {
      await ChatSession.findByIdAndUpdate(
        activeSessionId,
        {
          $push: {
            messages: {
              $each: [{ role: 'assistant', content: completion, timestamp: new Date() }],
              $slice: -MAX_STORED_MESSAGES,
            },
          },
        }
      ).catch(err => console.error("Failed to save AI response to DB", err));
    });
    
    // Add sessionId to headers so the client knows which session was updated/created
    streamResponse.headers.set('X-Session-Id', activeSessionId.toString());

    // Award XP for the user message (fire-and-forget, don't block the stream)
    awardXP(session.user.id, "chat", XP.CHAT_PER_MESSAGE, {
      submissionId: activeSessionId.toString(),
      details: "Chat message sent",
    }).catch(err => console.error("Chat XP award failed:", err));

    // Check for streak bonus (fire-and-forget)
    awardStreakBonus(session.user.id).catch(err => console.error("Streak bonus failed:", err));

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

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const chatSession = await ChatSession.findOne({ _id: sessionId, userId: session.user.id });
      if (!chatSession) {
        return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      const formattedMessages = chatSession.messages.map((m: any) => ({
        id: m._id?.toString() || Math.random().toString(),
        role: m.role,
        content: m.content,
      }));
      return new Response(JSON.stringify(formattedMessages), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } else {
      // List all sessions for user
      const sessions = await ChatSession.find({ userId: session.user.id })
        .sort({ lastActive: -1 })
        .select('_id title lastActive');
      return new Response(JSON.stringify(sessions), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error: any) {
    console.error('Chat API GET Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return new Response('Missing sessionId', { status: 400 });
    }

    const result = await ChatSession.deleteOne({ _id: sessionId, userId: session.user.id });
    if (result.deletedCount === 0) {
      return new Response('Session not found', { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error('Chat API DELETE Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
