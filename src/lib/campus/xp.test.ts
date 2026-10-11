import { describe, expect, it } from "vitest";
import { awardXp, xpBreakdown, alreadyRewardedToday, rollDay } from "./xp";

describe("XP rules", () => {
  it("caps daily XP at 100", () => {
    const r = awardXp({ total: 200, today: 90, date: "2026-10-11" }, 20, "2026-10-11");
    expect(r.granted).toBe(10);
    expect(r.xp.today).toBe(100);
    expect(r.xp.total).toBe(210);
  });
  it("resets the daily counter on a new local date without removing total XP", () => {
    expect(rollDay({ total: 150, today: 100, date: "2026-10-10" }, "2026-10-11")).toEqual({ total: 150, today: 0, date: "2026-10-11" });
  });
  it("adds a +5 personality bonus and caps at 30 per activity", () => {
    expect(xpBreakdown({ baseXp: 10, social: "quiet" }, "Introvert").total).toBe(15);
    expect(xpBreakdown({ baseXp: 10, social: "quiet" }, "Extrovert").total).toBe(10);
    expect(xpBreakdown({ baseXp: 25, social: "group" }, "Extrovert").total).toBe(30);
    expect(xpBreakdown({ baseXp: 30, social: "mixed" }, "Ambivert").total).toBe(30);
  });
  it("does not reward the same quiz twice on the same day", () => {
    const c = [{ id: "qz-a", date: "2026-10-11", xp: 10 }];
    expect(alreadyRewardedToday(c, "qz-a", "2026-10-11")).toBe(true);
    expect(alreadyRewardedToday(c, "qz-a", "2026-10-12")).toBe(false);
  });
});
