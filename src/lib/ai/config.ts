import { createOpenAI } from '@ai-sdk/openai';

// Ensure the OPENAI_API_KEY is available in the environment
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set in the environment variables.");
}

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  compatibility: 'strict', // strict mode for standard OpenAI API
});

export const defaultModel = openai('gpt-4o');
export const fastModel = openai('gpt-4o-mini');
