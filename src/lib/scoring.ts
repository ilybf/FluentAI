import dbConnect from "@/lib/db/mongoose";
import { ScoreEvent } from "@/models/ScoreEvent";
import { User } from "@/models/User";

// ─── XP Award Constants ────────────────────────────────────────
export const XP = {
  WRITING_MULTIPLIER: 1,        // AI score is used directly (0–100)
  READING_BASE: 50,             // (correct/total) × 50
  READING_PERFECT_BONUS: 25,    // Extra for 100% quiz score
  CHAT_PER_MESSAGE: 5,
  CHAT_DAILY_CAP: 50,
  VOCAB_PER_WORD: 3,
  VOCAB_DAILY_CAP: 30,
  STREAK_BONUS: 20,
} as const;

// ─── Auto Level-Up Thresholds ──────────────────────────────────
const LEVEL_THRESHOLDS: Record<string, number> = {
  A1: 0,
  A2: 500,
  B1: 1500,
  B2: 3500,
  C1: 7000,
  C2: 12000,
};

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

/**
 * Determines the CEFR level a user should be at based on cumulative earned XP.
 * Uses registrationLevel as the baseline.
 * - Never downgrades below the user's current level.
 * - Only advances ONE level at a time (B1→B2, not B1→C1).
 */
export function getLevelForXP(totalXP: number, currentLevel: string, registrationLevel: string = "A1"): string {
  const effectiveXP = totalXP + (LEVEL_THRESHOLDS[registrationLevel] || 0);
  const currentIdx = LEVEL_ORDER.indexOf(currentLevel);
  
  if (currentIdx === -1 || currentIdx >= LEVEL_ORDER.length - 1) {
    return currentLevel; // Already at max or unknown
  }

  const nextLevel = LEVEL_ORDER[currentIdx + 1];
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel];

  // Only level up if XP meets the NEXT level's threshold (one step)
  if (effectiveXP >= nextThreshold) {
    return nextLevel;
  }

  return currentLevel;
}

/**
 * Returns the XP needed for the next level and current progress percentage.
 * Uses effectiveXP based on registrationLevel.
 */
export function getLevelProgress(totalXP: number, currentLevel: string, registrationLevel: string = "A1"): {
  nextLevel: string | null;
  xpForNext: number;
  xpCurrent: number;
  progress: number;
} {
  const effectiveXP = totalXP + (LEVEL_THRESHOLDS[registrationLevel] || 0);
  const currentIdx = LEVEL_ORDER.indexOf(currentLevel);
  
  if (currentIdx === -1 || currentIdx >= LEVEL_ORDER.length - 1) {
    return { nextLevel: null, xpForNext: 0, xpCurrent: totalXP, progress: 100 };
  }
  
  const nextLevel = LEVEL_ORDER[currentIdx + 1];
  const currentThreshold = Math.max(LEVEL_THRESHOLDS[currentLevel], LEVEL_THRESHOLDS[registrationLevel]);
  const nextThreshold = LEVEL_THRESHOLDS[nextLevel];
  
  const xpInRange = effectiveXP - currentThreshold;
  const rangeSize = nextThreshold - currentThreshold;
  const progress = Math.max(0, Math.min(100, Math.round((xpInRange / rangeSize) * 100)));
  
  return { nextLevel, xpForNext: rangeSize, xpCurrent: xpInRange, progress };
}

// ─── Helper: Get today's date as YYYY-MM-DD ────────────────────
function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Helper: Count today's XP for a specific type ──────────────
async function getTodayXPForType(userId: string, type: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const result = await ScoreEvent.aggregate([
    {
      $match: {
        userId: { $eq: new (await import("mongoose")).Types.ObjectId(userId) },
        type,
        createdAt: { $gte: todayStart },
      },
    },
    { $group: { _id: null, total: { $sum: "$points" } } },
  ]);

  return result[0]?.total || 0;
}

/**
 * Core function: Award XP to a user, create a ScoreEvent, update streak,
 * and auto-level-up if thresholds are met.
 *
 * Returns the awarded points (may be 0 if daily cap reached) and
 * whether a level-up occurred.
 */
export async function awardXP(
  userId: string,
  type: "writing" | "reading" | "chat" | "vocabulary" | "streak",
  rawPoints: number,
  metadata?: { submissionId?: string; details?: string; score?: number }
): Promise<{ awarded: number; leveledUp: boolean; newLevel?: string }> {
  await dbConnect();

  let pointsToAward = Math.round(rawPoints);

  // ─── Enforce daily caps ───────────────────────────────────
  if (type === "chat") {
    const todayXP = await getTodayXPForType(userId, "chat");
    const remaining = Math.max(0, XP.CHAT_DAILY_CAP - todayXP);
    pointsToAward = Math.min(pointsToAward, remaining);
  } else if (type === "vocabulary") {
    const todayXP = await getTodayXPForType(userId, "vocabulary");
    const remaining = Math.max(0, XP.VOCAB_DAILY_CAP - todayXP);
    pointsToAward = Math.min(pointsToAward, remaining);
  }

  if (pointsToAward <= 0) {
    return { awarded: 0, leveledUp: false };
  }

  // ─── Create score event ───────────────────────────────────
  await ScoreEvent.create({
    userId,
    type,
    points: pointsToAward,
    metadata: metadata || {},
  });

  // ─── Update user totalScore + streak in one atomic op ─────
  const today = getTodayStr();
  const user = await User.findById(userId).select("totalScore level registrationLevel streak");
  if (!user) return { awarded: 0, leveledUp: false };

  const oldLevel = user.level;
  const oldStreak = user.streak || { current: 0, longest: 0, lastActiveDate: "" };

  // Calculate streak
  let newCurrent = oldStreak.current;
  let newLongest = oldStreak.longest;

  if (oldStreak.lastActiveDate !== today) {
    // Check if yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (oldStreak.lastActiveDate === yesterdayStr) {
      newCurrent = oldStreak.current + 1;
    } else {
      newCurrent = 1; // Streak broken, restart
    }
    newLongest = Math.max(newLongest, newCurrent);
  }

  // Update user
  const newTotalScore = user.totalScore + pointsToAward;
  const newLevel = getLevelForXP(newTotalScore, oldLevel, user.registrationLevel || "A1");
  const leveledUp = newLevel !== oldLevel;

  await User.findByIdAndUpdate(userId, {
    $inc: { totalScore: pointsToAward },
    $set: {
      level: newLevel,
      "streak.current": newCurrent,
      "streak.longest": newLongest,
      "streak.lastActiveDate": today,
    },
  });

  // ─── Record level-up as its own event ─────────────────────
  if (leveledUp) {
    await ScoreEvent.create({
      userId,
      type: "level_up",
      points: 0,
      metadata: { details: `Leveled up from ${oldLevel} to ${newLevel}` },
    });
  }

  return { awarded: pointsToAward, leveledUp, newLevel: leveledUp ? newLevel : undefined };
}

/**
 * Award daily streak bonus if the user hasn't received one today.
 */
export async function awardStreakBonus(userId: string): Promise<{ awarded: number }> {
  const todayXP = await getTodayXPForType(userId, "streak");
  if (todayXP > 0) {
    return { awarded: 0 }; // Already awarded today
  }

  const user = await User.findById(userId).select("streak").lean();
  if (!user) return { awarded: 0 };

  const today = getTodayStr();
  const streak = user.streak || { current: 0, longest: 0, lastActiveDate: "" };

  // Only award if they had a streak going (at least day 1)
  if (streak.lastActiveDate === today && streak.current >= 1) {
    const result = await awardXP(userId, "streak", XP.STREAK_BONUS, {
      details: `${streak.current}-day streak bonus!`,
    });
    return { awarded: result.awarded };
  }

  return { awarded: 0 };
}
