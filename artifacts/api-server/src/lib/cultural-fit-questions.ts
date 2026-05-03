// Cultural Fit question bank.
// 25 questions per industry, namespaced via `cf_<slug>_<n>` so per-applicant
// no-repeat tracking is industry-scoped. Each question has a `bestIndex` that
// represents the most culturally aligned answer (collaborative, ethical,
// accountable, growth-oriented, adaptive). The applicant never sees `bestIndex`
// — it is stripped from the wire payload and only used for server-side grading.

export type CFQuestion = {
  id: string;
  prompt: string;
  options: string[];
  bestIndex: number;
};

const SLUG_MAP: Record<string, string> = {
  "Technology / IT": "tech",
  "BPO / Call Center": "bpo",
  "Healthcare / Medical": "health",
  "Finance / Banking": "fin",
  "Marketing / Advertising": "mkt",
  "Real Estate & Construction": "realestate",
  "Manufacturing & Engineering": "mfg",
  "Retail & E-commerce": "retail",
  "Education & Training": "edu",
  "Hospitality & Tourism": "hosp",
  "Food & Beverage": "fnb",
  "Creative Arts & Design": "creative",
  "Logistics & Transportation": "logistics",
  "Telecommunications": "telecom",
  "Media & Entertainment": "media",
  "Human Resources": "hr",
  "Government & Public Sector": "gov",
  "Agriculture & Environment": "agri",
  "Legal & Compliance": "legal",
  "Architecture & Urban Planning": "arch",
};

export const CF_INDUSTRIES = Object.keys(SLUG_MAP);
export const CF_QUESTIONS_PER_INDUSTRY = 25;
export const CF_QUESTIONS_PER_ATTEMPT = 8;

const BASE_QUESTIONS: Omit<CFQuestion, "id">[] = [
  {
    prompt: "Which workplace environment brings out your best performance?",
    options: [
      "Fast-paced with constant change",
      "Structured with clear processes",
      "Collaborative and team-driven",
      "Independent with minimal supervision",
    ],
    bestIndex: 2,
  },
  {
    prompt: "How do you handle a disagreement with a team member?",
    options: [
      "Address it privately and respectfully",
      "Escalate to a manager immediately",
      "Avoid the conflict until it resolves itself",
      "Discuss it openly in front of the group",
    ],
    bestIndex: 0,
  },
  {
    prompt: "Which company value matters most to you?",
    options: [
      "Innovation and creativity",
      "Integrity and transparency",
      "Collaboration and teamwork",
      "Ambition and individual achievement",
    ],
    bestIndex: 1,
  },
  {
    prompt: "How do you respond when company priorities shift unexpectedly?",
    options: [
      "Embrace the change and help others adapt",
      "Need time to understand before adjusting",
      "Prefer to wait until things stabilise",
      "Push back until the original plan resumes",
    ],
    bestIndex: 0,
  },
  {
    prompt: "You make a mistake that affects your team. What do you do?",
    options: [
      "Quietly fix it before anyone notices",
      "Own it, communicate it, and propose a fix",
      "Wait to be asked before bringing it up",
      "Explain why it wasn't entirely your fault",
    ],
    bestIndex: 1,
  },
  {
    prompt: "A coworker takes credit for work you did. You would:",
    options: [
      "Bring it up privately and clarify the contribution",
      "Call it out publicly in the next meeting",
      "Let it go to keep the peace",
      "Stop sharing your work going forward",
    ],
    bestIndex: 0,
  },
  {
    prompt: "Your manager assigns work outside your usual scope. You would:",
    options: [
      "Refuse — it's not in your job description",
      "Clarify expectations and contribute willingly",
      "Do the minimum required to get by",
      "Accept silently but resent the extra load",
    ],
    bestIndex: 1,
  },
  {
    prompt: "You witness a colleague behaving unethically at work. You would:",
    options: [
      "Ignore it — it's not your business",
      "Confront them aggressively in public",
      "Report it through the proper channel",
      "Gossip about it with other coworkers",
    ],
    bestIndex: 2,
  },
  {
    prompt: "A new team member is clearly struggling. You would:",
    options: [
      "Offer to mentor or pair with them",
      "Wait for the manager to intervene",
      "Avoid working with them until they improve",
      "Critique their work to push them to learn",
    ],
    bestIndex: 0,
  },
  {
    prompt: "How do you view work-life balance?",
    options: [
      "Work always comes first, no matter what",
      "Personal life always comes first",
      "Both matter — set healthy boundaries and stay accountable",
      "Whatever the company tells me is fine",
    ],
    bestIndex: 2,
  },
  {
    prompt: "How do you receive constructive criticism?",
    options: [
      "Welcome it as a chance to grow",
      "Take it personally but try to move on",
      "Defend my position before considering it",
      "Avoid people who give critical feedback",
    ],
    bestIndex: 0,
  },
  {
    prompt: "Your idea is dismissed quickly in a team meeting. You would:",
    options: [
      "Drop it — clearly nobody wants to hear it",
      "Calmly explain your reasoning and invite discussion",
      "Push harder until people agree with you",
      "Complain about it afterwards to teammates",
    ],
    bestIndex: 1,
  },
  {
    prompt: "A tight deadline puts the quality of the work at risk. You would:",
    options: [
      "Cut corners silently to hit the deadline",
      "Miss the deadline without telling anyone",
      "Raise the trade-off early and propose options",
      "Blame the person who set the deadline",
    ],
    bestIndex: 2,
  },
  {
    prompt: "You disagree with a final company decision. You would:",
    options: [
      "Voice your view respectfully, then commit to executing it",
      "Refuse to participate in the rollout",
      "Quietly sabotage the work you don't agree with",
      "Comply but vent publicly to others",
    ],
    bestIndex: 0,
  },
  {
    prompt: "How do you work with teammates from very different backgrounds?",
    options: [
      "Stick to people who think like me",
      "Tolerate differences but keep my distance",
      "Actively learn from different perspectives",
      "Expect them to adapt to my way of working",
    ],
    bestIndex: 2,
  },
  {
    prompt: "Your team shifts to a new working setup (remote, hybrid, on-site). You would:",
    options: [
      "Resist until the company reverses course",
      "Adapt to whatever works best for the team",
      "Only show up if the setup suits me personally",
      "Follow the rules but disengage from teamwork",
    ],
    bestIndex: 1,
  },
  {
    prompt: "What kind of recognition motivates you most?",
    options: [
      "Public spotlight on me individually",
      "Knowing the team succeeded together",
      "A bigger title regardless of impact",
      "Financial reward only — nothing else matters",
    ],
    bestIndex: 1,
  },
  {
    prompt: "A personal issue is affecting your work. You would:",
    options: [
      "Hide it and hope no one notices the slip",
      "Communicate transparently with your manager early",
      "Take random unannounced days off",
      "Blame teammates for missed deliverables",
    ],
    bestIndex: 1,
  },
  {
    prompt: "You're asked to do something that feels ethically gray. You would:",
    options: [
      "Just do it — they're the ones in charge",
      "Decline politely and escalate through the proper channel",
      "Pretend you didn't understand the request",
      "Do it but complain loudly about it later",
    ],
    bestIndex: 1,
  },
  {
    prompt: "A junior colleague makes a visible mistake on a shared task. You would:",
    options: [
      "Coach them through fixing it and learning from it",
      "Report them so it goes on record",
      "Take over the task and do it yourself",
      "Make sure leadership knows it wasn't your fault",
    ],
    bestIndex: 0,
  },
  {
    prompt: "Two departments are stuck in conflict that's blocking your work. You would:",
    options: [
      "Pick a side and dig in",
      "Try to mediate and find common ground",
      "Wait it out until leadership decides",
      "Use it as leverage to advance your own goals",
    ],
    bestIndex: 1,
  },
  {
    prompt: "You're approached for a better-paying role mid-project. You would:",
    options: [
      "Leave immediately — opportunity won't wait",
      "Be transparent with your manager and plan a clean handover",
      "Hide it and quietly disengage",
      "Use the offer to demand a counter and stay regardless",
    ],
    bestIndex: 1,
  },
  {
    prompt: "You've just joined a new team. In the first weeks you would:",
    options: [
      "Push for changes immediately to make an impact",
      "Observe, ask questions, and contribute thoughtfully",
      "Wait to be told exactly what to do",
      "Keep to yourself until you feel established",
    ],
    bestIndex: 1,
  },
  {
    prompt: "How often do you share knowledge or lessons learned with teammates?",
    options: [
      "Regularly — sharing makes the whole team stronger",
      "Only when explicitly asked",
      "Rarely — knowledge is leverage",
      "Never — it's not part of my role",
    ],
    bestIndex: 0,
  },
  {
    prompt: "What does a positive team culture look like to you?",
    options: [
      "Everyone agrees with leadership at all times",
      "Trust, open communication, and shared accountability",
      "No conflict and no hard conversations",
      "Strong individuals competing for top performance",
    ],
    bestIndex: 1,
  },
];

if (BASE_QUESTIONS.length !== CF_QUESTIONS_PER_INDUSTRY) {
  throw new Error(
    `Cultural Fit base bank must have exactly ${CF_QUESTIONS_PER_INDUSTRY} questions, got ${BASE_QUESTIONS.length}`,
  );
}

export function isValidCFIndustry(industry: string): boolean {
  return Object.prototype.hasOwnProperty.call(SLUG_MAP, industry);
}

export function getCulturalFitBank(industry: string): CFQuestion[] {
  const slug = SLUG_MAP[industry];
  if (!slug) return [];
  return BASE_QUESTIONS.map((q, i) => ({ ...q, id: `cf_${slug}_${i + 1}` }));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type PickResult = {
  questions: Array<{ id: string; prompt: string; options: string[] }>;
  remainingPool: number;
  totalPool: number;
  exhausted: boolean;
};

export function pickCulturalFitQuestions(
  industry: string,
  excludeIds: string[],
  count = CF_QUESTIONS_PER_ATTEMPT,
): PickResult {
  const bank = getCulturalFitBank(industry);
  const exclude = new Set(excludeIds);
  const unused = bank.filter(q => !exclude.has(q.id));
  const exhausted = unused.length === 0;
  const pool = exhausted ? bank : unused;
  const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
  return {
    questions: picked.map(({ id, prompt, options }) => ({ id, prompt, options })),
    remainingPool: unused.length,
    totalPool: bank.length,
    exhausted,
  };
}

export type CFGradeDetail = {
  id: string;
  prompt: string;
  picked: number;
  pickedText: string;
  bestIndex: number;
  bestText: string;
  correct: boolean;
};

export type CFGradeResult = {
  score: number;
  correctCount: number;
  total: number;
  details: CFGradeDetail[];
};

export function gradeCulturalFit(
  industry: string,
  questionIds: string[],
  answers: Record<string, number>,
): CFGradeResult {
  const bank = getCulturalFitBank(industry);
  const byId = new Map(bank.map(q => [q.id, q]));
  const details: CFGradeDetail[] = [];
  let correctCount = 0;
  for (const id of questionIds) {
    const q = byId.get(id);
    if (!q) continue;
    const raw = answers[id];
    const picked = typeof raw === "number" && raw >= 0 && raw < q.options.length ? raw : -1;
    const correct = picked === q.bestIndex;
    if (correct) correctCount++;
    details.push({
      id,
      prompt: q.prompt,
      picked,
      pickedText: picked >= 0 ? q.options[picked] : "(no answer)",
      bestIndex: q.bestIndex,
      bestText: q.options[q.bestIndex],
      correct,
    });
  }
  const total = details.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  return { score, correctCount, total, details };
}

// Embedded JSON marker we tuck into the `feedback` text column so we can
// reconstruct the used-question history and per-question detection on retake
// without a schema migration.
const CF_DATA_RE = /\[CF_DATA=([\s\S]*?)\]\s*$/;

export function encodeCFData(payload: { used: string[]; details: CFGradeDetail[]; industry: string }): string {
  return `[CF_DATA=${JSON.stringify(payload)}]`;
}

export function extractCFPayload(
  feedback: string | null | undefined,
): { used: string[]; details: CFGradeDetail[]; industry?: string } | null {
  if (!feedback) return null;
  const m = feedback.match(CF_DATA_RE);
  if (!m) return null;
  try {
    const data = JSON.parse(m[1]);
    if (!data || !Array.isArray(data.used)) return null;
    return data;
  } catch {
    return null;
  }
}

export function extractCFUsedIds(feedback: string | null | undefined): string[] {
  return extractCFPayload(feedback)?.used ?? [];
}
