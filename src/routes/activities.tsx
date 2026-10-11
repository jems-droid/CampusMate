import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { AppShell, PageTitle } from "@/components/campus/AppShell";
import { fmtEventDate } from "@/components/campus/ActivityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TASK_CATEGORIES, TYPE_LABEL, XP_TABLE, type Activity, type TaskCategory } from "@/lib/campus/data";
import { useCampus } from "@/lib/campus/store";
import { DAILY_CAP, rollDay } from "@/lib/campus/xp";

export const Route = createFileRoute("/activities")({
  head: () => ({
    meta: [
      { title: "My Activities — CampusMate" },
      { name: "description", content: "Your joined events, saved activities, completed quizzes and daily progress tracker." },
      { property: "og:title", content: "My Activities — CampusMate" },
      { property: "og:description", content: "Track tasks, events and learning activities in one place." },
    ],
  }),
  component: () => <AppShell><ActivitiesPage /></AppShell>,
});

function ActivitiesPage() {
  const { state, getActivity } = useCampus();
  const list = (ids: string[]) => ids.map(getActivity).filter(Boolean) as Activity[];
  const joined = list(state.joined);
  const saved = list(state.saved);
  const completedEvents = state.attended.map((c) => ({ c, a: getActivity(c.id) })).filter((x) => x.a);
  const learning = [...state.completions].reverse().map((c) => ({ c, a: getActivity(c.id) })).filter((x) => x.a);

  return (
    <>
      <PageTitle title="My Activities" subtitle="Your events, saved picks, completed activities and daily tracker." />
      <Tabs defaultValue="tracker">
        <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
          <TabsTrigger value="tracker">Progress tracker</TabsTrigger>
          <TabsTrigger value="joined">Upcoming ({joined.length})</TabsTrigger>
          <TabsTrigger value="saved">Saved ({saved.length})</TabsTrigger>
          <TabsTrigger value="events">Completed events ({completedEvents.length})</TabsTrigger>
          <TabsTrigger value="learning">Quizzes & learning ({learning.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="tracker"><Tracker /></TabsContent>
        <TabsContent value="joined"><ActList items={joined} empty="You haven't joined any events yet." showLeave /></TabsContent>
        <TabsContent value="saved"><ActList items={saved} empty="Nothing saved yet. Tap the bookmark on any activity." /></TabsContent>
        <TabsContent value="events">
          <HistoryList rows={completedEvents.map(({ c, a }) => ({ key: c.id, a: a!, meta: `Attended ${c.date}`, xp: c.xp }))} empty="Events you mark as attended will appear here." />
        </TabsContent>
        <TabsContent value="learning">
          <HistoryList rows={learning.map(({ c, a }, i) => ({ key: `${c.id}-${i}`, a: a!, meta: `${TYPE_LABEL[a!.type]} · ${c.date}${c.outOf ? ` · Score ${c.score}/${c.outOf}` : ""}`, xp: c.xp }))} empty="Completed quizzes, puzzles and learning activities will show here with your scores." />
        </TabsContent>
      </Tabs>
    </>
  );
}

function ActList({ items, empty, showLeave }: { items: Activity[]; empty: string; showLeave?: boolean }) {
  const { openActivity, toggleJoin, markAttended, toggleSave } = useCampus();
  if (!items.length) return <Empty text={empty} />;
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
      {items.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <button className="text-left" onClick={() => openActivity(a.id)}>
            <div className="font-medium hover:text-primary">{a.title}</div>
            <div className="text-sm text-muted-foreground">{a.type === "event" ? `${fmtEventDate(a)} · ${a.location}` : TYPE_LABEL[a.type]}</div>
          </button>
          <div className="flex gap-2">
            {showLeave ? (
              <>
                <Button size="sm" variant="outline" onClick={() => markAttended(a.id)}>I attended</Button>
                <Button size="sm" variant="ghost" onClick={() => toggleJoin(a.id)}>Leave</Button>
              </>
            ) : <Button size="sm" variant="ghost" onClick={() => toggleSave(a.id)}>Unsave</Button>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function HistoryList({ rows, empty }: { rows: { key: string; a: Activity; meta: string; xp: number }[]; empty: string }) {
  const { openActivity } = useCampus();
  if (!rows.length) return <Empty text={empty} />;
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
      {rows.map((r) => (
        <li key={r.key} className="flex items-center justify-between gap-3 p-4">
          <button className="text-left" onClick={() => openActivity(r.a.id)}>
            <div className="font-medium hover:text-primary">{r.a.title}</div>
            <div className="text-sm text-muted-foreground">{r.meta}</div>
          </button>
          <span className="text-sm font-semibold text-primary">{r.xp > 0 ? `+${r.xp} XP` : "—"}</span>
        </li>
      ))}
    </ul>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">{text} <Link to="/discover" className="font-medium text-primary underline">Go to Discover</Link></div>;
}

function Tracker() {
  const { state, today, addTask, completeTask, removeTask } = useCampus();
  const xp = rollDay(state.xp, today);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory | "">("");
  const [preset, setPreset] = useState("");
  const [error, setError] = useState("");
  const pending = state.tasks.filter((t) => !t.done);
  const done = state.tasks.filter((t) => t.done);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const p = XP_TABLE.find((x) => x.label === preset);
    if (!title.trim()) return setError("Give your task a title.");
    if (!category) return setError("Pick a category.");
    if (!p) return setError("Pick the kind of task so we can suggest XP.");
    setError("");
    addTask({ title: title.trim(), category, xp: p.xp });
    setTitle(""); setPreset("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex justify-between text-sm"><span className="font-semibold">Today: {xp.today}/{DAILY_CAP} XP</span><span className="text-muted-foreground">Total {xp.total} XP</span></div>
          <Progress value={(xp.today / DAILY_CAP) * 100} className="mt-2 h-2.5" />
          <p className="mt-2 text-xs text-muted-foreground">XP is private. No streaks, no leaderboards, and missed days never cost you points.</p>
        </div>
        <form onSubmit={add} className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-card" noValidate>
          <h3 className="font-display font-semibold">Add a task</h3>
          <div><Label htmlFor="t-title">Title</Label><Input id="t-title" className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Finish physics lab record" /></div>
          <div><Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}><SelectTrigger className="mt-1" aria-label="Task category"><SelectValue placeholder="Choose…" /></SelectTrigger>
              <SelectContent>{TASK_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
          <div><Label>Kind of task (sets XP)</Label>
            <Select value={preset} onValueChange={(v) => { setPreset(v); const p = XP_TABLE.find((x) => x.label === v); if (p && !category) setCategory(p.category); }}>
              <SelectTrigger className="mt-1" aria-label="Kind of task"><SelectValue placeholder="Choose…" /></SelectTrigger>
              <SelectContent>{XP_TABLE.map((x) => <SelectItem key={x.label} value={x.label}>{x.label} · {x.xp} XP</SelectItem>)}</SelectContent></Select></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit">Add task</Button>
        </form>
      </div>
      <div className="space-y-4">
        <TaskGroup title={`Pending (${pending.length})`} tasks={pending} empty="No pending tasks — add one to get started." onComplete={completeTask} onRemove={removeTask} />
        <TaskGroup title={`Completed (${done.length})`} tasks={done} empty="Completed tasks will appear here." onRemove={removeTask} />
      </div>
    </div>
  );
}

function TaskGroup({ title, tasks, empty, onComplete, onRemove }: { title: string; tasks: ReturnType<typeof useCampus>["state"]["tasks"]; empty: string; onComplete?: (id: string) => void; onRemove: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="mb-2 font-display font-semibold">{title}</h3>
      {!tasks.length ? <p className="text-sm text-muted-foreground">{empty}</p> : (
        <ul className="divide-y divide-border">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-3">
              {onComplete ? (
                <button aria-label={`Complete ${t.title}`} onClick={() => onComplete(t.id)} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary hover:bg-primary/10" />
              ) : <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-primary-foreground"><Check className="h-4 w-4" /></span>}
              <div className="min-w-0 flex-1">
                <div className={t.done ? "text-muted-foreground line-through" : "font-medium"}>{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.category} · {t.date} · {t.done ? `+${t.xpAwarded} XP earned` : `${t.xp} XP`}</div>
              </div>
              <button aria-label={`Remove ${t.title}`} onClick={() => onRemove(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
