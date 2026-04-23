import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Ensure the GOOGLE_GENERATIVE_AI_API_KEY is available in the environment
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set in the environment variables.");
}

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

// Single model export — avoids duplicate instance allocation
export const model = google('gemini-2.0-flash');
