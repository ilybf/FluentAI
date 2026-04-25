import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongoose';
import { ReadingPassage } from '@/models/ReadingPassage';
import { AIService } from '@/lib/ai/service';
import { awardXP, awardStreakBonus, XP } from '@/lib/scoring';

/**
 * Minimal seed passages — one per level as initial fallback content.
 * Once AI starts generating, these are gradually replaced with fresh content.
 */
const seedPassages = [
  {
    title: "My Daily Routine", level: "A1",
    content: `My name is Sara. I am 22 years old. I live in a small city.\n\nEvery day, I wake up at 7 o'clock. I brush my teeth and take a shower. Then I eat breakfast. I like bread and cheese for breakfast. I drink tea every morning.\n\nI go to work at 8:30. I work in an office. I use a computer. I eat lunch at 12 o'clock. I usually eat a sandwich. After work, I go home. I cook dinner. I like pasta and rice.\n\nIn the evening, I watch TV or read a book. I go to bed at 10 o'clock.`,
    questions: [
      { text: "What time does Sara wake up?", options: ["6 o'clock", "7 o'clock", "8 o'clock", "9 o'clock"], correctIndex: 1 },
      { text: "What does Sara drink every morning?", options: ["Coffee", "Juice", "Tea", "Milk"], correctIndex: 2 },
      { text: "Where does Sara work?", options: ["In a school", "In an office", "In a hospital", "In a shop"], correctIndex: 1 },
    ],
  },
  {
    title: "A Weekend Trip to the Beach", level: "A2",
    content: `Last weekend, my friends and I went to the beach. We left early in the morning at 6 a.m. The beach is two hours from our city.\n\nWhen we arrived, the weather was beautiful. The sun was shining and there were no clouds. We put our towels on the sand and ran into the water. The water was a little cold at first, but then it felt nice.\n\nWe played volleyball on the beach and built a sandcastle. At lunchtime, we ate sandwiches and drank cold lemonade.\n\nWe left the beach at 5 p.m. because we were tired. On the way home, we stopped at a restaurant and ate pizza. It was a wonderful day.`,
    questions: [
      { text: "What time did they leave for the beach?", options: ["5 a.m.", "6 a.m.", "7 a.m.", "8 a.m."], correctIndex: 1 },
      { text: "What was the weather like?", options: ["Rainy", "Cloudy", "Beautiful and sunny", "Windy"], correctIndex: 2 },
      { text: "What did they eat on the way home?", options: ["Sandwiches", "Hamburgers", "Ice cream", "Pizza"], correctIndex: 3 },
    ],
  },
  {
    title: "The Impact of Social Media on Young People", level: "B1",
    content: `Social media has become a huge part of everyday life, especially for young people. Platforms like Instagram, TikTok, and YouTube are used by millions of teenagers around the world.\n\nOn the positive side, social media helps people stay connected with friends and family, even if they live far away. It is also a great tool for learning new things. Many people watch educational videos or follow accounts that teach languages or science.\n\nHowever, there are also negative effects. Many studies show that spending too much time on social media can lead to anxiety and depression. Young people often compare themselves to others online, which can make them feel bad about their appearance or their life.\n\nExperts recommend that young people limit their screen time to one or two hours per day.`,
    questions: [
      { text: "What is one advantage of social media?", options: ["It makes people famous", "It helps people stay connected with others", "It replaces education", "It earns money for users"], correctIndex: 1 },
      { text: "What negative effect can too much social media cause?", options: ["Better sleep", "More exercise", "Anxiety and depression", "Improved grades"], correctIndex: 2 },
      { text: "How much screen time do experts recommend per day?", options: ["30 minutes", "1-2 hours", "4-5 hours", "No limit"], correctIndex: 1 },
    ],
  },
  {
    title: "The Psychology Behind Procrastination", level: "B2",
    content: `Almost everyone has experienced procrastination — putting off an important task in favour of something more enjoyable. While it is often dismissed as laziness, psychologists argue that procrastination is primarily an emotional regulation problem, not a time management one.\n\nDr. Tim Pychyl explains that when we face a task we find boring or anxiety-inducing, our brain's limbic system triggers an avoidance response. We seek immediate relief by turning to activities that provide instant gratification. The prefrontal cortex, which handles rational thinking, is essentially overridden.\n\nThe consequences of chronic procrastination can be significant — higher stress, lower performance, and even physical health problems.\n\nExperts suggest several strategies: breaking large tasks into smaller steps, setting specific deadlines, practising self-compassion, and removing distractions from your environment.`,
    questions: [
      { text: "According to psychologists, procrastination is primarily a problem of:", options: ["Time management", "Laziness", "Emotional regulation", "Intelligence"], correctIndex: 2 },
      { text: "What part of the brain triggers the avoidance response?", options: ["The prefrontal cortex", "The cerebellum", "The limbic system", "The hippocampus"], correctIndex: 2 },
      { text: "Which strategy is NOT mentioned?", options: ["Breaking tasks into smaller steps", "Setting specific deadlines", "Punishing yourself for delays", "Removing distractions"], correctIndex: 2 },
    ],
  },
  {
    title: "The Ethics of AI in Healthcare", level: "C1",
    content: `The integration of artificial intelligence into healthcare presents a fascinating paradox: a technology with the potential to save millions of lives simultaneously raises profound ethical questions. From diagnostic algorithms that identify cancers more accurately than radiologists to AI systems that predict patient deterioration hours before clinicians notice warning signs, the capabilities are remarkable.\n\nOne pressing concern involves algorithmic bias. AI systems learn from historical data, and if that data reflects existing inequalities, the algorithms can perpetuate those disparities. A widely used US healthcare algorithm systematically underestimated the health needs of Black patients because it used healthcare spending as a proxy for health needs.\n\nThe question of accountability is equally complex. When an AI system recommends harmful treatment, who bears responsibility? Traditional malpractice frameworks were not designed for autonomous decision-making systems.\n\nPerhaps most fundamentally, AI cannot yet replicate the human capacity for genuine compassion — an essential component of healing.`,
    questions: [
      { text: "Why did the US algorithm underestimate Black patients' needs?", options: ["Incomplete genetic data", "It used healthcare spending as a proxy for health needs", "Only trained on White patient data", "Deliberately designed to discriminate"], correctIndex: 1 },
      { text: "What challenge with AI accountability does the passage identify?", options: ["AI is too expensive", "Malpractice frameworks don't cover autonomous systems", "Doctors refuse AI recommendations", "Developers cannot be identified"], correctIndex: 1 },
      { text: "What can AI NOT yet replicate?", options: ["Accurate diagnoses", "Processing large datasets", "Genuine human compassion", "Predicting patient deterioration"], correctIndex: 2 },
    ],
  },
  {
    title: "The Paradox of Choice and Decision Fatigue", level: "C2",
    content: `In his influential 2004 work, psychologist Barry Schwartz challenged the deeply ingrained assumption that maximising individual choice invariably maximises welfare. He argued that the relationship between available options and subjective well-being follows an inverted U-curve: beyond a certain threshold, additional choices cease to liberate and begin to tyrannise.\n\nThe mechanisms are multifaceted. Opportunity cost becomes increasingly painful as alternatives grow. Analysis paralysis, wherein the sheer volume of options renders decision-making so cognitively taxing that individuals defer or avoid the decision altogether, represents another consequence. This phenomenon is particularly pronounced among "maximisers" — those who habitually seek the optimal choice.\n\nSubsequent research has refined Schwartz's thesis. A comprehensive meta-analysis by Scheibehenne et al. (2010) found the "choice overload" effect is considerably more context-dependent than originally proposed. Variables such as decision complexity, domain expertise, and preference articulation all modulate whether additional options help or hinder.\n\nPolicy architects increasingly recognise that how choices are structured — "choice architecture" — may matter more than how many choices are offered.`,
    questions: [
      { text: "What relationship does Schwartz propose between choice and well-being?", options: ["A straight upward line", "An inverted U-curve", "A downward slope", "An exponential curve"], correctIndex: 1 },
      { text: "What distinguishes a 'maximiser'?", options: ["Someone who decides quickly", "Someone who avoids decisions", "Someone who seeks the optimal choice", "Someone satisfied with any option"], correctIndex: 2 },
      { text: "What did the 2010 meta-analysis conclude?", options: ["Choice overload does not exist", "Choice overload is universal", "Choice overload is more context-dependent than proposed", "More choice is always beneficial"], correctIndex: 2 },
    ],
  },
];

/**
 * Auto-seeds one passage per level if DB is empty. Only runs once.
 */
async function ensurePassagesExist() {
  const count = await ReadingPassage.countDocuments();
  if (count === 0) {
    console.log('Reading DB empty — seeding initial passages...');
    await ReadingPassage.insertMany(seedPassages);
    console.log('Seed complete: 6 passages inserted.');
  }
}

// ─── GET: Fetch all passages (optionally filtered by level) ───
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');

    await dbConnect();
    await ensurePassagesExist();

    // Auto-filter to user's level and one above, unless explicit level requested
    let filter: Record<string, any> = {};
    if (level) {
      filter = { level };
    } else {
      const userLevel = (session as any).user?.level || 'A1';
      const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const idx = levelOrder.indexOf(userLevel);
      const allowedLevels = [userLevel];
      if (idx >= 0 && idx < levelOrder.length - 1) {
        allowedLevels.push(levelOrder[idx + 1]);
      }
      filter = { level: { $in: allowedLevels } };
    }

    const passages = await ReadingPassage.find(filter).sort({ level: 1, createdAt: -1 }).lean();

    return NextResponse.json(passages);
  } catch (error) {
    console.error('Reading API GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── POST: Complete a passage → delete it → AI generates a replacement ───
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { passageId, quizScore } = await req.json();
    if (!passageId) {
      return NextResponse.json({ error: 'passageId is required' }, { status: 400 });
    }

    await dbConnect();

    // Atomically find and delete the completed passage to prevent double-processing
    const completedPassage = await ReadingPassage.findByIdAndDelete(passageId).lean();
    if (!completedPassage) {
      return NextResponse.json({ error: 'Passage not found or already processed' }, { status: 400 });
    }

    // ─── Award XP for quiz completion ───────────────────────
    let xpResult: { awarded: number; leveledUp: boolean; newLevel?: string } = { awarded: 0, leveledUp: false };
    if (quizScore && typeof quizScore.correct === 'number' && typeof quizScore.total === 'number' && quizScore.total > 0) {
      const ratio = quizScore.correct / quizScore.total;
      let xpPoints = Math.round(ratio * XP.READING_BASE);

      // Perfect score bonus
      if (quizScore.correct === quizScore.total) {
        xpPoints += XP.READING_PERFECT_BONUS;
      }

      xpResult = await awardXP(
        session.user.id,
        "reading",
        xpPoints,
        {
          submissionId: passageId,
          details: `Reading quiz: ${quizScore.correct}/${quizScore.total}`,
          score: Math.round(ratio * 100),
        }
      );

      // Check for streak bonus
      await awardStreakBonus(session.user.id);
    }

    const level = completedPassage.level;

    // Get existing titles at this level to avoid repetition
    const existingTitles = await ReadingPassage.find({ level }).select('title').lean();
    const avoidTitles = existingTitles.map((p: any) => p.title);

    // Generate a new AI passage as replacement
    let newPassage;
    try {
      const generated = await AIService.generateReadingPassage(level, avoidTitles);
      newPassage = await ReadingPassage.create({
        title: generated.title,
        content: generated.content,
        level,
        questions: generated.questions,
      });
    } catch (aiError: any) {
      console.error('AI passage generation failed:', aiError);

      // If rate limited or AI unavailable, return success for deletion but flag that no replacement was generated
      const isRateLimited = aiError?.message === 'RATE_LIMITED';
      return NextResponse.json({
        message: 'Passage completed and removed.',
        replaced: false,
        reason: isRateLimited
          ? 'Rate limited — new passage will appear when you refresh later.'
          : 'AI temporarily unavailable — try refreshing later.',
      });
    }

    return NextResponse.json({
      message: 'Passage completed! A new one has been generated.',
      replaced: true,
      newPassage,
      xp: {
        awarded: xpResult.awarded,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel,
      },
    });
  } catch (error) {
    console.error('Reading API POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
