import { generateText } from 'ai';
import { model, fallbackModel } from './config';

/**
 * Attempts a generateText call with the primary model (Gemini).
 * Falls back to Groq if the primary call throws a rate-limit error.
 */
async function generateWithFallback(options: Parameters<typeof generateText>[0]): Promise<string> {
  try {
    const result = await generateText(options);
    return result.text;
  } catch (error: any) {
    const msg = (error?.message || '').toLowerCase();
    const status = error?.status || error?.statusCode || error?.response?.status;
    const isRateLimited = msg.includes('rate') || msg.includes('quota') || msg.includes('429') || status === 429;

    if (isRateLimited) {
      console.log('[AI Fallback] Gemini rate-limited, falling back to Groq for translation');
      const fallbackResult = await generateText({
        ...options,
        model: fallbackModel,
      });
      return fallbackResult.text;
    }
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string) {
  return generateWithFallback({
    model,
    system: `You are a helpful translation assistant. Translate the following text into ${targetLanguage}. Provide only the direct translation with no additional text or explanations.`,
    prompt: text,
  });
}

export async function defineWordContext(word: string, context: string, targetLanguage: string) {
  return generateWithFallback({
    model,
    system: `You are an English teacher explaining vocabulary to a native ${targetLanguage} speaker. Provide a concise, clear definition of the word in its specific context. Translate the definition to ${targetLanguage}.`,
    prompt: `Word: "${word}"\nContext sentence: "${context}"`,
  });
}
