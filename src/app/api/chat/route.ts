import { AIService } from '@/lib/ai/service';
import { TUTOR_SYSTEM_PROMPT } from '@/lib/ai/tutor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { ChatSession } from '@/models/ChatSession';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();

    await dbConnect();
    
    // Find or create chat session
    let chatSession = await ChatSession.findOne({ userId: session.user.id });
    if (!chatSession) {
      chatSession = new ChatSession({ userId: session.user.id, messages: [] });
    }

    // Save the user's latest message
    const lastMessage = messages[messages.length - 1];
    chatSession.messages.push({
      role: 'user',
      content: lastMessage.content,
      timestamp: new Date()
    });
    await chatSession.save();

    const systemPrompt = TUTOR_SYSTEM_PROMPT + `\nThe user's native language is ${session.user.nativeLanguage} and their English level is ${session.user.level}.`;
    
    // Use the abstraction layer
    const streamResponse = await AIService.getChatStream(messages, systemPrompt);
    
    return streamResponse;
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
