import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SOCIAL_LABEL, TYPE_LABEL, type Activity } from "@/lib/campus/data";
import { useCampus } from "@/lib/campus/store";
import { alreadyRewardedToday, xpBreakdown } from "@/lib/campus/xp";
import { categoryName, fmtDuration, fmtEventDate } from "./ActivityCard";
import { cn } from "@/lib/utils";

export function ActivityDialog() {
  const { openId, openActivity, getActivity } = useCampus();
  const a = openId ? getActivity(openId) : undefined;
  return (
    <Dialog open={!!a} onOpenChange={(o) => !o && openActivity(null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {a && <Detail key={a.id} a={a} />}
      </DialogContent>
    </Dialog>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v}</span></div>;
}

function Detail({ a }: { a: Activity }) {
  const { state, today, toggleJoin, toggleSave, markAttended } = useCampus();
  const xp = xpBreakdown(a, state.profile?.personality);
  const joined = state.joined.includes(a.id);
  const saved = state.saved.includes(a.id);
  const attended = state.attended.some((c) => c.id === a.id);
  const claimed = alreadyRewardedToday(state.completions, a.id, today);
  const past = state.completions.filter((c) => c.id === a.id);

  return (
    <>
      <DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{categoryName(a.category)}</Badge>
          <Badge variant="outline">{TYPE_LABEL[a.type]}</Badge>
          {a.beginner && <Badge className="bg-accent text-accent-foreground hover:bg-accent">Beginner-friendly</Badge>}
        </div>
        <DialogTitle className="font-display text-2xl">{a.title}</DialogTitle>
        <DialogDescription>{a.description}</DialogDescription>
      </DialogHeader>

      <div className="rounded-xl bg-secondary/60 px-4 py-1">
        {a.type === "event" ? (
          <>
            <Row k="Organizer" v={a.organizer} />
            <Row k="Date & time" v={fmtEventDate(a)} />
            <Row k="Location" v={a.location} />
            <Row k="Duration" v={fmtDuration(a.durationMin)} />
            <Row k="Beginner-friendly" v={a.beginner ? "Yes" : "Some experience helps"} />
            <Row k="New participants welcome" v={a.newcomersWelcome ? "Yes" : "Limited"} />
          </>
        ) : (
          <>
            {a.topic && <Row k="Topic" v={a.topic} />}
            <Row k={a.type === "learning" ? "Reading / completion time" : "Estimated time"} v={fmtDuration(a.durationMin)} />
            {a.difficulty && <Row k="Difficulty" v={a.difficulty} />}
          </>
        )}
        <Row k="Style" v={SOCIAL_LABEL[a.social]} />
        <Row k="Suggested XP" v={<span>{xp.base} base{xp.bonus ? ` + ${xp.bonus} personality match` : ""} = <b className="text-primary">{xp.total} XP</b></span>} />
      </div>
      {a.type === "event" && <p className="text-xs text-muted-foreground">Sample event for this prototype — not a real, verified campus listing.</p>}

      {a.type === "event" && (
        <div className="flex flex-wrap gap-2">
          {attended ? <Button disabled>Attended ✓</Button> : (
            <>
              <Button onClick={() => toggleJoin(a.id)} variant={joined ? "secondary" : "default"}>{joined ? "Leave event" : "Join event"}</Button>
              {joined && <Button variant="outline" onClick={() => markAttended(a.id)}>I attended — claim XP</Button>}
            </>
          )}
          <Button variant="ghost" onClick={() => toggleSave(a.id)}>{saved ? "Unsave" : "Save for later"}</Button>
        </div>
      )}

      {(a.type === "quiz" || a.type === "puzzle") && <QuizRunner a={a} claimed={claimed} />}
      {a.type === "learning" && <LearningRunner a={a} claimed={claimed} />}

      {past.length > 0 && a.type !== "event" && (
        <p className="text-xs text-muted-foreground">
          Your history: {past.map((c) => `${c.date}${c.outOf ? ` (${c.score}/${c.outOf})` : ""}`).join(", ")}
        </p>
      )}
    </>
  );
}

function QuizRunner({ a, claimed }: { a: Activity; claimed: boolean }) {
  const { completeLearning } = useCampus();
  const qs = a.questions ?? [];
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => qs.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [awarded, setAwarded] = useState(0);
  useEffect(() => { setAnswers(qs.map(() => null)); }, [a.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!started) return (
    <div className="flex items-center gap-3">
      <Button onClick={() => setStarted(true)}>Start Activity</Button>
      {claimed && <span className="text-xs text-muted-foreground">XP already claimed today — you can still play.</span>}
    </div>
  );

  const score = answers.filter((x, i) => x === qs[i]?.answer).length;
  const allAnswered = answers.every((x) => x !== null);

  return (
    <div className="space-y-5">
      {qs.map((q, i) => (
        <div key={i} className="rounded-xl border border-border p-4">
          <p className="mb-3 font-medium">{i + 1}. {q.q}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((o, j) => {
              const chosen = answers[i] === j;
              const correct = submitted && j === q.answer;
              const wrong = submitted && chosen && j !== q.answer;
              return (
                <button key={j} disabled={submitted}
                  onClick={() => setAnswers((p) => p.map((v, k) => (k === i ? j : v)))}
                  className={cn("rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                    chosen && !submitted && "border-primary bg-primary/10",
                    correct && "border-success bg-success/10",
                    wrong && "border-destructive bg-destructive/10",
                    !chosen && !correct && "border-border hover:bg-secondary")}>
                  {o}
                </button>
              );
            })}
          </div>
          {submitted && (
            <p className="mt-3 flex gap-2 text-sm text-muted-foreground">
              {answers[i] === q.answer ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> : <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
              {q.explain}
            </p>
          )}
        </div>
      ))}
      {!submitted ? (
        <Button disabled={!allAnswered} onClick={() => { setSubmitted(true); setAwarded(completeLearning(a.id, score, qs.length)); }}>
          {allAnswered ? "Submit answers" : `Answer all ${qs.length} questions to submit`}
        </Button>
      ) : (
        <div className="rounded-xl bg-accent p-4 text-accent-foreground">
          <p className="font-display text-xl font-semibold">You scored {score} / {qs.length}</p>
          <p className="text-sm">{awarded > 0 ? `+${awarded} XP added to your progress.` : "No XP this time (already claimed today or daily cap reached)."} Every attempt counts as practice.</p>
          <Button className="mt-3" variant="outline" size="sm" onClick={() => { setSubmitted(false); setAnswers(qs.map(() => null)); }}>Try again</Button>
        </div>
      )}
    </div>
  );
}

function LearningRunner({ a, claimed }: { a: Activity; claimed: boolean }) {
  const { completeLearning } = useCampus();
  const [done, setDone] = useState(false);
  return (
    <div className="space-y-4">
      {a.sections?.map((s) => (
        <div key={s.heading}>
          <h4 className="font-display font-semibold">{s.heading}</h4>
          <p className="text-sm text-muted-foreground">{s.body}</p>
        </div>
      ))}
      {done ? (
        <p className="rounded-xl bg-accent p-3 text-sm text-accent-foreground">Nice — marked as complete. It's saved in My Activities.</p>
      ) : (
        <div className="flex items-center gap-3">
          <Button onClick={() => { completeLearning(a.id); setDone(true); }}>Mark as complete</Button>
          {claimed && <span className="text-xs text-muted-foreground">XP already claimed today.</span>}
        </div>
      )}
    </div>
  );
}
