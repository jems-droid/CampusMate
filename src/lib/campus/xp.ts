import type { Activity, Personality } from "./data";

export const DAILY_CAP = 100;
export const ACTIVITY_CAP = 30;
export const PERSONALITY_BONUS = 5;

export function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function matchesPersonality(a: Pick<Activity, "social">, p?: Personality) {
  if (!p) return false;
  if (p === "Introvert") return a.social === "quiet";
  if (p === "Extrovert") return a.social === "group";
  return a.social === "mixed";
}

export function xpBreakdown(a: Pick<Activity, "social" | "baseXp">, p?: Personality) {
  const bonus = matchesPersonality(a, p) ? PERSONALITY_BONUS : 0;
  const total = Math.min(ACTIVITY_CAP, a.baseXp + bonus);
  return { base: a.baseXp, bonus, total };
}

export type XpState = { total: number; today: number; date: string };

/** Resets the daily counter when the local date changed. Never removes total XP. */
export function rollDay(xp: XpState, today: string): XpState {
  return xp.date === today ? xp : { ...xp, today: 0, date: today };
}

/** Awards up to `amount`, respecting the daily cap. Returns new state and XP actually granted. */
export function awardXp(xp: XpState, amount: number, today: string) {
  const cur = rollDay(xp, today);
  const granted = Math.max(0, Math.min(amount, DAILY_CAP - cur.today));
  return { xp: { ...cur, total: cur.total + granted, today: cur.today + granted }, granted };
}

export type Completion = { id: string; date: string; score?: number; outOf?: number; xp: number };

export function alreadyRewardedToday(completions: Completion[], id: string, today: string) {
  return completions.some((c) => c.id === id && c.date === today && c.xp > 0);
}
