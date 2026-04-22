import { streamText, generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from './config';

/**
 * AI Service Layer
 * Abstracts the provider (Gemini 2.5 Flash) from the route logic.
 */
export class AIService {
  static async getChatStream(messages: any[], systemPrompt: string) {
    try {
      const result = streamText({
        model: defaultModel,
        system: systemPrompt,
        messages,
      });
      return result.toDataStreamResponse();
    } catch (error) {
      console.error('AIService Chat Error:', error);
      throw new Error('Failed to generate chat stream');
    }
  }

  static async analyzeText(text: string) {
    try {
      const result = await generateObject({
        model: defaultModel,
        schema: z.object({
          score: z.number().min(0).max(100),
          correctedText: z.string(),
          grammar: z.array(z.string()),
          style: z.array(z.string()),
        }),
        system: "You are an expert English teacher. Analyze the user's text and provide a corrected version, a score out of 100, and specific feedback on grammar and style.",
        prompt: `Analyze the following text written by an English learner:\n\n"${text}"`,
      });
      return result.object;
    } catch (error) {
      console.error('AIService Analysis Error:', error);
      throw new Error('Failed to analyze text');
    }
  }
}
