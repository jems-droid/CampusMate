import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, INTERESTS, SOCIAL_LABEL, type CategoryId, type Social } from "@/lib/campus/data";
import { useCampus } from "@/lib/campus/store";
import { localDateKey } from "@/lib/campus/xp";
import { cn } from "@/lib/utils";

const blank = { title: "", category: "" as CategoryId | "", description: "", organizer: "", date: "", time: "", location: "", durationMin: "60", beginner: true, newcomersWelcome: true, interests: [] as string[], social: "mixed" as Social };

export function OrganizeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { submitEvent } = useCampus();
  const [f, setF] = useState(blank);
  const [err, setErr] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.title.trim()) er.title = "Add a title.";
    if (!f.category) er.category = "Pick a category.";
    if (f.description.trim().length < 10) er.description = "Describe it in at least a sentence.";
    if (!f.organizer.trim()) er.organizer = "Who's organising?";
    if (!f.date) er.date = "Choose a date."; else if (f.date < localDateKey()) er.date = "Date can't be in the past.";
    if (!f.time) er.time = "Choose a time.";
    if (!f.location.trim()) er.location = "Where is it?";
    const d = Number(f.durationMin); if (!d || d < 10 || d > 600) er.durationMin = "10–600 minutes.";
    if (!f.interests.length) er.interests = "Pick at least one interest.";
    setErr(er);
    if (Object.keys(er).length) return;
    submitEvent({ ...f, category: f.category as CategoryId, durationMin: d, title: f.title.trim(), description: f.description.trim(), organizer: f.organizer.trim(), location: f.location.trim() });
    toast.success("Submitted! It's pending review in the demo organizer view.");
    setF(blank); onOpenChange(false);
  };
  const E = ({ k }: { k: string }) => (err[k] ? <p className="mt-1 text-xs text-destructive">{err[k]}</p> : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Organize an Activity</DialogTitle>
          <DialogDescription>Simulated review: your event stays Pending until approved in the demo organizer view. Clubs and events are not actually verified.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2"><Label htmlFor="o-title">Event title</Label><Input id="o-title" className="mt-1" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /><E k="title" /></div>
          <div><Label>Category</Label>
            <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v as CategoryId })}><SelectTrigger className="mt-1" aria-label="Category"><SelectValue placeholder="Choose…" /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><E k="category" /></div>
          <div><Label htmlFor="o-org">Organizer / club name</Label><Input id="o-org" className="mt-1" value={f.organizer} onChange={(e) => setF({ ...f, organizer: e.target.value })} /><E k="organizer" /></div>
          <div className="sm:col-span-2"><Label htmlFor="o-desc">Description</Label><Textarea id="o-desc" className="mt-1" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /><E k="description" /></div>
          <div><Label htmlFor="o-date">Date</Label><Input id="o-date" type="date" className="mt-1" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /><E k="date" /></div>
          <div><Label htmlFor="o-time">Time</Label><Input id="o-time" type="time" className="mt-1" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /><E k="time" /></div>
          <div><Label htmlFor="o-loc">Location</Label><Input id="o-loc" className="mt-1" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /><E k="location" /></div>
          <div><Label htmlFor="o-dur">Duration (minutes)</Label><Input id="o-dur" type="number" className="mt-1" value={f.durationMin} onChange={(e) => setF({ ...f, durationMin: e.target.value })} /><E k="durationMin" /></div>
          <div><Label>Style</Label>
            <Select value={f.social} onValueChange={(v) => setF({ ...f, social: v as Social })}><SelectTrigger className="mt-1" aria-label="Style"><SelectValue /></SelectTrigger>
              <SelectContent>{(Object.keys(SOCIAL_LABEL) as Social[]).map((s) => <SelectItem key={s} value={s}>{SOCIAL_LABEL[s]}</SelectItem>)}</SelectContent></Select></div>
          <div className="flex flex-col justify-end gap-2">
            <div className="flex items-center gap-2"><Switch id="o-beg" checked={f.beginner} onCheckedChange={(v) => setF({ ...f, beginner: v })} /><Label htmlFor="o-beg">Beginner-friendly</Label></div>
            <div className="flex items-center gap-2"><Switch id="o-new" checked={f.newcomersWelcome} onCheckedChange={(v) => setF({ ...f, newcomersWelcome: v })} /><Label htmlFor="o-new">New participants welcome</Label></div>
          </div>
          <div className="sm:col-span-2"><Label>Relevant interests</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">{INTERESTS.map((i) => (
              <button type="button" key={i} onClick={() => setF({ ...f, interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i] })}
                className={cn("rounded-full border px-2.5 py-1 text-xs", f.interests.includes(i) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary")}>{i}</button>
            ))}</div><E k="interests" /></div>
          <div className="sm:col-span-2"><Button type="submit">Submit for review</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
