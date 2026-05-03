// AI Readiness question bank.
// 50 questions per industry, namespaced via `ai_<slug>_<n>` so per-applicant
// no-repeat tracking is industry-scoped. Each question has a `bestIndex` that
// represents the most aligned answer. The applicant never sees `bestIndex` —
// it is stripped from the wire payload and only used for server-side grading.
//
// The shared pool is reshuffled deterministically per applicant (seeded by
// applicantId + a time salt) so two users see different orderings, while
// retakes naturally surface fresh questions until the pool is exhausted.

export type AIQuestion = {
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
  "Virtual Assistance": "vassist",
};

export const AI_QUESTIONS_PER_INDUSTRY = 50;
export const AI_QUESTIONS_PER_ATTEMPT = 8;

const BASE_QUESTIONS: Omit<AIQuestion, "id">[] = [
  { prompt: "When starting a task you've never done before, your first instinct is to:", options: ["Wait for someone to train you", "Try an AI assistant to outline an approach, then refine", "Avoid the task until it's reassigned", "Ask a colleague to do it for you"], bestIndex: 1 },
  { prompt: "Which of these prompts is most likely to yield a useful first draft?", options: ["\"Write something good.\"", "\"Write a 200-word summary of this report for a non-technical executive, in plain English, with 3 key takeaways.\"", "\"Make it nice.\"", "\"Help me with this.\""], bestIndex: 1 },
  { prompt: "An AI confidently gives you a statistic with no source. The right next step is:", options: ["Quote it directly in your report", "Verify it against a primary source before using", "Trust it because the AI sounded confident", "Drop the statistic entirely without checking"], bestIndex: 1 },
  { prompt: "Before pasting a customer's full name, address, and ID number into a public AI chatbot, you should:", options: ["Check the data policy and redact personal information first", "Paste it as-is to save time", "Translate it to another language first", "Encrypt the text but paste anyway"], bestIndex: 0 },
  { prompt: "A teammate says \"AI will replace us all.\" The most measured professional response is:", options: ["Agree and stop investing in your skills", "Recognise AI is a tool that reshapes work, and focus on using it well", "Refuse to engage with AI on principle", "Quit before you're replaced"], bestIndex: 1 },
  { prompt: "After AI writes a function or formula for you, the right next step is:", options: ["Ship it directly with no review", "Read it, test it, and confirm it does what you intended", "Forward it to a colleague to ship", "Trust it because the AI explained its reasoning"], bestIndex: 1 },
  { prompt: "Your first AI answer came back vague and generic. The best move is:", options: ["Give up and write it from scratch", "Refine the prompt with more context, constraints, and examples", "Ask the exact same question again", "Switch to a different language"], bestIndex: 1 },
  { prompt: "When stuck on a creative or strategic problem, AI is most useful for:", options: ["Generating 10 starting ideas you can refine", "Replacing your judgment entirely", "Writing the final version with no edits", "Avoiding the problem"], bestIndex: 0 },
  { prompt: "An AI screening tool keeps recommending only one demographic of candidates. You should:", options: ["Trust the algorithm", "Audit the training data and outputs for bias before relying on it", "Use it more aggressively", "Hide the discrepancy"], bestIndex: 1 },
  { prompt: "A free, public AI chatbot may retain your inputs for training by default. For confidential work files, the safer choice is:", options: ["Use an enterprise or private deployment with documented no-training guarantees", "Paste it anyway — no one will notice", "Email it to yourself first, then paste", "Skip the AI entirely and stay manual"], bestIndex: 0 },
  { prompt: "You need a clear draft email in 30 seconds. The most productive move is:", options: ["Write a focused prompt with audience and tone, then edit the AI output", "Write it from scratch with no help", "Wait for someone else to draft it", "Copy a generic template unchanged"], bestIndex: 0 },
  { prompt: "An AI says it \"remembers\" your last conversation when you've started a fresh chat. You should:", options: ["Believe it — AI knows everything", "Recognise that without explicit memory features, sessions start from zero", "Argue with the model", "Restart your computer"], bestIndex: 1 },
  { prompt: "AI in your role is best framed as:", options: ["A drop-in replacement for you", "A force multiplier that handles routine tasks while you handle judgment", "A threat to be ignored", "A novelty that doesn't apply to your work"], bestIndex: 1 },
  { prompt: "If your employer asks you to learn a new AI tool in 30 days, the most professional approach is:", options: ["Resist and request a deferral", "Block 20 minutes a day to practice on real work tasks", "Pretend to learn it without trying", "Ask someone else to learn it for you"], bestIndex: 1 },
  { prompt: "When AI writes a report for you, who owns the correctness of the final output?", options: ["The AI vendor", "You — you sign your name to it", "Your manager", "Nobody, since AI wrote it"], bestIndex: 1 },
  { prompt: "Your firm requires disclosure when AI substantially produces a deliverable. You:", options: ["Disclose it transparently", "Hide the AI use to look more impressive", "Mention only \"research help\"", "Argue the policy is unfair and ignore it"], bestIndex: 0 },
  { prompt: "For a complex multi-part task, the most productive prompt format includes:", options: ["Just the question, no context", "Role, context, clear task, format/constraints, and an example", "Your personal autobiography", "A long list of unrelated topics"], bestIndex: 1 },
  { prompt: "For analysing sensitive client data, the right AI tool is:", options: ["Whichever consumer chatbot is most popular", "Whichever is fastest", "An enterprise tool with documented data handling and no-training guarantees", "Skip AI entirely — it's never appropriate"], bestIndex: 2 },
  { prompt: "A regulator asks why an AI system recommended a particular outcome. The right response is:", options: ["\"Because the AI said so.\"", "Provide the input features, weighting, and decision rationale you can audit", "Refuse to answer", "Blame the vendor and move on"], bestIndex: 1 },
  { prompt: "An AI's polished essay contradicts your domain expertise. You should:", options: ["Defer to the AI's confidence", "Trust your domain expertise and verify the AI's claims", "Post it anyway because it sounds good", "Ask another AI to rewrite it without checking"], bestIndex: 1 },
  { prompt: "Promising your manager \"AI will solve this in one day\" without piloting first is:", options: ["Confident and bold", "Risky — pilot first, then commit to a timeline", "The professional norm", "Always the correct posture"], bestIndex: 1 },
  { prompt: "With new AI tools launching monthly, the most sustainable habit is:", options: ["Try every new tool fully on release", "Maintain a focused stack and evaluate new tools quarterly with real use cases", "Ignore all updates", "Switch tools weekly to stay current"], bestIndex: 1 },
  { prompt: "A repetitive task you do every week is best handled by:", options: ["Hiring an intern to do it forever", "Scripting or AI-assisted automation, with the workflow documented", "Doing it manually forever", "Skipping it whenever possible"], bestIndex: 1 },
  { prompt: "For high-stakes decisions (hiring, medical, legal, financial), the right setup is:", options: ["Fully autonomous AI", "AI as advisor with a human reviewer who is accountable", "Whichever random colleague is free", "Two AIs cross-checking each other with no human"], bestIndex: 1 },
  { prompt: "AI cites a paper that you can't find on Google Scholar or any library. You should:", options: ["Use the citation anyway — AI must have a source", "Treat it as likely hallucinated; do not cite it", "Make up a similar citation that does exist", "Email the AI vendor for proof"], bestIndex: 1 },
  { prompt: "For a 2-line internal Slack reply, writing a long AI prompt is:", options: ["Always the best practice", "Overkill — write it directly", "Required by every modern policy", "The fastest path"], bestIndex: 1 },
  { prompt: "Before sharing application logs with an AI for debugging, you should:", options: ["Strip credentials, API tokens, and personal information first", "Paste them as-is for full context", "Encrypt the file and paste the encrypted blob", "Skip logs entirely and guess"], bestIndex: 0 },
  { prompt: "For a 5-step task, the most reliable AI usage pattern is:", options: ["One mega-prompt that asks for the whole pipeline at once", "Walk the AI through each step, verifying outputs along the way", "Skip steps the AI says are optional", "Run the same prompt 5 times and pick one"], bestIndex: 1 },
  { prompt: "AI references a library function that doesn't exist when you check the official docs. The most likely explanation is:", options: ["The function is hidden in the library", "The AI is hallucinating; verify against official documentation", "The library is silently out of date", "Your environment is broken"], bestIndex: 1 },
  { prompt: "For \"what's the latest exchange rate today\", the right tool is:", options: ["A generic LLM with no live data access", "A live data source or an AI with real-time/web tools enabled", "Yesterday's news article", "Your gut feel"], bestIndex: 1 },
  { prompt: "You should treat AI output most skeptically when it involves:", options: ["General common-sense knowledge", "Recent events, niche expertise, or specific numbers and citations", "Casual cooking suggestions", "A poem or short story"], bestIndex: 1 },
  { prompt: "To match a specific corporate or brand tone, the prompt should include:", options: ["Nothing — defaults are fine", "An example paragraph in the desired tone, plus tone descriptors", "A complaint about previous outputs", "A demand for perfection"], bestIndex: 1 },
  { prompt: "Saving prompts that work well for your team is useful because:", options: ["It bloats your drive with no benefit", "Reusable, version-controlled prompts compound team productivity", "Prompts are private and shouldn't be shared", "Vendors require it for billing"], bestIndex: 1 },
  { prompt: "A colleague asks you to use AI to fabricate a glowing client testimonial. You:", options: ["Do it — saves time and looks great", "Refuse and flag the request to a manager or compliance", "Do it but blame the AI if anyone notices", "Generate it but watermark it secretly"], bestIndex: 1 },
  { prompt: "Reviewing AI output for typos but not for facts or logic is:", options: ["Sufficient quality control", "Insufficient — facts, logic, and reasoning must be reviewed too", "Excessive caution", "The standard workflow"], bestIndex: 1 },
  { prompt: "Spending 5 minutes refining a prompt to save 2 hours of editing is:", options: ["A waste of time", "A high-leverage productivity habit", "A form of cheating", "Required only for executives"], bestIndex: 1 },
  { prompt: "Compare \"Write a job description for an engineer\" vs \"Write a 250-word job description for a senior backend engineer in a Manila-based fintech, emphasising payments experience and Go.\" The second prompt is:", options: ["Worse — too restrictive", "Better — yields a more usable, on-target draft", "Identical in quality", "Only useful for HR teams"], bestIndex: 1 },
  { prompt: "AI gives you 3 options for a decision. The right move is:", options: ["Pick one randomly", "Compare each against your real-world constraints and pick deliberately", "Always pick the longest option", "Always pick option 1"], bestIndex: 1 },
  { prompt: "AI lowers the cost of a first draft. As a result, the value of human judgment, taste, and verification:", options: ["Goes to zero — AI handles everything", "Goes up — drafts are cheap, good judgment is rare", "Stays exactly the same", "Becomes irrelevant"], bestIndex: 1 },
  { prompt: "A friend shares a colleague's medical information to ask AI for advice. You:", options: ["Help them craft a great prompt", "Decline and warn about consent and privacy issues", "Use a different AI to seem more careful", "Anonymise it sloppily and proceed"], bestIndex: 1 },
  { prompt: "AI is least appropriate for:", options: ["Drafting common emails", "Real-time emotional support during a personal crisis", "Brainstorming product names", "Summarising long documents"], bestIndex: 1 },
  { prompt: "Running expensive AI calls inside a tight loop with no limits is:", options: ["Smart engineering", "A common cost pitfall — add caching, batching, or rate limits", "Required for performance", "Free of consequences"], bestIndex: 1 },
  { prompt: "Before adopting a new AI model in production, you should review:", options: ["Its colour scheme and marketing copy", "Capabilities, limits, training data assumptions, and known failure modes", "Only the vendor's tagline", "Only social-media buzz"], bestIndex: 1 },
  { prompt: "After 3 months of heavy AI assistance on every task, the healthiest practice is:", options: ["Use AI for every keystroke from now on", "Periodically do tasks unaided to keep underlying skills sharp", "Stop using AI completely out of fear", "Switch tools every day"], bestIndex: 1 },
  { prompt: "The tasks AI helps you with the least are typically:", options: ["Repetitive structured tasks like formatting", "Live human relationships, sensitive negotiations, and tacit local context", "Summaries of long documents", "Translations between common languages"], bestIndex: 1 },
  { prompt: "When you discover a great AI workflow, the highest-leverage move is:", options: ["Keep it secret to look smart", "Share it with your team, with examples and known limits", "Post it on social media only", "Forget it after the project ends"], bestIndex: 1 },
  { prompt: "Asking an AI to critique your own draft before submitting is:", options: ["Lazy or unprofessional", "A useful second-pass tool when you apply judgment to its feedback", "Always required", "Forbidden by most teams"], bestIndex: 1 },
  { prompt: "New AI workflows in your team typically pay off:", options: ["On day one with no tuning", "After a few iterations of refining prompts, examples, and quality bars", "Never", "Only after a full year"], bestIndex: 1 },
  { prompt: "For a research task, the strongest pattern is:", options: ["Use a single AI in a single chat for everything", "AI for synthesis, authoritative sources for facts, your judgment for conclusions", "Search engines only — never AI", "Books only — never AI or web"], bestIndex: 1 },
  { prompt: "The most useful long-term mindset toward AI in your career is:", options: ["Fear and avoidance", "Curious experimentation paired with healthy skepticism", "Total dismissal of the technology", "Total trust in everything it produces"], bestIndex: 1 },
];

if (BASE_QUESTIONS.length !== AI_QUESTIONS_PER_INDUSTRY) {
  throw new Error(
    `AI Readiness base bank must have exactly ${AI_QUESTIONS_PER_INDUSTRY} questions, got ${BASE_QUESTIONS.length}`,
  );
}

export function isValidAIIndustry(industry: string): boolean {
  return Object.prototype.hasOwnProperty.call(SLUG_MAP, industry);
}

export function getAIReadinessBank(industry: string): AIQuestion[] {
  const slug = SLUG_MAP[industry];
  if (!slug) return [];
  return BASE_QUESTIONS.map((q, i) => ({ ...q, id: `ai_${slug}_${i + 1}` }));
}

// Deterministic PRNG (mulberry32) seeded with applicantId mixed with a time
// salt — the shared pool is reshuffled per applicant so two users on the same
// industry see different orderings, while the time salt keeps retakes fresh.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(applicantId: number, salt: number): number {
  let h = 2166136261 ^ (applicantId | 0);
  h = Math.imul(h ^ (salt | 0), 16777619);
  h ^= h >>> 13;
  return h >>> 0;
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type AIPickResult = {
  questions: Array<{ id: string; prompt: string; options: string[] }>;
  remainingPool: number;
  totalPool: number;
  exhausted: boolean;
};

export function pickAIReadinessQuestions(
  industry: string,
  excludeIds: string[],
  count = AI_QUESTIONS_PER_ATTEMPT,
  applicantId = 0,
): AIPickResult {
  const bank = getAIReadinessBank(industry);
  const exclude = new Set(excludeIds);
  const unused = bank.filter(q => !exclude.has(q.id));
  const exhausted = unused.length === 0;
  const pool = exhausted ? bank : unused;
  const seed = hashSeed(applicantId, Date.now());
  const picked = seededShuffle(pool, seed).slice(0, Math.min(count, pool.length));
  return {
    questions: picked.map(({ id, prompt, options }) => ({ id, prompt, options })),
    remainingPool: unused.length,
    totalPool: bank.length,
    exhausted,
  };
}

export type AIGradeDetail = {
  id: string;
  prompt: string;
  picked: number;
  pickedText: string;
  bestIndex: number;
  bestText: string;
  correct: boolean;
};

export type AIGradeResult = {
  score: number;
  correctCount: number;
  total: number;
  details: AIGradeDetail[];
};

export function gradeAIReadiness(
  industry: string,
  questionIds: string[],
  answers: Record<string, number>,
): AIGradeResult {
  const bank = getAIReadinessBank(industry);
  const byId = new Map(bank.map(q => [q.id, q]));
  const details: AIGradeDetail[] = [];
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

const AI_DATA_RE = /\[AI_DATA=([\s\S]*?)\]\s*$/;

export function encodeAIData(payload: { used: string[]; details: AIGradeDetail[]; industry: string }): string {
  return `[AI_DATA=${JSON.stringify(payload)}]`;
}

export function extractAIPayload(
  feedback: string | null | undefined,
): { used: string[]; details: AIGradeDetail[]; industry?: string } | null {
  if (!feedback) return null;
  const m = feedback.match(AI_DATA_RE);
  if (!m) return null;
  try {
    const data = JSON.parse(m[1]);
    if (!data || !Array.isArray(data.used)) return null;
    return data;
  } catch {
    return null;
  }
}

export function extractAIUsedIds(feedback: string | null | undefined): string[] {
  return extractAIPayload(feedback)?.used ?? [];
}
