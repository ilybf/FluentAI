import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Ensure the GOOGLE_GENERATIVE_AI_API_KEY is available in the environment
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set in the environment variables.");
}

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

// We can use Gemini 2.5 Flash for both since it is incredibly fast and highly capable
export const defaultModel = google('gemini-2.5-flash');
export const fastModel = google('gemini-2.5-flash');
