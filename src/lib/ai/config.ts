import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';

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
export const model = google('gemini-2.5-flash');

// Fallback model: Groq (used when Gemini is rate-limited)
export const fallbackModel = groq('llama-3.3-70b-versatile');
