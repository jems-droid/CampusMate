import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INTERESTS, type Personality } from "@/lib/campus/data";
import type { Profile } from "@/lib/campus/store";
import { cn } from "@/lib/utils";

const PERSONALITIES: { v: Personality; d: string }[] = [
  { v: "Introvert", d: "Recharge with quiet time" },
  { v: "Extrovert", d: "Energised by people" },
  { v: "Ambivert", d: "A bit of both" },
];

export function ProfileForm({ initial, submitLabel, onSubmit }: { initial?: Profile | null; submitLabel: string; onSubmit: (p: Profile) => void }) {
  const [p, setP] = useState<Partial<Profile>>(initial ?? { interests: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!p.name?.trim()) er["name"] = "Please tell us what to call you.";
    if (!p.roll?.trim()) er["roll"] = "Roll number is required.";
    else if (!/^[A-Za-z0-9\-/]{3,20}$/.test(p.roll.trim())) er["roll"] = "Use 3–20 letters, numbers, - or /.";
    if (!p.place?.trim()) er["place"] = "Add your place or locality.";
    if (!p.personality) er["personality"] = "Pick the one that feels closest — you can change it later.";
    if (!p.interests?.length) er["interests"] = "Choose at least one interest.";
    setErrors(er);
    if (Object.keys(er).length) return;
    onSubmit({ name: p.name!.trim(), roll: p.roll!.trim(), place: p.place!.trim(), personality: p.personality!, interests: p.interests! });
  };

  const toggle = (i: string) => setP((x) => ({ ...x, interests: x.interests?.includes(i) ? x.interests.filter((y) => y !== i) : [...(x.interests ?? []), i] }));
  const Err = ({ k }: { k: string }) => (errors[k] ? <p className="mt-1 text-sm text-destructive">{errors[k]}</p> : null);

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label htmlFor="name">Preferred name *</Label><Input id="name" className="mt-1.5" value={p.name ?? ""} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="e.g. Alex" /><Err k="name" /></div>
        <div><Label htmlFor="roll">Roll number *</Label><Input id="roll" className="mt-1.5" value={p.roll ?? ""} onChange={(e) => setP({ ...p, roll: e.target.value })} placeholder="e.g. 2026BCS0123" /><Err k="roll" /></div>
        <div><Label htmlFor="place">Place / locality *</Label><Input id="place" className="mt-1.5" value={p.place ?? ""} onChange={(e) => setP({ ...p, place: e.target.value })} placeholder="e.g. Kottayam" /><Err k="place" /></div>
      </div>
      <div>
        <Label>Personality type *</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {PERSONALITIES.map((o) => (
            <button type="button" key={o.v} onClick={() => setP({ ...p, personality: o.v })}
              className={cn("rounded-xl border p-3 text-left transition-colors", p.personality === o.v ? "border-primary bg-primary/10" : "border-border hover:bg-secondary")}>
              <div className="font-semibold">{o.v}</div><div className="text-xs text-muted-foreground">{o.d}</div>
            </button>
          ))}
        </div>
        <Err k="personality" />
      </div>
      <div>
        <Label>Areas of interest * <span className="font-normal text-muted-foreground">(pick any)</span></Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button type="button" key={i} onClick={() => toggle(i)}
              className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", p.interests?.includes(i) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary")}>
              {i}
            </button>
          ))}
        </div>
        <Err k="interests" />
      </div>
      <p className="rounded-xl bg-secondary p-3 text-sm text-muted-foreground">Your personality and interests only personalise suggestions. Every activity stays open to you.</p>
      <Button type="submit" size="lg">{submitLabel}</Button>
    </form>
  );
}
