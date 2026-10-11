import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageTitle } from "@/components/campus/AppShell";
import { ProfileForm } from "@/components/campus/ProfileForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useCampus } from "@/lib/campus/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — CampusMate" },
      { name: "description", content: "Your CampusMate profile, preferences and progress." },
      { property: "og:title", content: "Profile — CampusMate" },
      { property: "og:description", content: "Edit your interests and see your progress." },
    ],
  }),
  component: () => <AppShell><ProfilePage /></AppShell>,
});

function ProfilePage() {
  const { state, saveProfile, logout, resetAll } = useCampus();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const p = state.profile!;
  const learningDone = new Set(state.completions.map((c) => c.id)).size;

  const stats = [
    { k: "Total XP", v: state.xp.total },
    { k: "Activities joined", v: state.joined.length + state.attended.length },
    { k: "Tasks completed", v: state.tasks.filter((t) => t.done).length },
    { k: "Learning activities done", v: learningDone },
  ];

  return (
    <>
      <PageTitle title="Profile" subtitle="Your details, preferences and progress."
        action={<Button variant="outline" onClick={() => { logout(); navigate({ to: "/" }); }}>Log out</Button>} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.k} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="font-display text-3xl font-bold text-primary">{s.v}</div><div className="text-sm text-muted-foreground">{s.k}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        {editing ? (
          <>
            <h2 className="mb-4 font-display text-xl font-semibold">Edit profile & preferences</h2>
            <ProfileForm initial={p} submitLabel="Save changes" onSubmit={(np) => { saveProfile(np); setEditing(false); toast.success("Profile updated — recommendations refreshed"); }} />
            <Button variant="ghost" className="mt-2" onClick={() => setEditing(false)}>Cancel</Button>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold">{p.name}</h2>
                <p className="text-muted-foreground">Roll no. {p.roll} · {p.place}</p>
              </div>
              <Button onClick={() => setEditing(true)}>Edit profile</Button>
            </div>
            <div className="mt-4"><span className="text-sm text-muted-foreground">Personality: </span><Badge variant="secondary">{p.personality}</Badge></div>
            <div className="mt-3 flex flex-wrap gap-1.5">{p.interests.map((i) => <Badge key={i} variant="outline">{i}</Badge>)}</div>
          </>
        )}
      </div>

      {state.history.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-2 font-display text-xl font-semibold">Recent XP</h2>
          <ul className="divide-y divide-border text-sm">
            {state.history.slice(0, 10).map((h, i) => (
              <li key={i} className="flex justify-between py-2"><span>{h.label} <span className="text-muted-foreground">· {h.date}</span></span><span className="font-semibold text-primary">+{h.xp}</span></li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-secondary p-5 text-sm text-muted-foreground">
        <p>Your profile and progress are saved locally in this browser for this prototype. Logging out keeps your data; it's only deleted if you reset below.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="ghost" className="mt-3 text-destructive hover:text-destructive">Reset all data</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Reset everything?</AlertDialogTitle><AlertDialogDescription>This deletes your profile, XP, tasks and activity history from this browser.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { resetAll(); navigate({ to: "/" }); }}>Reset</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
