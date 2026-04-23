import { generateText } from 'ai';
import { model } from './config';

export async function translateText(text: string, targetLanguage: string) {
  const result = await generateText({
    model,
    system: `You are a helpful translation assistant. Translate the following text into ${targetLanguage}. Provide only the direct translation with no additional text or explanations.`,
    prompt: text,
  });

  return result.text;
}

export async function defineWordContext(word: string, context: string, targetLanguage: string) {
  const result = await generateText({
    model,
    system: `You are an English teacher explaining vocabulary to a native ${targetLanguage} speaker. Provide a concise, clear definition of the word in its specific context. Translate the definition to ${targetLanguage}.`,
    prompt: `Word: "${word}"\nContext sentence: "${context}"`,
  });

  return result.text;
}
