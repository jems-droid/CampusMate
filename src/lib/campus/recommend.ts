import type { Activity, Personality } from "./data";
import { matchesPersonality } from "./xp";

export function scoreActivity(a: Activity, interests: string[], p?: Personality) {
  const overlap = a.interests.filter((i) => interests.includes(i)).length;
  return overlap * 3 + (matchesPersonality(a, p) ? 2 : 0) + (a.beginner ? 1 : 0);
}

export function recommend(all: Activity[], interests: string[], p: Personality | undefined, n = 5, exclude: string[] = []) {
  return all
    .filter((a) => !exclude.includes(a.id))
    .map((a, idx) => ({ a, s: scoreActivity(a, interests, p), idx }))
    .sort((x, y) => y.s - x.s || x.idx - y.idx)
    .slice(0, n)
    .map((x) => x.a);
}
