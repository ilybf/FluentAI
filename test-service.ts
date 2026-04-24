import { AIService } from './src/lib/ai/service';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const res = await AIService.analyzeText("I is very happy today!");
    console.log("Success:", res);
  } catch (e) {
    console.error("Failed:", e);
  }
}
run();
