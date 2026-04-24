import { streamText, generateObject } from 'ai';
import { z } from 'zod';
import { model } from './config';

// Pre-defined schemas — allocated once at module load, not per-request
const writingFeedbackSchema = z.object({
  score: z.number().min(0).max(100),
  correctedText: z.string(),
  grammar: z.array(z.string()),
  style: z.array(z.string()),
});

const readingPassageSchema = z.object({
  title: z.string().describe('A short, engaging title for the reading passage'),
  content: z.string().describe('The reading passage text, 150-400 words depending on level'),
  questions: z.array(z.object({
    text: z.string().describe('A comprehension question about the passage'),
    options: z.array(z.string()).length(4).describe('Four multiple-choice options'),
    correctIndex: z.number().min(0).max(3).describe('Index of the correct answer (0-3)'),
  })).length(3).describe('Exactly 3 comprehension questions'),
});

const ANALYSIS_SYSTEM_PROMPT = "You are an expert English teacher. Analyze the user's text and provide a corrected version, a score out of 100, and specific feedback on grammar and style.";

const READING_SYSTEM_PROMPT = `You are an expert English language educator who creates reading comprehension materials for learners at specific CEFR levels. 

Your passages must:
- Match the vocabulary and grammar complexity of the target CEFR level exactly
- Cover diverse, engaging real-world topics (science, culture, technology, history, daily life, nature, health, travel, etc.)
- Never repeat the same topic or title if given previously used titles
- Include 3 multiple-choice comprehension questions with exactly 4 options each
- Have only ONE clearly correct answer per question
- A1: Very simple sentences, basic vocabulary, present tense. ~150 words.
- A2: Simple sentences, common vocabulary, past tense allowed. ~180 words.
- B1: Compound sentences, moderate vocabulary, varied tenses. ~250 words.
- B2: Complex sentences, academic vocabulary, passive voice, conditionals. ~300 words.
- C1: Sophisticated structures, nuanced arguments, abstract concepts. ~350 words.
- C2: Near-native complexity, rhetorical devices, specialized vocabulary. ~400 words.`;

/**
 * Simple sliding-window rate limiter.
 * Free Gemini API — 5 RPM as a safety net against runaway requests.
 */
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const requestTimestamps: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  // Remove timestamps outside the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // rate limited
  }
  requestTimestamps.push(now);
  return true;
}

/**
 * AI Service Layer
 * Abstracts the provider (Gemini 2.5 Flash) from the route logic.
 * 
 * Key: maxRetries is set to 0 everywhere to prevent the AI SDK from
 * auto-retrying on 429/503 — on a free-tier API key every retry counts
 * against the quota and causes a cascade of failures.
 */
export class AIService {
  static async getChatStream(messages: any[], systemPrompt: string, onFinish?: (completion: string) => Promise<void>) {
    if (!checkRateLimit()) {
      throw new Error('RATE_LIMITED');
    }
    try {
      const result = streamText({
        model,
        system: systemPrompt,
        messages,
        maxRetries: 0,
        onFinish: async ({ text }) => {
          if (onFinish) {
            await onFinish(text);
          }
        }
      });
      return result.toDataStreamResponse();
    } catch (error) {
      console.error('AIService Chat Error:', error);
      throw new Error('Failed to generate chat stream');
    }
  }

  static async analyzeText(text: string) {
    if (!checkRateLimit()) {
      throw new Error('RATE_LIMITED');
    }
    try {
      const result = await generateObject({
        model,
        schema: writingFeedbackSchema,
        system: ANALYSIS_SYSTEM_PROMPT,
        prompt: `Analyze the following text written by an English learner:\n\n"${text}"`,
        maxRetries: 0,
      });
      return result.object;
    } catch (error) {
      console.error('AIService Analysis Error:', error);
      throw new Error('Failed to analyze text');
    }
  }

  /**
   * Generates a new reading passage + 3 comprehension questions for a given CEFR level.
   * @param level - CEFR level (A1, A2, B1, B2, C1, C2)
   * @param avoidTitles - Titles already in the DB to avoid repeating topics
   */
  static async generateReadingPassage(level: string, avoidTitles: string[] = []) {
    if (!checkRateLimit()) {
      throw new Error('RATE_LIMITED');
    }
    try {
      const avoidClause = avoidTitles.length > 0
        ? `\n\nDo NOT use any of these topics or titles (already used): ${avoidTitles.join(', ')}`
        : '';

      const result = await generateObject({
        model,
        schema: readingPassageSchema,
        system: READING_SYSTEM_PROMPT,
        prompt: `Generate a new reading comprehension passage for CEFR level ${level}. Choose a fresh, interesting topic.${avoidClause}`,
        maxRetries: 0,
      });
      return result.object;
    } catch (error) {
      console.error('AIService Reading Generation Error:', error);
      throw new Error('Failed to generate reading passage');
    }
  }
}
