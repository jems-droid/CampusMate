import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/campus/AppShell";
import { ActivityCard, fmtEventDate } from "@/components/campus/ActivityCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NEXT_STEPS } from "@/lib/campus/data";
import { recommend } from "@/lib/campus/recommend";
import { useCampus } from "@/lib/campus/store";
import { DAILY_CAP, rollDay } from "@/lib/campus/xp";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — CampusMate" },
      { name: "description", content: "Your personal CampusMate dashboard: daily progress, recommendations and upcoming activities." },
      { property: "og:title", content: "Home — CampusMate" },
      { property: "og:description", content: "Daily progress, picks for you and your next small step on campus." },
    ],
  }),
  component: () => <AppShell><HomePage /></AppShell>,
});

function encouragement(today: number) {
  if (today === 0) return "A fresh day. Even one small step counts.";
  if (today < 40) return "Nice start — you're finding your rhythm.";
  if (today < DAILY_CAP) return "Great momentum! Remember to take breaks too.";
  return "You've hit today's cap. Rest up — tomorrow is a new page.";
}

function HomePage() {
  const { state, today, activities, getActivity, openActivity } = useCampus();
  const p = state.profile!;
  const xp = rollDay(state.xp, today);
  const recs = useMemo(() => recommend(activities, p.interests, p.personality, 4, state.attended.map((c) => c.id)), [activities, p, state.attended]);
  const [stepIdx, setStepIdx] = useState(0);
  const step = NEXT_STEPS[stepIdx % NEXT_STEPS.length]!;
  const upcoming = [...new Set([...state.joined, ...state.saved])]
    .map(getActivity).filter((a) => a && a.type === "event")
    .sort((a, b) => (a!.dayOffset ?? 0) - (b!.dayOffset ?? 0)).slice(0, 4);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Hey, {p.name}! What would you like to explore today?</h1>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold">Daily Progress</h2>
          <div className="mt-3 flex items-end gap-6">
            <div><div className="font-display text-4xl font-bold text-primary">{xp.today}</div><div className="text-xs text-muted-foreground">XP today</div></div>
            <div><div className="font-display text-2xl font-semibold">{xp.total}</div><div className="text-xs text-muted-foreground">Total XP</div></div>
          </div>
          <Progress value={(xp.today / DAILY_CAP) * 100} className="mt-4 h-3" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{encouragement(xp.today)}</span><span>{xp.today}/{DAILY_CAP}</span></div>
          <Button asChild className="mt-4" variant="outline"><Link to="/activities">Track progress</Link></Button>
        </section>

        <section className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-card">
          <h2 className="text-sm font-semibold uppercase tracking-wide opacity-80">Your Next Step</h2>
          <p className="mt-2 font-display text-2xl font-semibold">{step.title}</p>
          <p className="mt-1 text-sm opacity-80">Small, low-pressure, and worth a few XP.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => step.activityId && openActivity(step.activityId)}>Start <ArrowRight className="ml-1 h-4 w-4" /></Button>
            <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => setStepIdx((i) => i + 1)}><RefreshCw className="mr-1 h-4 w-4" />Another idea</Button>
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div><h2 className="font-display text-xl font-semibold">Recommended for You</h2><p className="text-sm text-muted-foreground">Based on your interests and that you're an {p.personality.toLowerCase()} — but everything's open to you.</p></div>
          <Link to="/discover" className="text-sm font-medium text-primary">See all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{recs.map((a) => <ActivityCard key={a.id} a={a} />)}</div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl font-semibold">Upcoming Activities</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-muted-foreground">Nothing joined or saved yet. <Link to="/discover" className="font-medium text-primary underline">Browse Discover</Link> to find something you like.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {upcoming.map((a) => (
              <li key={a!.id} className="flex items-center justify-between gap-3 py-3">
                <button className="text-left" onClick={() => openActivity(a!.id)}>
                  <div className="font-medium hover:text-primary">{a!.title}</div>
                  <div className="text-sm text-muted-foreground">{fmtEventDate(a!)} · {a!.location}</div>
                </button>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">{state.joined.includes(a!.id) ? "Joined" : "Saved"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
