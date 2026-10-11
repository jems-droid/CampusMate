import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ACTIVITIES, type Activity, type CategoryId, type Personality, type Social, type TaskCategory } from "./data";
import { awardXp, alreadyRewardedToday, localDateKey, rollDay, xpBreakdown, type Completion, type XpState } from "./xp";

export type Profile = { name: string; roll: string; place: string; personality: Personality; interests: string[] };
export type Task = { id: string; title: string; category: TaskCategory; xp: number; date: string; done: boolean; xpAwarded: number };
export type Submission = {
  id: string; title: string; category: CategoryId; description: string; organizer: string;
  date: string; time: string; location: string; durationMin: number; beginner: boolean;
  newcomersWelcome: boolean; interests: string[]; social: Social;
  status: "Pending" | "Approved" | "Rejected"; submittedAt: string;
};
export type HistoryItem = { date: string; label: string; xp: number };

export type CampusState = {
  profile: Profile | null;
  loggedIn: boolean;
  xp: XpState;
  tasks: Task[];
  joined: string[];
  saved: string[];
  attended: Completion[];
  completions: Completion[];
  submissions: Submission[];
  history: HistoryItem[];
};

const KEY = "campusmate:v1";
const empty = (): CampusState => ({
  profile: null, loggedIn: false, xp: { total: 0, today: 0, date: localDateKey() },
  tasks: [], joined: [], saved: [], attended: [], completions: [], submissions: [], history: [],
});

const uid = () => Math.random().toString(36).slice(2, 10);

function submissionToActivity(s: Submission): Activity {
  const d = new Date(`${s.date}T00:00:00`);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return {
    id: s.id, title: s.title, description: s.description, category: s.category, type: "event",
    interests: s.interests, durationMin: s.durationMin, beginner: s.beginner, social: s.social, baseXp: 20,
    organizer: `${s.organizer} (student-submitted)`, dayOffset: Math.round((d.getTime() - now.getTime()) / 86400000),
    time: s.time, location: s.location, newcomersWelcome: s.newcomersWelcome, userSubmitted: true,
  };
}

type Ctx = {
  ready: boolean;
  state: CampusState;
  today: string;
  activities: Activity[];
  getActivity: (id: string) => Activity | undefined;
  openId: string | null;
  openActivity: (id: string | null) => void;
  saveProfile: (p: Profile) => void;
  logout: () => void;
  login: () => void;
  resetAll: () => void;
  toggleJoin: (id: string) => void;
  toggleSave: (id: string) => void;
  markAttended: (id: string) => void;
  completeLearning: (id: string, score?: number, outOf?: number) => number;
  addTask: (t: { title: string; category: TaskCategory; xp: number }) => void;
  completeTask: (id: string) => void;
  removeTask: (id: string) => void;
  submitEvent: (s: Omit<Submission, "id" | "status" | "submittedAt">) => void;
  reviewSubmission: (id: string, status: Submission["status"]) => void;
};

const CampusCtx = createContext<Ctx | null>(null);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CampusState>(empty);
  const [ready, setReady] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const today = ready ? localDateKey() : state.xp.date;
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = { ...empty(), ...JSON.parse(raw) } as CampusState;
        parsed.xp = rollDay(parsed.xp, localDateKey());
        setState(parsed);
      }
    } catch { /* ignore corrupt data */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const activities = useMemo(
    () => [...ACTIVITIES, ...state.submissions.filter((s) => s.status === "Approved").map(submissionToActivity)],
    [state.submissions],
  );
  const getActivity = useCallback((id: string) => activities.find((a) => a.id === id), [activities]);

  const grant = (s: CampusState, amount: number, label: string) => {
    const t = localDateKey();
    const r = awardXp(s.xp, amount, t);
    return { s: { ...s, xp: r.xp, history: r.granted > 0 ? [{ date: t, label, xp: r.granted }, ...s.history].slice(0, 200) : s.history }, granted: r.granted };
  };

  const notifyXp = (granted: number, wanted: number) => {
    if (granted === wanted && granted > 0) toast.success(`+${granted} XP earned`);
    else if (granted > 0) toast.success(`+${granted} XP — you've reached today's 100 XP cap. Nice work!`);
    else if (wanted > 0) toast("Daily XP cap reached — completed anyway. XP resets tomorrow.");
  };

  const value: Ctx = {
    ready, state, today, activities, getActivity, openId, openActivity: setOpenId,
    saveProfile: (p) => setState((s) => ({ ...s, profile: p, loggedIn: true })),
    logout: () => setState((s) => ({ ...s, loggedIn: false })),
    login: () => setState((s) => ({ ...s, loggedIn: true })),
    resetAll: () => { localStorage.removeItem(KEY); setState(empty()); },
    toggleJoin: (id) => {
      const joined = stateRef.current.joined.includes(id);
      setState((s) => ({ ...s, joined: joined ? s.joined.filter((x) => x !== id) : [...s.joined, id] }));
      toast(joined ? "You left this event" : "You're in! Added to My Activities");
    },
    toggleSave: (id) => {
      const saved = stateRef.current.saved.includes(id);
      setState((s) => ({ ...s, saved: saved ? s.saved.filter((x) => x !== id) : [...s.saved, id] }));
      toast(saved ? "Removed from saved" : "Saved for later");
    },
    markAttended: (id) => {
      const s0 = stateRef.current;
      if (s0.attended.some((c) => c.id === id)) return;
      const a = getActivity(id); if (!a) return;
      const want = xpBreakdown(a, s0.profile?.personality).total;
      const { s, granted } = grant(s0, want, a.title);
      setState({ ...s, joined: s.joined.filter((x) => x !== id), attended: [...s.attended, { id, date: localDateKey(), xp: granted }] });
      notifyXp(granted, want);
    },
    completeLearning: (id, score, outOf) => {
      const s0 = stateRef.current;
      const a = getActivity(id); if (!a) return 0;
      const t = localDateKey();
      if (alreadyRewardedToday(s0.completions, id, t)) {
        setState({ ...s0, completions: [...s0.completions, { id, date: t, score, outOf, xp: 0 }] });
        toast("Completed again — XP for this one is already claimed today.");
        return 0;
      }
      const want = xpBreakdown(a, s0.profile?.personality).total;
      const { s, granted } = grant(s0, want, a.title);
      setState({ ...s, completions: [...s.completions, { id, date: t, score, outOf, xp: granted }] });
      notifyXp(granted, want);
      return granted;
    },
    addTask: (t) => { setState((s) => ({ ...s, tasks: [{ ...t, id: uid(), date: localDateKey(), done: false, xpAwarded: 0 }, ...s.tasks] })); toast("Task added"); },
    completeTask: (id) => {
      const s0 = stateRef.current;
      const task = s0.tasks.find((x) => x.id === id);
      if (!task || task.done) return;
      const { s, granted } = grant(s0, task.xp, task.title);
      setState({ ...s, tasks: s.tasks.map((x) => (x.id === id ? { ...x, done: true, xpAwarded: granted } : x)) });
      notifyXp(granted, task.xp);
    },
    removeTask: (id) => setState((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) })),
    submitEvent: (sub) => setState((s) => ({ ...s, submissions: [{ ...sub, id: `sub-${uid()}`, status: "Pending", submittedAt: localDateKey() }, ...s.submissions] })),
    reviewSubmission: (id, status) => setState((s) => ({ ...s, submissions: s.submissions.map((x) => (x.id === id ? { ...x, status } : x)) })),
  };

  return <CampusCtx.Provider value={value}>{children}</CampusCtx.Provider>;
}

export function useCampus() {
  const c = useContext(CampusCtx);
  if (!c) throw new Error("useCampus must be used inside CampusProvider");
  return c;
}
