export type Personality = "Introvert" | "Extrovert" | "Ambivert";
export type CategoryId = "learn" | "think" | "create" | "meet";
export type ActivityType = "event" | "quiz" | "puzzle" | "learning";
export type Social = "quiet" | "group" | "mixed";

export const INTERESTS = [
  "Coding and technology",
  "Hackathons and projects",
  "Academics and study groups",
  "AI and emerging technologies",
  "Quizzes, puzzles and problem-solving",
  "Music, dance and art",
  "Gaming and sports",
  "Photography and reading",
  "Food and exploring places",
  "Cultural activities and volunteering",
  "Career exploration and skill development",
] as const;

export const CATEGORIES: { id: CategoryId; name: string; blurb: string }[] = [
  { id: "learn", name: "Learn & Build", blurb: "Coding circles, workshops, talks and skills" },
  { id: "think", name: "Think & Solve", blurb: "Quick quizzes, puzzles and challenges" },
  { id: "create", name: "Create & Play", blurb: "Music, art, games, sports and culture" },
  { id: "meet", name: "Meet & Explore", blurb: "Meet people and find your way around" },
];

export const TYPE_LABEL: Record<ActivityType, string> = {
  event: "Event",
  quiz: "Quiz",
  puzzle: "Puzzle",
  learning: "Learning activity",
};

export const SOCIAL_LABEL: Record<Social, string> = {
  quiet: "Quiet / solo or small group",
  group: "Group & interactive",
  mixed: "Solo with optional group time",
};

export type Question = { q: string; options: string[]; answer: number; explain: string };

export type Activity = {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  type: ActivityType;
  interests: string[];
  durationMin: number;
  beginner: boolean;
  social: Social;
  baseXp: number;
  // events
  organizer?: string;
  dayOffset?: number;
  time?: string;
  location?: string;
  newcomersWelcome?: boolean;
  // quiz / puzzle / learning
  topic?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  questions?: Question[];
  sections?: { heading: string; body: string }[];
  userSubmitted?: boolean;
};

const I = INTERESTS;

export const ACTIVITIES: Activity[] = [
  // ---------- Learn & Build: events ----------
  { id: "ev-coding-circle", title: "Beginner Coding Circle", description: "A relaxed weekly circle where first-years write small programs together. Bring a laptop, or just come and watch.", category: "learn", type: "event", interests: [I[0], I[1]], durationMin: 90, beginner: true, social: "mixed", baseXp: 20, organizer: "Coding Club (sample)", dayOffset: 1, time: "17:30", location: "Lab 2, Academic Block", newcomersWelcome: true },
  { id: "ev-hackathon-prep", title: "Hackathon Prep: Your First 24 Hours", description: "Learn how hackathons work, how teams form and how to scope a small idea you can actually finish.", category: "learn", type: "event", interests: [I[1], I[0]], durationMin: 120, beginner: true, social: "group", baseXp: 20, organizer: "Innovation Cell (sample)", dayOffset: 3, time: "16:00", location: "Seminar Hall A", newcomersWelcome: true },
  { id: "ev-study-group", title: "Group Study: Maths I", description: "Work through this week's problem set in small groups. Seniors drop by to help.", category: "learn", type: "event", interests: [I[2]], durationMin: 60, beginner: true, social: "quiet", baseXp: 20, organizer: "Peer Learning Network (sample)", dayOffset: 2, time: "19:00", location: "Library, Room 3", newcomersWelcome: true },
  { id: "ev-ai-talk", title: "Tech Talk: What Can AI Actually Do?", description: "A friendly, jargon-free talk on everyday AI tools, their limits, and how to use them responsibly in coursework.", category: "learn", type: "event", interests: [I[3], I[0]], durationMin: 60, beginner: true, social: "quiet", baseXp: 20, organizer: "AI Society (sample)", dayOffset: 4, time: "18:00", location: "Auditorium", newcomersWelcome: true },
  { id: "ev-github", title: "Open Source & GitHub Basics Workshop", description: "Create your first repository, make a commit and open a pull request — hands-on.", category: "learn", type: "event", interests: [I[0], I[10]], durationMin: 90, beginner: true, social: "mixed", baseXp: 20, organizer: "FOSS Club (sample)", dayOffset: 6, time: "15:00", location: "Lab 4", newcomersWelcome: true },
  { id: "ev-app-build", title: "Build a Mini App in an Evening", description: "Project-building workshop: pair up and ship a tiny to-do app by the end of the session.", category: "learn", type: "event", interests: [I[1], I[0]], durationMin: 150, beginner: false, social: "group", baseXp: 20, organizer: "Developer Students Club (sample)", dayOffset: 9, time: "17:00", location: "Innovation Lab", newcomersWelcome: true },
  // ---------- Learn & Build: learning ----------
  { id: "ln-uiux", title: "What does a UI/UX designer do?", description: "A five-minute look at a day in the life of a product designer, and how to try it out in college.", category: "learn", type: "learning", topic: "Career exploration", interests: [I[10], I[5]], durationMin: 5, beginner: true, social: "quiet", baseXp: 10,
    sections: [
      { heading: "The role", body: "UI/UX designers figure out how an app should work and feel. They talk to users, sketch screens, build clickable prototypes and test them." },
      { heading: "Skills you can start now", body: "Notice apps that frustrate you and ask why. Try sketching a better version on paper. Free tools like Figma let you build prototypes." },
      { heading: "Try it in college", body: "Volunteer to design posters or a club website. Join a hackathon team as the designer — teams always need one." },
    ] },
  { id: "ln-cyber", title: "Intro to Cybersecurity", description: "What cybersecurity people actually do, plus three habits to protect your own accounts today.", category: "learn", type: "learning", topic: "Cybersecurity", interests: [I[0], I[10]], durationMin: 6, beginner: true, social: "quiet", baseXp: 10,
    sections: [
      { heading: "The field", body: "Security professionals find weaknesses before attackers do — testing systems, monitoring networks and responding to incidents." },
      { heading: "Three habits", body: "Use a password manager, turn on two-factor authentication for email, and pause before clicking links that create urgency." },
      { heading: "Explore further", body: "Capture-the-flag (CTF) competitions are beginner-friendly puzzle games that teach real security skills." },
    ] },
  { id: "ln-appdev", title: "App Development in 5 Minutes", description: "Web, Android, iOS or cross-platform? A short map of the app-development world.", category: "learn", type: "learning", topic: "App development", interests: [I[0], I[1]], durationMin: 5, beginner: true, social: "quiet", baseXp: 10,
    sections: [
      { heading: "Four paths", body: "Web apps run in a browser. Native apps are built for Android (Kotlin) or iOS (Swift). Cross-platform tools like Flutter or React Native target both." },
      { heading: "Where to begin", body: "HTML, CSS and JavaScript are the friendliest start — you can see results instantly in a browser." },
      { heading: "First project", body: "Build something you would use: a timetable, an expense tracker or a mess menu viewer." },
    ] },
  { id: "ln-skill-notes", title: "Skill Challenge: Take Better Lecture Notes", description: "Try the Cornell note-taking method in your next class.", category: "learn", type: "learning", topic: "Study skills", interests: [I[2], I[10]], durationMin: 8, beginner: true, social: "quiet", baseXp: 15,
    sections: [
      { heading: "The method", body: "Split your page: a narrow cue column on the left, notes on the right, and a summary strip at the bottom." },
      { heading: "After class", body: "Write questions in the cue column, then cover your notes and try answering them. This is active recall." },
      { heading: "Your challenge", body: "Use this layout in one lecture this week and write a three-line summary at the end." },
    ] },
  // ---------- Think & Solve ----------
  { id: "qz-ai-myths", title: "AI: Myth or Fact?", description: "Five quick statements about AI. Can you tell hype from reality?", category: "think", type: "quiz", topic: "AI", difficulty: "Easy", interests: [I[3], I[4]], durationMin: 5, beginner: true, social: "quiet", baseXp: 10,
    questions: [
      { q: "AI chatbots always give factually correct answers.", options: ["Myth", "Fact"], answer: 0, explain: "Chatbots can produce confident but wrong answers (\"hallucinations\"). Always verify important facts." },
      { q: "Machine learning models learn patterns from data.", options: ["Myth", "Fact"], answer: 1, explain: "That's the core idea: models adjust themselves to fit patterns in training data." },
      { q: "AI systems can reflect biases present in their training data.", options: ["Myth", "Fact"], answer: 1, explain: "If the data is skewed, the model's outputs can be too." },
      { q: "You need a PhD to start learning about AI.", options: ["Myth", "Fact"], answer: 0, explain: "Many free beginner courses need only school-level maths and some curiosity." },
      { q: "AI models understand the world exactly like humans do.", options: ["Myth", "Fact"], answer: 0, explain: "They process patterns in data; they don't have human experiences or understanding." },
    ] },
  { id: "qz-tech", title: "Tech Basics Quiz", description: "Warm-up questions on everyday computing.", category: "think", type: "quiz", topic: "Technology", difficulty: "Easy", interests: [I[0], I[4]], durationMin: 4, beginner: true, social: "quiet", baseXp: 10,
    questions: [
      { q: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Power Utility", "Core Program Unit", "Central Peripheral Unit"], answer: 0, explain: "The CPU executes program instructions — the 'brain' of a computer." },
      { q: "Which of these is a version control system?", options: ["Docker", "Git", "Linux", "Python"], answer: 1, explain: "Git tracks changes to code over time and helps teams collaborate." },
      { q: "How many bits are in a byte?", options: ["4", "8", "16", "32"], answer: 1, explain: "One byte = 8 bits." },
      { q: "HTTPS differs from HTTP because it…", options: ["Is faster", "Encrypts traffic", "Uses no servers", "Only works on phones"], answer: 1, explain: "The S stands for secure: data is encrypted between you and the website." },
    ] },
  { id: qid("output"), title: "Predict the Output", description: "Read short code snippets and guess what they print.", category: "think", type: "quiz", topic: "Beginner coding", difficulty: "Medium", interests: [I[0], I[4]], durationMin: 6, beginner: true, social: "quiet", baseXp: 10,
    questions: [
      { q: "Python: print(3 * \"ab\")", options: ["ababab", "3ab", "Error", "ab ab ab"], answer: 0, explain: "Multiplying a string by an integer repeats it." },
      { q: "Python: print(7 // 2)", options: ["3.5", "3", "4", "2"], answer: 1, explain: "// is floor division, so 7 // 2 is 3." },
      { q: "JavaScript: console.log(\"2\" + 2)", options: ["4", "22", "NaN", "Error"], answer: 1, explain: "+ with a string concatenates, giving \"22\"." },
      { q: "Python: x = [1, 2, 3]; print(len(x))", options: ["2", "3", "6", "1"], answer: 1, explain: "len() returns the number of items: 3." },
    ] },
  { id: "qz-safety", title: "Digital Safety Check", description: "Spot phishing and protect your accounts.", category: "think", type: "quiz", topic: "Cybersecurity", difficulty: "Easy", interests: [I[0], I[4]], durationMin: 4, beginner: true, social: "quiet", baseXp: 10,
    questions: [
      { q: "An email says your college account will be deleted in 1 hour unless you click a link. Best move?", options: ["Click quickly", "Reply with your password", "Check with IT through the official site", "Forward to friends"], answer: 2, explain: "Urgency is a classic phishing trick. Verify through official channels." },
      { q: "Which password is strongest?", options: ["password123", "Rahul2007", "correct-horse-battery-staple", "qwerty"], answer: 2, explain: "Long passphrases of random words are hard to guess and easy to remember." },
      { q: "Two-factor authentication adds…", options: ["A second password", "A second proof like an OTP", "Faster logins", "Nothing useful"], answer: 1, explain: "Even if your password leaks, attackers also need the second factor." },
    ] },
  { id: "qz-gk", title: "Campus GK Challenge", description: "General knowledge with a science-and-world twist.", category: "think", type: "quiz", topic: "General knowledge", difficulty: "Medium", interests: [I[4], I[2]], durationMin: 5, beginner: true, social: "quiet", baseXp: 10,
    questions: [
      { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], answer: 1, explain: "Iron oxide on Mars' surface gives it a reddish colour." },
      { q: "Who is known as the 'Missile Man of India'?", options: ["C. V. Raman", "A. P. J. Abdul Kalam", "Homi Bhabha", "Vikram Sarabhai"], answer: 1, explain: "Dr. Kalam led India's missile development programmes." },
      { q: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], answer: 2, explain: "Au comes from the Latin 'aurum'." },
    ] },
  { id: "pz-logic", title: "Logic Puzzle: Who Sits Where?", description: "Three classic logic riddles to stretch your brain.", category: "think", type: "puzzle", topic: "Logic", difficulty: "Medium", interests: [I[4]], durationMin: 7, beginner: true, social: "quiet", baseXp: 10,
    questions: [
      { q: "A bat and a ball cost ₹110 together. The bat costs ₹100 more than the ball. How much is the ball?", options: ["₹10", "₹5", "₹1", "₹15"], answer: 1, explain: "Ball = x, bat = x + 100. 2x + 100 = 110, so x = 5." },
      { q: "Asha, Ben and Chitra sit in a row. Asha is not at either end. Ben is left of Asha. Who is on the right end?", options: ["Asha", "Ben", "Chitra", "Can't tell"], answer: 2, explain: "Asha is in the middle and Ben is on her left, so Chitra is on the right end." },
      { q: "If it takes 5 machines 5 minutes to make 5 widgets, how long for 100 machines to make 100 widgets?", options: ["100 min", "20 min", "5 min", "1 min"], answer: 2, explain: "Each machine makes one widget in 5 minutes, regardless of how many machines." },
    ] },
  { id: "pz-riddles", title: "Riddle Break", description: "Three quick riddles for a study break.", category: "think", type: "puzzle", topic: "Riddles", difficulty: "Easy", interests: [I[4], I[7]], durationMin: 3, beginner: true, social: "quiet", baseXp: 10,
    questions: [
      { q: "What has keys but can't open locks?", options: ["A map", "A piano", "A door", "A wallet"], answer: 1, explain: "A piano has keys — musical ones." },
      { q: "The more you take, the more you leave behind. What are they?", options: ["Footsteps", "Notes", "Photos", "Breaths"], answer: 0, explain: "Every step you take leaves a footprint behind." },
      { q: "What comes once in a minute, twice in a moment, never in a thousand years?", options: ["Time", "The letter M", "A second", "Luck"], answer: 1, explain: "Count the letter 'm' in each phrase." },
    ] },
  // ---------- Create & Play ----------
  { id: "ev-music-jam", title: "Open Music Jam", description: "Bring an instrument, your voice, or just your ears. No auditions, no pressure.", category: "create", type: "event", interests: [I[5], I[9]], durationMin: 90, beginner: true, social: "group", baseXp: 20, organizer: "Music Club (sample)", dayOffset: 2, time: "18:30", location: "Open Air Theatre", newcomersWelcome: true },
  { id: "ev-dance", title: "Dance Basics for Absolute Beginners", description: "Learn a simple routine with others who are also new to dance.", category: "create", type: "event", interests: [I[5]], durationMin: 60, beginner: true, social: "group", baseXp: 20, organizer: "Dance Crew (sample)", dayOffset: 5, time: "19:00", location: "Student Activity Centre", newcomersWelcome: true },
  { id: "ev-sketch", title: "Quiet Sketching Meetup", description: "Draw together in near-silence. Pencils and paper provided.", category: "create", type: "event", interests: [I[5], I[7]], durationMin: 60, beginner: true, social: "quiet", baseXp: 20, organizer: "Fine Arts Society (sample)", dayOffset: 3, time: "17:00", location: "Art Room, Block C", newcomersWelcome: true },
  { id: "ev-gaming", title: "Freshers' Gaming Night", description: "Casual multiplayer games and board games — teams are mixed on the spot.", category: "create", type: "event", interests: [I[6]], durationMin: 120, beginner: true, social: "group", baseXp: 20, organizer: "Gaming Club (sample)", dayOffset: 4, time: "20:00", location: "Common Room, Hostel 1", newcomersWelcome: true },
  { id: "ev-football", title: "Evening Football Kickabout", description: "Friendly, mixed-skill football. Just show up in comfortable shoes.", category: "create", type: "event", interests: [I[6]], durationMin: 60, beginner: true, social: "group", baseXp: 20, organizer: "Sports Council (sample)", dayOffset: 1, time: "17:00", location: "Main Ground", newcomersWelcome: true },
  { id: "ev-photo-walk", title: "Campus Photography Walk", description: "Explore campus through a lens — phone cameras are perfect.", category: "create", type: "event", interests: [I[7], I[8]], durationMin: 75, beginner: true, social: "mixed", baseXp: 20, organizer: "Photography Club (sample)", dayOffset: 6, time: "07:00", location: "Meet at Main Gate", newcomersWelcome: true },
  { id: "ev-cultural", title: "Onam Rangoli Workshop", description: "Learn to make a pookalam with flowers and colours, then help decorate the foyer.", category: "create", type: "event", interests: [I[9], I[5]], durationMin: 90, beginner: true, social: "mixed", baseXp: 20, organizer: "Cultural Committee (sample)", dayOffset: 8, time: "10:00", location: "Admin Block Foyer", newcomersWelcome: true },
  // ---------- Meet & Explore ----------
  { id: "ev-tea-talk", title: "Tea & Talk", description: "Small tables, chai and easy conversation prompts. Stay five minutes or an hour.", category: "meet", type: "event", interests: [I[8], I[9]], durationMin: 45, beginner: true, social: "mixed", baseXp: 20, organizer: "Student Wellbeing Cell (sample)", dayOffset: 1, time: "16:30", location: "Canteen Lawn", newcomersWelcome: true },
  { id: "ev-club-fair", title: "Beginner-friendly Club Meetup", description: "Meet several clubs in one place and ask questions without signing up for anything.", category: "meet", type: "event", interests: [I[9], I[10]], durationMin: 90, beginner: true, social: "group", baseXp: 20, organizer: "Student Council (sample)", dayOffset: 5, time: "15:00", location: "Central Courtyard", newcomersWelcome: true },
  { id: "ev-study-buddy", title: "Study Buddy Matching Session", description: "Find one or two study partners for your courses through a short, quiet matching activity.", category: "meet", type: "event", interests: [I[2]], durationMin: 40, beginner: true, social: "quiet", baseXp: 20, organizer: "Peer Learning Network (sample)", dayOffset: 2, time: "13:00", location: "Library Foyer", newcomersWelcome: true },
  { id: "ev-campus-walk", title: "Campus Exploration Walk", description: "A guided walk covering labs, the health centre, sports facilities and the best snack spots.", category: "meet", type: "event", interests: [I[8]], durationMin: 60, beginner: true, social: "mixed", baseXp: 20, organizer: "Freshers' Mentors (sample)", dayOffset: 3, time: "08:00", location: "Meet at Main Gate", newcomersWelcome: true },
  { id: "ev-library", title: "Library Orientation", description: "How to find books, use e-resources and book discussion rooms.", category: "meet", type: "event", interests: [I[2], I[7]], durationMin: 45, beginner: true, social: "quiet", baseXp: 20, organizer: "Central Library (sample)", dayOffset: 4, time: "11:00", location: "Central Library", newcomersWelcome: true },
  { id: "ev-peer", title: "Peer-learning: Seniors Answer Anything", description: "Informal Q&A with seniors about courses, electives and settling in.", category: "meet", type: "event", interests: [I[10], I[2]], durationMin: 60, beginner: true, social: "mixed", baseXp: 20, organizer: "Freshers' Mentors (sample)", dayOffset: 7, time: "18:00", location: "Seminar Hall B", newcomersWelcome: true },
  { id: "ln-quiet-spots", title: "Find Your Quiet Study Spot", description: "A self-guided mini-quest: visit two quiet spots on campus and pick a favourite.", category: "meet", type: "learning", topic: "Campus exploration", interests: [I[8], I[2]], durationMin: 20, beginner: true, social: "quiet", baseXp: 10,
    sections: [
      { heading: "Spot ideas", body: "The library's upper floor, an empty classroom after 5 pm, a bench near the lake or a reading corner in your hostel." },
      { heading: "What to check", body: "Noise level, charging points, Wi-Fi, lighting and how long you can stay." },
      { heading: "Your mission", body: "Visit two spots this week and note which one helped you focus best." },
    ] },
];

function qid(s: string) {
  return `qz-${s}`;
}

export const NEXT_STEPS: { title: string; activityId?: string; xpLabel: string }[] = [
  { title: "Explore the campus library", activityId: "ev-library", xpLabel: "Library visit" },
  { title: "Try a five-minute AI quiz", activityId: "qz-ai-myths", xpLabel: "Quiz" },
  { title: "Solve a logic puzzle", activityId: "pz-logic", xpLabel: "Puzzle" },
  { title: "Explore what a UI/UX designer does", activityId: "ln-uiux", xpLabel: "Learning" },
  { title: "Join a beginner-friendly coding circle", activityId: "ev-coding-circle", xpLabel: "Club meeting" },
  { title: "Attend a music jam", activityId: "ev-music-jam", xpLabel: "New activity" },
  { title: "Find your quiet study spot", activityId: "ln-quiet-spots", xpLabel: "Exploration" },
];

export const TASK_CATEGORIES = [
  "Academics",
  "Campus exploration",
  "Activities and clubs",
  "Learning and skill development",
  "Personal goals",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const XP_TABLE: { label: string; xp: number; category: TaskCategory }[] = [
  { label: "Complete an assignment", xp: 20, category: "Academics" },
  { label: "Study for 30 minutes", xp: 15, category: "Academics" },
  { label: "Revise a topic", xp: 10, category: "Academics" },
  { label: "Complete a project milestone", xp: 25, category: "Learning and skill development" },
  { label: "Explore a campus location", xp: 10, category: "Campus exploration" },
  { label: "Visit the library", xp: 10, category: "Campus exploration" },
  { label: "Attend a club meeting", xp: 20, category: "Activities and clubs" },
  { label: "Join a group study session", xp: 20, category: "Academics" },
  { label: "Complete a quiz or puzzle", xp: 10, category: "Learning and skill development" },
  { label: "Finish a short learning activity", xp: 10, category: "Learning and skill development" },
  { label: "Attend a workshop or tech talk", xp: 20, category: "Activities and clubs" },
  { label: "Complete a practical skill challenge", xp: 15, category: "Learning and skill development" },
  { label: "Try a new campus activity", xp: 15, category: "Personal goals" },
];

export function eventDate(dayOffset: number, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + dayOffset);
  return d;
}
