import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import type { LanguageModelV1 } from 'ai';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set in the environment variables.");
}

if (!process.env.GROQ_API_KEY) {
  console.warn("GROQ_API_KEY is not set in the environment variables. Groq fallback will not be available.");
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || '',
});

// Primary model: Gemini 2.5 Flash
// Cast needed: @ai-sdk/google v1.2+ returns LanguageModelV3 but streamText/generateObject expect LanguageModelV1.
// The AI SDK handles both at runtime — this is a compile-time-only concern.
export const model = google('gemini-2.5-flash') as unknown as LanguageModelV1;

// Fallback model: Groq (used when Gemini is rate-limited)
export const fallbackModel = groq('llama-3.3-70b-versatile') as unknown as LanguageModelV1;
