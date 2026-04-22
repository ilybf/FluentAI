import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from './config';

export async function evaluateWriting(text: string) {
  const result = await generateObject({
    model: defaultModel,
    schema: z.object({
      score: z.number().min(0).max(100).describe('An overall score from 0 to 100 representing the quality of the English writing.'),
      correctedText: z.string().describe('The completely corrected version of the text.'),
      grammar: z.array(z.string()).describe('A list of grammar corrections and explanations.'),
      style: z.array(z.string()).describe('A list of style, tone, and vocabulary improvements.'),
    }),
    system: "You are an expert English teacher. Analyze the user's text and provide a corrected version, a score out of 100, and specific feedback on grammar and style.",
    prompt: `Analyze the following text written by an English learner:\n\n"${text}"`,
  });

  return result.object;
}
