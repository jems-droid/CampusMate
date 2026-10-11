import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Compass, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/campus/ProfileForm";
import { useCampus } from "@/lib/campus/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusMate — Your Campus, Your Pace" },
      { name: "description", content: "CampusMate helps college freshers discover activities, track daily progress and settle into campus life at their own pace." },
      { property: "og:title", content: "CampusMate — Your Campus, Your Pace" },
      { property: "og:description", content: "College life, one step at a time. Activities, quizzes, events and progress for freshers in one place." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { ready, state, saveProfile, login } = useCampus();
  const navigate = useNavigate();
  const [step, setStep] = useState<"welcome" | "form">("welcome");

  useEffect(() => {
    if (ready && state.profile && state.loggedIn) navigate({ to: "/home" });
  }, [ready, state.profile, state.loggedIn, navigate]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <div className="mb-10 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-primary-foreground">C</span>
          <span className="font-display text-2xl font-bold">CampusMate</span>
          <span className="ml-2 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Demo prototype</span>
        </div>

        {step === "welcome" ? (
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="mb-3 font-semibold text-primary">Your Campus, Your Pace.</p>
              <h1 className="font-display text-5xl font-bold leading-[1.05] md:text-6xl">College life, one step at a time.</h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                CampusMate brings your classes, campus events, quick learning activities and personal goals into one calm place — so you can find your next small step without feeling overwhelmed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => setStep("form")}>Get Started</Button>
                {ready && state.profile && (
                  <Button size="lg" variant="outline" onClick={() => { login(); navigate({ to: "/home" }); }}>
                    Continue as {state.profile.name}
                  </Button>
                )}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Demo login only — no real account or password. Your data stays in this browser.</p>
            </div>
            <div className="grid gap-3">
              {[
                { i: Compass, t: "Discover", d: "Events, quizzes, puzzles and short learning activities." },
                { i: Sparkles, t: "Grow privately", d: "Earn XP for small wins. No leaderboards, no streak pressure." },
                { i: BookOpen, t: "Stay on track", d: "A simple daily tracker for classes and personal goals." },
                { i: Users, t: "Meet people", d: "Tea & Talk, study buddies and beginner-friendly meetups." },
              ].map((f) => (
                <div key={f.t} className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground"><f.i className="h-5 w-5" /></span>
                  <div><div className="font-display font-semibold">{f.t}</div><div className="text-sm text-muted-foreground">{f.d}</div></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-card md:p-10">
            <h1 className="font-display text-3xl font-bold">Create your demo profile</h1>
            <p className="mb-6 mt-1 text-muted-foreground">This is a demo sign-in, not a secure account. Everything is saved only in this browser.</p>
            <ProfileForm initial={state.profile} submitLabel="Enter CampusMate" onSubmit={(p) => { saveProfile(p); navigate({ to: "/home" }); }} />
            <button className="mt-4 text-sm text-muted-foreground underline" onClick={() => setStep("welcome")}>Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
