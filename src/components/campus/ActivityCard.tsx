import { Bookmark, BookmarkCheck, Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORIES, TYPE_LABEL, eventDate, type Activity } from "@/lib/campus/data";
import { useCampus } from "@/lib/campus/store";
import { xpBreakdown } from "@/lib/campus/xp";

export function fmtDuration(m: number) {
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m} min`;
}
export function fmtEventDate(a: Activity) {
  if (a.dayOffset === undefined) return "";
  return `${eventDate(a.dayOffset).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} · ${a.time}`;
}
export function categoryName(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

export function ActivityCard({ a }: { a: Activity }) {
  const { state, openActivity, toggleSave, toggleJoin } = useCampus();
  const xp = xpBreakdown(a, state.profile?.personality);
  const saved = state.saved.includes(a.id);
  const joined = state.joined.includes(a.id);
  const attended = state.attended.some((c) => c.id === a.id);
  const isEvent = a.type === "event";

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{categoryName(a.category)}</Badge>
          <Badge variant="outline">{TYPE_LABEL[a.type]}</Badge>
          {a.beginner && <Badge className="bg-accent text-accent-foreground hover:bg-accent">Beginner-friendly</Badge>}
        </div>
        <button aria-label={saved ? "Unsave" : "Save"} onClick={() => toggleSave(a.id)} className="text-muted-foreground hover:text-primary">
          {saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
        </button>
      </div>
      <button onClick={() => openActivity(a.id)} className="text-left">
        <h3 className="font-display text-lg font-semibold leading-snug hover:text-primary">{a.title}</h3>
      </button>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {isEvent && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{fmtEventDate(a)}</span>}
        {isEvent && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{a.location}</span>}
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{fmtDuration(a.durationMin)}</span>
        {a.difficulty && <span>{a.difficulty}</span>}
        <span className="flex items-center gap-1 font-medium text-primary"><Sparkles className="h-3.5 w-3.5" />{xp.total} XP{xp.bonus ? " (incl. +5 match)" : ""}</span>
      </div>
      <div className="mt-auto flex gap-2 pt-4">
        <Button variant="outline" size="sm" onClick={() => openActivity(a.id)}>Details</Button>
        {isEvent ? (
          attended ? <Button size="sm" disabled>Attended</Button> :
          <Button size="sm" variant={joined ? "secondary" : "default"} onClick={() => toggleJoin(a.id)}>{joined ? "Leave" : "Join"}</Button>
        ) : (
          <Button size="sm" onClick={() => openActivity(a.id)}>{a.type === "learning" ? "Explore" : "Start Activity"}</Button>
        )}
      </div>
    </article>
  );
}
