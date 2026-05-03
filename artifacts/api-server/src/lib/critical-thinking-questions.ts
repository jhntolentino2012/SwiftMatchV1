// Critical Thinking question bank.
// 50 questions per industry, namespaced via `ct_<slug>_<n>` so per-applicant
// no-repeat tracking is industry-scoped. Each question has a `bestIndex` that
// represents the logically correct answer. The applicant never sees `bestIndex`
// — it is stripped from the wire payload and only used for server-side grading.

export type CTQuestion = {
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
  "Virtual Assistance": "va",
};

export const CT_QUESTIONS_PER_INDUSTRY = 50;
export const CT_QUESTIONS_PER_ATTEMPT = 10;

const BASE_QUESTIONS: Omit<CTQuestion, "id">[] = [
  { prompt: "All managers attended the training. Some attendees were late. Which conclusion follows?", options: ["All managers were late.","Some managers may have been late.","No manager was late.","Most attendees were managers."], bestIndex: 1 },
  { prompt: "If a server is overloaded, response times rise. Response times have not risen. What can you conclude?", options: ["The server is overloaded.","The server is not overloaded.","Response times will rise tomorrow.","Nothing can be concluded."], bestIndex: 1 },
  { prompt: "Find the next number: 2, 4, 8, 16, ?", options: ["20","24","32","64"], bestIndex: 2 },
  { prompt: "Find the next number: 3, 6, 11, 18, 27, ?", options: ["34","36","38","40"], bestIndex: 2 },
  { prompt: "Five students average 80 on a test. A sixth student raises the average to 82. What did the sixth student score?", options: ["88","90","92","94"], bestIndex: 2 },
  { prompt: "A mixture is 3:5 between A and B. If the total volume is 24 L, how much is A?", options: ["6 L","8 L","9 L","12 L"], bestIndex: 2 },
  { prompt: "A bag has 3 red and 2 blue marbles. The probability of drawing red on one try is:", options: ["1/5","2/5","3/5","1/2"], bestIndex: 2 },
  { prompt: "Two fair dice are rolled. The probability the sum equals 7 is:", options: ["1/12","1/9","1/6","1/4"], bestIndex: 2 },
  { prompt: "An item is discounted 30%, then a further 20% off the new price. The total discount from the original is:", options: ["44%","46%","50%","60%"], bestIndex: 0 },
  { prompt: "A finishes a job in 4 hours, B in 6 hours. Working together, they finish in:", options: ["2 hours","2.4 hours","3 hours","5 hours"], bestIndex: 1 },
  { prompt: "Two trains 100 km apart move toward each other at 60 km/h and 40 km/h. They meet in:", options: ["30 minutes","1 hour","1.5 hours","2 hours"], bestIndex: 1 },
  { prompt: "A leaves at 10am at 60 km/h. B leaves the same point at 11am at 80 km/h. At what time does B catch up?", options: ["12:00 pm","1:00 pm","2:00 pm","3:00 pm"], bestIndex: 2 },
  { prompt: "Maria is twice as old as her brother. In 5 years, the sum of their ages will be 40. How old is Maria now?", options: ["15","20","25","30"], bestIndex: 1 },
  { prompt: "Argument: 'We should adopt the new tool — our competitors use it.' This argument assumes:", options: ["Competitors always make the right choice","The tool will reduce costs","Adoption is free of risk","Our team has used the tool before"], bestIndex: 0 },
  { prompt: "Claim: 'Office snacks improve productivity — a survey found employees with snacks reported feeling more productive.' Which most weakens this?", options: ["Snacks were donated by a sponsor.","Self-reports of productivity often don't match measured output.","Some employees skipped the snacks.","The survey was anonymous."], bestIndex: 1 },
  { prompt: "Claim: 'Remote work increases output.' Which most strengthens this?", options: ["A controlled study showed a 12% rise in measured output for remote teams.","Many employees prefer remote work.","Office leases are expensive.","Remote workers feel happier."], bestIndex: 0 },
  { prompt: "Cities with more firefighters have more fires. The best explanation is:", options: ["Firefighters cause fires.","Bigger cities have both more fires and more firefighters.","Fewer firefighters would mean fewer fires.","Fires attract firefighters from other cities."], bestIndex: 1 },
  { prompt: "A workplace satisfaction survey is sent only to people still employed at the company. The biggest flaw is:", options: ["The sample size may be too small.","It excludes people who left, who likely felt least satisfied.","It is anonymous.","The questions are leading."], bestIndex: 1 },
  { prompt: "Studying only successful startups to learn what makes startups succeed risks:", options: ["Survivorship bias — failed startups may share the same traits.","Selection bias toward popular industries.","Confirmation bias from the founders.","All of the above equally."], bestIndex: 0 },
  { prompt: "A project has consumed ₱5M but is now expected to lose more if continued. The rational decision is:", options: ["Continue, since ₱5M is already spent.","Stop, because past costs cannot be recovered.","Continue if morale will drop.","Continue until breakeven, regardless."], bestIndex: 1 },
  { prompt: "'If we let employees work from home one day a week, soon no one will come to the office at all.' This argument is:", options: ["A valid prediction.","A slippery-slope flaw without supporting evidence.","An appeal to authority.","A circular argument."], bestIndex: 1 },
  { prompt: "'You either fully support this initiative or you are against the company.' This is best identified as:", options: ["A false dichotomy.","A modus ponens.","Sound reasoning.","An analogy."], bestIndex: 0 },
  { prompt: "Person A: 'The data suggests we should change supplier.' Person B: 'A is too junior to know that.' Person B is committing:", options: ["An ad hominem fallacy.","Begging the question.","A red herring on data quality.","A reasonable rebuttal."], bestIndex: 0 },
  { prompt: "If it rains, the road is wet. The road is wet. Therefore, it rained. This reasoning is:", options: ["Valid.","Affirming the consequent — invalid.","Modus tollens.","A tautology."], bestIndex: 1 },
  { prompt: "If a candidate has a degree, they are qualified. Maria has no degree. Therefore, Maria is unqualified. This is:", options: ["Sound.","Denying the antecedent — invalid.","Modus ponens.","A generalisation."], bestIndex: 1 },
  { prompt: "All engineers are problem solvers. Some problem solvers are designers. Which must be true?", options: ["All engineers are designers.","Some engineers are designers.","Some designers may be engineers.","No designers are engineers."], bestIndex: 2 },
  { prompt: "Claim: 'All swans are white.' What single observation refutes this?", options: ["A grey duck.","A black swan.","100 white swans.","A white swan with a black beak."], bestIndex: 1 },
  { prompt: "You're told: 'Sales rose 10% in Q1.' Is that enough to conclude profits rose?", options: ["Yes — sales and profits move together.","No — costs may have risen more than sales.","Yes — 10% is a strong signal.","No — Q1 is too short to judge."], bestIndex: 1 },
  { prompt: "Three teams shipped on time; a fourth slipped. The fourth used a new tool. Which inference is best supported?", options: ["The new tool caused the slip.","The new tool may have contributed; investigate further.","Tools have no effect on shipping.","The team is incapable."], bestIndex: 1 },
  { prompt: "After reviewing the data, you find sales grew 5% but customer complaints doubled. The best one-line summary is:", options: ["Sales are healthy.","Growth came alongside a sharp rise in complaints — investigate quality.","The company is failing.","Complaints don't matter while sales grow."], bestIndex: 1 },
  { prompt: "Option A costs ₱1M and saves ₱1.2M; Option B costs ₱500k and saves ₱700k. Which has the better return on investment?", options: ["Option A — bigger savings.","Option B — 40% return vs 20%.","They are equal.","Option A — bigger budget shows commitment."], bestIndex: 1 },
  { prompt: "A 60% chance of gaining ₱100k vs a guaranteed ₱60k. The expected values are equal. The right tiebreaker for a risk-averse team is:", options: ["Take the gamble — same EV.","Take the guaranteed amount — lower variance.","Flip a coin.","Always pick the larger headline number."], bestIndex: 1 },
  { prompt: "You have 40 hours and three tasks of equal value taking 10, 15, and 30 hours. Maximising completed tasks, you should:", options: ["Do the 30-hour task first.","Do the 10 and 15-hour tasks first; complete two for sure.","Split time evenly.","Do all three partially."], bestIndex: 1 },
  { prompt: "'Banning sugar drinks in offices will reduce health-care costs.' What hidden assumption does this rely on?", options: ["Employees will drink water.","Sugar drinks materially affect employee health outcomes.","Bans are easy to enforce.","All of the above are equally hidden."], bestIndex: 1 },
  { prompt: "Manager: 'Team A is underperforming — their tickets closed dropped 20%.' What missing info matters most?", options: ["Whether ticket complexity changed.","The team's average tenure.","Office location.","The CEO's opinion."], bestIndex: 0 },
  { prompt: "A meeting is set for 9am Manila. A teammate in London (8 hours behind Manila) sees it at:", options: ["1am London","5pm London (previous day)","9am London","5pm London"], bestIndex: 0 },
  { prompt: "What is the negation of 'All employees are punctual'?", options: ["No employees are punctual.","Some employees are not punctual.","All employees are not punctual.","Most employees are punctual."], bestIndex: 1 },
  { prompt: "'Only certified vendors may bid.' Vendor X has bid. What follows?", options: ["Vendor X is certified.","Vendor X is not certified.","Nothing follows.","Vendor X must be the lowest bidder."], bestIndex: 0 },
  { prompt: "Which word is the odd one out: triangle, square, hexagon, circle?", options: ["Triangle","Square","Hexagon","Circle"], bestIndex: 3 },
  { prompt: "What comes next: A, C, F, J, O, ?", options: ["S","T","U","V"], bestIndex: 2 },
  { prompt: "Hypothesis: 'Adding a pop-up boosts sign-ups.' Sign-ups rose 5% after the pop-up launched. Strongest concern about this conclusion?", options: ["Pop-ups are unpopular.","There may be a confounding seasonal effect; a control group is needed.","5% is small.","Sign-ups are not profits."], bestIndex: 1 },
  { prompt: "Claim: 'Employees with bigger desks perform better.' Which most challenges this?", options: ["Senior employees may have both bigger desks and higher performance.","Big desks are heavy.","Desks are expensive.","Employees prefer big desks."], bestIndex: 0 },
  { prompt: "'This policy is best because it's the right one to follow.' This is:", options: ["An example of circular reasoning.","An empirical claim.","A counterargument.","A modus ponens."], bestIndex: 0 },
  { prompt: "'Running a team is like running a marathon — pace yourself.' This analogy is strongest because:", options: ["Both involve running.","Both require sustained effort over a long period.","Both are competitive.","Both have a finish line."], bestIndex: 1 },
  { prompt: "A vendor offers a 15% discount but ships from a country with an active port strike. The most rational response is:", options: ["Accept the discount immediately.","Quantify the delay risk against the savings before deciding.","Reject any discount on principle.","Wait until the strike is over and rebid."], bestIndex: 1 },
  { prompt: "Customer complaints spiked after a release. The first investigative step should be:", options: ["Roll back the release without checking.","Compare complaint themes pre- and post-release to isolate the change.","Increase support staff.","Email all customers an apology."], bestIndex: 1 },
  { prompt: "A team finishes a feature 2 days late but the overall project is on track. The right framing is:", options: ["The team failed.","The local slip didn't impact the overall plan; analyse why locally.","The plan was wrong.","Cancel the next release."], bestIndex: 1 },
  { prompt: "Stores running a promo on Friday saw higher sales than stores without one. Which confound matters most?", options: ["Friday traffic patterns differ from other days.","Promo signs were colourful.","Stores had different managers.","Customers prefer Fridays."], bestIndex: 0 },
  { prompt: "Two studies disagree. Study A: n=10,000, peer-reviewed, replicated. Study B: n=50, anecdotal. The rational weighting is:", options: ["Equal — both are studies.","Strongly favour Study A based on size, rigour, and replication.","Favour Study B for being recent.","Reject both as untrustworthy."], bestIndex: 1 },
  { prompt: "Faced with an ambiguous problem and a tight deadline, the strongest first move is:", options: ["Pick any solution and execute fast.","Define the problem clearly, list assumptions, then plan.","Wait for more information.","Delegate without context."], bestIndex: 1 },
];

if (BASE_QUESTIONS.length !== CT_QUESTIONS_PER_INDUSTRY) {
  throw new Error(
    `Critical Thinking base bank must have exactly ${CT_QUESTIONS_PER_INDUSTRY} questions, got ${BASE_QUESTIONS.length}`,
  );
}

export function isValidCTIndustry(industry: string): boolean {
  return Object.prototype.hasOwnProperty.call(SLUG_MAP, industry);
}

export function getCriticalThinkingBank(industry: string): CTQuestion[] {
  const slug = SLUG_MAP[industry];
  if (!slug) return [];
  return BASE_QUESTIONS.map((q, i) => ({ ...q, id: `ct_${slug}_${i + 1}` }));
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

export type CTPickResult = {
  questions: Array<{ id: string; prompt: string; options: string[] }>;
  remainingPool: number;
  totalPool: number;
  exhausted: boolean;
};

export function pickCriticalThinkingQuestions(
  industry: string,
  excludeIds: string[],
  count = CT_QUESTIONS_PER_ATTEMPT,
  applicantId = 0,
): CTPickResult {
  const bank = getCriticalThinkingBank(industry);
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

export type CTGradeDetail = {
  id: string;
  prompt: string;
  picked: number;
  pickedText: string;
  bestIndex: number;
  bestText: string;
  correct: boolean;
};

export type CTGradeResult = {
  score: number;
  correctCount: number;
  total: number;
  details: CTGradeDetail[];
};

export function gradeCriticalThinking(
  industry: string,
  questionIds: string[],
  answers: Record<string, number>,
): CTGradeResult {
  const bank = getCriticalThinkingBank(industry);
  const byId = new Map(bank.map(q => [q.id, q]));
  const details: CTGradeDetail[] = [];
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

const CT_DATA_RE = /\[CT_DATA=([\s\S]*?)\]\s*$/;

export function encodeCTData(payload: { used: string[]; details: CTGradeDetail[]; industry: string }): string {
  return `[CT_DATA=${JSON.stringify(payload)}]`;
}

export function extractCTPayload(
  feedback: string | null | undefined,
): { used: string[]; details: CTGradeDetail[]; industry?: string } | null {
  if (!feedback) return null;
  const m = feedback.match(CT_DATA_RE);
  if (!m) return null;
  try {
    const data = JSON.parse(m[1]);
    if (!data || !Array.isArray(data.used)) return null;
    return data;
  } catch {
    return null;
  }
}

export function extractCTUsedIds(feedback: string | null | undefined): string[] {
  return extractCTPayload(feedback)?.used ?? [];
}
