import { AIService } from './src/lib/ai/service';

async function run() {
  try {
    const res = await AIService.analyzeText("I is very good at English.");
    console.log(res);
  } catch(e) {
    console.error("ERROR:", e);
  }
}

run();
