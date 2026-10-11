import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { AppShell, PageTitle } from "@/components/campus/AppShell";
import { ActivityCard } from "@/components/campus/ActivityCard";
import { OrganizeDialog } from "@/components/campus/OrganizeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CATEGORIES, INTERESTS, TYPE_LABEL, type ActivityType, type CategoryId } from "@/lib/campus/data";
import { scoreActivity } from "@/lib/campus/recommend";
import { useCampus } from "@/lib/campus/store";
import { matchesPersonality } from "@/lib/campus/xp";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — CampusMate" },
      { name: "description", content: "Find campus events, quizzes, puzzles and short learning activities across Learn & Build, Think & Solve, Create & Play and Meet & Explore." },
      { property: "og:title", content: "Discover — CampusMate" },
      { property: "og:description", content: "Search and filter campus activities for freshers." },
    ],
  }),
  component: () => <AppShell><DiscoverPage /></AppShell>,
});

const DURATIONS = { any: "Any length", short: "Under 15 min", mid: "15–60 min", long: "Over an hour" } as const;
type Dur = keyof typeof DURATIONS;
const defaults = { q: "", cat: "all" as "all" | CategoryId, interest: "all", dur: "any" as Dur, type: "all" as "all" | ActivityType, beginner: false, forMe: false };

function DiscoverPage() {
  const { state, activities } = useCampus();
  const p = state.profile!;
  const [f, setF] = useState(defaults);
  const [organize, setOrganize] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    let list = activities.filter((a) => {
      if (q && !`${a.title} ${a.description} ${a.topic ?? ""} ${a.organizer ?? ""} ${a.interests.join(" ")}`.toLowerCase().includes(q)) return false;
      if (f.cat !== "all" && a.category !== f.cat) return false;
      if (f.interest !== "all" && !a.interests.includes(f.interest)) return false;
      if (f.type !== "all" && a.type !== f.type) return false;
      if (f.beginner && !a.beginner) return false;
      if (f.dur === "short" && a.durationMin >= 15) return false;
      if (f.dur === "mid" && (a.durationMin < 15 || a.durationMin > 60)) return false;
      if (f.dur === "long" && a.durationMin <= 60) return false;
      if (f.forMe && !matchesPersonality(a, p.personality) && !a.interests.some((i) => p.interests.includes(i))) return false;
      return true;
    });
    if (f.forMe) list = [...list].sort((a, b) => scoreActivity(b, p.interests, p.personality) - scoreActivity(a, p.interests, p.personality));
    return list;
  }, [activities, f, p]);

  const dirty = JSON.stringify(f) !== JSON.stringify(defaults);

  return (
    <>
      <PageTitle title="Discover" subtitle="Everything you can do on campus — events, quizzes, puzzles and quick learning."
        action={<div className="flex gap-2"><Button variant="outline" asChild><Link to="/review">Organizer review (demo)</Link></Button><Button onClick={() => setOrganize(true)}><Plus className="mr-1 h-4 w-4" />Organize an Activity</Button></div>} />

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        <button onClick={() => set("cat", "all")} className={cn("rounded-xl border p-3 text-left", f.cat === "all" ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary")}>
          <div className="font-display font-semibold">All</div><div className="text-xs text-muted-foreground">{activities.length} activities</div>
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => set("cat", c.id)} className={cn("rounded-xl border p-3 text-left", f.cat === c.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary")}>
            <div className="font-display font-semibold">{c.name}</div><div className="text-xs text-muted-foreground">{c.blurb}</div>
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Search activities, topics, clubs…" className="pl-9" aria-label="Search activities" />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto_auto]">
          <Select value={f.interest} onValueChange={(v) => set("interest", v)}>
            <SelectTrigger aria-label="Interest"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All interests</SelectItem>{INTERESTS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={f.type} onValueChange={(v) => set("type", v as typeof f.type)}>
            <SelectTrigger aria-label="Type"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All types</SelectItem>{(Object.keys(TYPE_LABEL) as ActivityType[]).map((t) => <SelectItem key={t} value={t}>{TYPE_LABEL[t]}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={f.dur} onValueChange={(v) => set("dur", v as Dur)}>
            <SelectTrigger aria-label="Duration"><SelectValue /></SelectTrigger>
            <SelectContent>{(Object.keys(DURATIONS) as Dur[]).map((d) => <SelectItem key={d} value={d}>{DURATIONS[d]}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex items-center gap-2"><Switch id="beg" checked={f.beginner} onCheckedChange={(v) => set("beginner", v)} /><Label htmlFor="beg">Beginner-friendly</Label></div>
          <div className="flex items-center gap-2"><Switch id="forme" checked={f.forMe} onCheckedChange={(v) => set("forMe", v)} /><Label htmlFor="forme">Suggested for me</Label></div>
          <Button variant="ghost" disabled={!dirty} onClick={() => setF(defaults)}>Reset filters</Button>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{results.length} result{results.length === 1 ? "" : "s"} · Events shown are sample data for this prototype.</p>
      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-lg font-semibold">No activities match those filters</p>
          <p className="text-sm text-muted-foreground">Try a broader search or reset your filters.</p>
          <Button className="mt-4" variant="outline" onClick={() => setF(defaults)}>Reset filters</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{results.map((a) => <ActivityCard key={a.id} a={a} />)}</div>
      )}

      <p className="mt-10 rounded-xl bg-secondary p-4 text-sm text-muted-foreground"><b className="text-foreground">Coming soon:</b> regional and interest-based communities to connect with students from your area or with similar hobbies.</p>
      <OrganizeDialog open={organize} onOpenChange={setOrganize} />
    </>
  );
}
