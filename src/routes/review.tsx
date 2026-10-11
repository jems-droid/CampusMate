import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, PageTitle } from "@/components/campus/AppShell";
import { categoryName } from "@/components/campus/ActivityCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCampus } from "@/lib/campus/store";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Organizer Review (Demo) — CampusMate" },
      { name: "description", content: "Simulated review of student-submitted campus events." },
      { property: "og:title", content: "Organizer Review (Demo) — CampusMate" },
      { property: "og:description", content: "Approve or reject submitted events in this simulated workflow." },
    ],
  }),
  component: () => <AppShell><ReviewPage /></AppShell>,
});

function ReviewPage() {
  const { state, reviewSubmission } = useCampus();
  return (
    <>
      <PageTitle title="Organizer review" subtitle="Simulated demo view. Approving here does not verify any real club or event."
        action={<Button variant="outline" asChild><Link to="/discover">Back to Discover</Link></Button>} />
      {state.submissions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">No submissions yet. Use “Organize an Activity” in Discover.</div>
      ) : (
        <ul className="space-y-3">
          {state.submissions.map((s) => (
            <li key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                    <Badge variant={s.status === "Approved" ? "default" : s.status === "Rejected" ? "destructive" : "secondary"}>{s.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{categoryName(s.category)} · {s.organizer} · {s.date} {s.time} · {s.location} · {s.durationMin} min</p>
                  <p className="mt-2 text-sm">{s.description}</p>
                </div>
                <div className="flex gap-2">
                  {s.status !== "Approved" && <Button size="sm" onClick={() => reviewSubmission(s.id, "Approved")}>Approve</Button>}
                  {s.status !== "Rejected" && <Button size="sm" variant="outline" onClick={() => reviewSubmission(s.id, "Rejected")}>Reject</Button>}
                  {s.status !== "Pending" && <Button size="sm" variant="ghost" onClick={() => reviewSubmission(s.id, "Pending")}>Reset</Button>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-sm text-muted-foreground">Only approved events appear in Discover listings.</p>
    </>
  );
}
