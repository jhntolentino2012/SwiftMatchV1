import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, BookOpen, CheckCircle,
  RotateCcw, Loader2, AlertCircle, Briefcase, Keyboard, Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Industry list ─── */
const INDUSTRIES = [
  "Technology / IT", "BPO / Call Center", "Healthcare / Medical", "Finance / Banking",
  "Marketing / Advertising", "Real Estate & Construction", "Manufacturing & Engineering",
  "Retail & E-commerce", "Education & Training", "Hospitality & Tourism", "Food & Beverage",
  "Creative Arts & Design", "Logistics & Transportation", "Telecommunications",
  "Media & Entertainment", "Human Resources", "Government & Public Sector",
  "Agriculture & Environment", "Legal & Compliance", "Architecture & Urban Planning",
];

const INDUSTRY_ROLES: Record<string, string[]> = {
  "Technology / IT": ["Software Developer / Engineer","Data Analyst / Engineer","IT Manager / Project Lead","System / Network Administrator","QA / Test Engineer","DevOps / Cloud Engineer","Cybersecurity Analyst"],
  "BPO / Call Center": ["Customer Service Agent","Team Leader / Supervisor","Quality Analyst","Workforce Manager","Trainer / L&D Specialist","Operations Manager"],
  "Healthcare / Medical": ["Staff Nurse / RN","Medical Doctor / Physician","Medical Technologist","Hospital Administrator","Pharmacist","Radiologic Technologist"],
  "Finance / Banking": ["Credit / Loan Analyst","Bank Teller / Branch Staff","Compliance Officer","Treasury / Investment Analyst","Financial Advisor","Risk Manager","Accounting / Finance Officer"],
  "Marketing / Advertising": ["Digital Marketing Specialist","Brand Manager","Content Creator / Copywriter","Media Buyer / Planner","SEO / SEM Specialist","Marketing Manager"],
  "Real Estate & Construction": ["Licensed Real Estate Broker","Civil / Structural Engineer","Project Manager","Quantity Surveyor","Property Appraiser","Site Safety Officer"],
  "Manufacturing & Engineering": ["Production / Plant Engineer","Quality Control Inspector","Safety Officer","Industrial / Process Engineer","Maintenance Engineer","Production Supervisor"],
  "Retail & E-commerce": ["Store Manager / Supervisor","Merchandiser / Buyer","E-commerce Manager","Supply Chain / Inventory Analyst","Customer Service Representative","Sales Associate"],
  "Education & Training": ["Teacher / Instructor","School Administrator","Curriculum Developer","Corporate Trainer / L&D Specialist","Special Education Teacher","Academic Coordinator"],
  "Hospitality & Tourism": ["Front Office / Guest Relations","Food & Beverage Manager","Hotel General Manager","Events Coordinator","Revenue Manager","Tour Operations Specialist"],
  "Food & Beverage": ["Chef / Cook","Restaurant Manager","Food Safety Officer","Purchasing / Supply Officer","Barista / Bartender","F&B Supervisor"],
  "Creative Arts & Design": ["Graphic Designer","UI / UX Designer","Art Director","Video / Motion Designer","Copywriter / Content Strategist","Brand / Visual Identity Designer"],
  "Logistics & Transportation": ["Logistics Coordinator","Customs Broker / Compliance Officer","Supply Chain Manager","Warehouse Supervisor","Freight Forwarder","Fleet / Transport Manager"],
  "Telecommunications": ["Network Engineer","RF / Transmission Engineer","Customer Solutions Specialist","Telco Sales Account Manager","Network Operations Analyst","Product / Service Manager"],
  "Media & Entertainment": ["Journalist / Reporter","Content Producer / Editor","Broadcast Engineer","Social Media Manager","Advertising / Media Sales Executive","Public Relations Specialist"],
  "Human Resources": ["HR Generalist","Recruiter / Talent Acquisition Specialist","Compensation & Benefits Specialist","Learning & Development Officer","HR Business Partner","HR Manager / Director"],
  "Government & Public Sector": ["Government Project Officer","Public Health Officer","Procurement / Bids & Awards Officer","Policy Analyst / Researcher","Local Government Officer","Administrative Officer"],
  "Agriculture & Environment": ["Agricultural Extension Officer","Agronomist / Crop Scientist","Environmental Compliance Officer","Farm Manager / Supervisor","Veterinarian / Animal Health Officer","Fisheries / Aquaculture Officer"],
  "Legal & Compliance": ["Associate Lawyer / Attorney","Paralegal / Legal Assistant","Compliance Officer","Corporate / In-house Counsel","Legal Researcher","Contracts Specialist"],
  "Architecture & Urban Planning": ["Licensed Architect","Urban / Land Use Planner","Interior Designer","Landscape Architect","Heritage Conservation Specialist","Building / Construction Project Manager"],
};

/* ─── Typing Passages (industry-specific, ~120 words each) ─── */
const TYPING_PASSAGES: Record<string, string> = {
  "Technology / IT":
    "Software development is a collaborative discipline that requires both technical expertise and strong communication skills. Modern engineering teams rely on version control systems to manage code changes, continuous integration pipelines to automate testing, and agile methodologies to deliver value incrementally. A skilled developer must write clean, maintainable code while documenting their work clearly for teammates. Code reviews are essential for maintaining quality and sharing knowledge across the team. When production incidents occur, swift and accurate communication is critical. Stakeholders need timely updates on the root cause, impact, and resolution timeline. The ability to translate complex technical concepts into plain language separates excellent engineers from good ones.",

  "BPO / Call Center":
    "Exceptional customer service begins with active listening and empathy. When a customer contacts support, their primary need is to feel heard and understood before any solution is offered. A skilled agent acknowledges the concern clearly, repeats back the key details to confirm understanding, and then works efficiently toward a resolution. Clear and concise communication is essential. Customers should never feel confused or dismissed. When a resolution is not immediately available, setting accurate expectations about timelines and next steps is critical. Documentation of each interaction ensures that follow-up teams have complete context. A high-performing agent consistently balances speed and quality, maintaining a professional and warm tone even in difficult conversations.",

  "Healthcare / Medical":
    "Patient safety is the foundation of all clinical practice. Healthcare professionals must maintain accurate and timely documentation to ensure continuity of care across all members of the medical team. When administering medications, the five rights must always be observed: the right patient, the right drug, the right dose, the right route, and the right time. Effective communication during patient handover reduces the risk of errors and adverse events. Healthcare workers are also responsible for maintaining patient confidentiality in accordance with applicable laws and institutional policies. Clear, professional communication with patients and their families helps build trust and supports informed decision-making throughout the entire care process.",

  "Finance / Banking":
    "Financial institutions operate within a framework of strict regulatory requirements and ethical standards. Analysts and banking professionals must ensure that all transactions are accurately recorded and reconciled in accordance with applicable accounting principles. Risk management involves identifying potential financial exposures, assessing their probability and impact, and implementing appropriate controls to mitigate them. Compliance officers play a vital role in monitoring activities for signs of fraud, money laundering, or other financial crimes. Client-facing professionals are responsible for explaining complex financial products in clear and accessible terms, ensuring that customers fully understand the terms and risks before proceeding. Confidentiality of client information is paramount and must be protected at all times.",

  "Marketing / Advertising":
    "Digital marketing requires a deep understanding of consumer behaviour, data analytics, and creative storytelling. A well-executed campaign begins with a clear brief that defines the target audience, the core message, the channels to be used, and the key performance indicators that will measure success. Content must be tailored for each platform, as what works on LinkedIn is unlikely to resonate on Instagram. Search engine optimisation involves both technical and editorial expertise, ensuring that content ranks well and delivers genuine value to the reader. Paid media campaigns require continuous monitoring and optimisation, with budget allocation shifting toward the highest-performing ad sets. Brand consistency across all touchpoints builds trust and recognition over time.",

  "Real Estate & Construction":
    "The real estate and construction industry requires professionals who can manage complex projects, navigate regulatory requirements, and communicate effectively with a wide range of stakeholders. Licensed brokers must accurately assess property values by analysing comparable sales, current market conditions, and relevant property characteristics. Project managers in construction are responsible for coordinating schedules, budgets, subcontractors, and quality standards simultaneously. Safety compliance is non-negotiable on any construction site. All personnel must be trained in hazard identification and emergency procedures. Building permits and local government approvals must be secured before any construction activity begins. Strong negotiation skills are essential when dealing with buyers, sellers, contractors, and suppliers.",

  "Manufacturing & Engineering":
    "Manufacturing operations depend on precision, consistency, and a relentless commitment to quality. Production engineers are responsible for designing and optimising processes that deliver output within specification while minimising waste and downtime. Quality control inspectors use statistical methods to detect and investigate deviations from accepted tolerances before defective products reach the customer. Safety officers enforce procedures that protect workers from hazards including machinery, chemicals, and ergonomic risks. Effective root cause analysis using structured methods such as the five-why technique and fishbone diagrams enables teams to eliminate recurring defects permanently. Accurate record-keeping of production data, maintenance logs, and inspection reports is essential for traceability and regulatory compliance.",

  "Retail & E-commerce":
    "Retail and e-commerce operations require careful coordination between merchandising, supply chain, customer service, and technology teams. Store managers must balance inventory levels to avoid both stockouts and excess holding costs. Merchandisers analyse sales data to identify top-performing products and optimise shelf placement and digital search rankings accordingly. E-commerce managers monitor website performance metrics including conversion rate, average order value, and cart abandonment rate to identify opportunities for improvement. Supply chain professionals track supplier lead times and adjust reorder points proactively to prevent disruptions. Customer service teams handle escalations quickly and professionally, recognising that each interaction directly influences brand perception and long-term customer loyalty.",

  "Education & Training":
    "Effective educators design learning experiences that are structured, engaging, and responsive to the diverse needs of their learners. A well-prepared lesson plan clearly states the learning objectives, the instructional strategies to be used, and the method by which understanding will be assessed. Formative assessment allows teachers to check for comprehension throughout the lesson and adjust their approach accordingly. Curriculum developers must align learning outcomes with national or institutional standards while ensuring that content is relevant and up to date. Corporate trainers tailor programmes to the specific performance gaps identified through needs analysis. Building a positive and inclusive learning environment where all participants feel respected and encouraged is fundamental to effective training.",

  "Hospitality & Tourism":
    "The hospitality industry is built on creating memorable experiences for every guest, from the moment of booking through to departure. Front office staff set the tone for the entire stay with a warm welcome, efficient check-in, and genuine attention to individual needs and preferences. Food and beverage teams must maintain consistent quality in both product and service, responding gracefully to special dietary requirements and complaints. Revenue managers use occupancy data, booking pace, and competitive benchmarking to optimise room rates across all distribution channels. Events coordinators manage multiple vendor relationships, timelines, and client expectations simultaneously. In hospitality, attention to detail and proactive service recovery are what transform a good experience into an exceptional one.",

  "Human Resources":
    "Human resources professionals serve as strategic partners to the business, supporting the full employee lifecycle from attraction and selection through to development and separation. Effective recruitment requires a clear understanding of the role requirements, an unbiased assessment process, and timely communication with all candidates. Onboarding programmes should equip new hires with the knowledge, tools, and relationships they need to become productive quickly. Performance management frameworks must be designed to encourage honest, constructive dialogue between managers and their teams. Compensation and benefits structures need to be competitive, equitable, and aligned with the organisation's financial capacity. Employee relations specialists handle grievances and disciplinary matters with fairness, consistency, and full compliance with applicable labour laws.",

  "Legal & Compliance":
    "Legal professionals must possess the ability to research complex statutory and case law, synthesise key findings, and communicate conclusions clearly in both written and verbal form. Contract drafting requires precise language that accurately reflects the intent of all parties while anticipating potential disputes and providing clear mechanisms for resolution. Compliance officers design and implement frameworks that ensure organisational activities conform to all applicable laws, regulations, and internal policies. They also monitor for emerging regulatory changes and assess their potential impact on the business. Confidentiality and professional ethics are foundational obligations for all legal practitioners. Attention to detail and logical rigour are essential when reviewing agreements, preparing legal opinions, or advising on regulatory risk management strategies.",

  "default":
    "Professional excellence in any field requires a combination of technical knowledge, effective communication, and sound judgment. High-performing individuals consistently deliver quality work while meeting deadlines and collaborating well with their colleagues. Written communication in the workplace must be clear, concise, and free of ambiguity, whether composing an email, drafting a report, or documenting a process. Attention to detail prevents errors that can have significant downstream consequences. Time management is equally important. The ability to prioritise tasks, meet commitments, and adapt to shifting priorities sets strong professionals apart. Continuous learning and a growth mindset enable individuals to stay relevant and effective as industries evolve. Building strong professional relationships based on trust and mutual respect creates the foundation for long-term career success.",
};

/* ─── Types ─── */
interface QuizQuestion {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple_choice" | "text" | "berlitz";
  passage?: string;
  text: string;
  options?: string[];
}

type Phase = "select-industry" | "select-role" | "quiz" | "result";

interface Props {
  applicantId?: number | null;
  initialIndustry?: string;
  initialRole?: string;
  onComplete?: (score: number) => void;
  onBack?: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy:   "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100  text-amber-700",
  hard:   "bg-rose-100   text-rose-700",
};

const TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  text:            "Written Answer",
  berlitz:         "Scenario — Multiple Choice",
};

const TYPING_DURATION = 60; // seconds

function storageKey(type: string, applicantId: number | null | undefined, industry: string) {
  return `sm_ke_${type}_${applicantId ?? "guest"}_${encodeURIComponent(industry)}`;
}

/* ══════════════════════════════════════════════════════
   TYPING TEST COMPONENT
══════════════════════════════════════════════════════ */
function TypingTestSection({
  industry, role, onDone, onBack,
}: {
  industry: string; role: string;
  onDone: (wpm: number, accuracy: number) => void;
  onBack?: () => void;
}) {
  const passage = TYPING_PASSAGES[industry] ?? TYPING_PASSAGES["default"];
  const [typed, setTyped]         = useState("");
  const [started, setStarted]     = useState(false);
  const [timeLeft, setTimeLeft]   = useState(TYPING_DURATION);
  const [finished, setFinished]   = useState(false);
  const [wpm, setWpm]             = useState(0);
  const [accuracy, setAccuracy]   = useState(100);
  const [focused, setFocused]     = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef<number>(0);

  const calcStats = useCallback((typedStr: string, elapsed: number) => {
    let correct = 0;
    for (let i = 0; i < typedStr.length; i++) {
      if (typedStr[i] === passage[i]) correct++;
    }
    const mins = elapsed / 60;
    const currentWpm = mins > 0 ? Math.round((correct / 5) / mins) : 0;
    const currentAccuracy = typedStr.length > 0 ? Math.round((correct / typedStr.length) * 100) : 100;
    return { wpm: currentWpm, accuracy: currentAccuracy };
  }, [passage]);

  const finish = useCallback((typedStr: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = (Date.now() - startedAt.current) / 1000;
    const { wpm: w, accuracy: a } = calcStats(typedStr, elapsed);
    setWpm(w);
    setAccuracy(a);
    setFinished(true);
  }, [calcStats]);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finish(typed);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, finished, finish, typed]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val.length > passage.length) return;
    if (!started) {
      setStarted(true);
      startedAt.current = Date.now();
    }
    setTyped(val);
    const elapsed = (Date.now() - startedAt.current) / 1000;
    const { wpm: w, accuracy: a } = calcStats(val, elapsed);
    setWpm(w);
    setAccuracy(a);
    if (val.length >= passage.length) finish(val);
  }

  const correctChars = typed.split("").filter((c, i) => c === passage[i]).length;
  const timerPct     = (timeLeft / TYPING_DURATION) * 100;
  const timerColor   = timeLeft > 30 ? "#1d4ed8" : timeLeft > 10 ? "#ea580c" : "#ef4444";

  /* ── Finished screen ── */
  if (finished) {
    const wpmGrade = wpm >= 70 ? "Excellent" : wpm >= 50 ? "Good" : wpm >= 35 ? "Average" : "Needs Practice";
    const accGrade = accuracy >= 95 ? "Excellent" : accuracy >= 85 ? "Good" : accuracy >= 70 ? "Average" : "Needs Practice";
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Evaluations
          </button>
        )}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Keyboard className="w-3.5 h-3.5" /> Typing Test Complete
          </div>
          <h2 className="text-xl font-display font-bold text-primary">Your Typing Results</h2>
          <p className="text-sm text-slate-500 mt-1">{role} · {industry}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-5xl font-display font-bold text-primary">{wpm}</p>
            <p className="text-sm font-semibold text-slate-600 mt-1">Words Per Minute</p>
            <span className={cn(
              "inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full",
              wpm >= 70 ? "bg-emerald-100 text-emerald-700" :
              wpm >= 50 ? "bg-blue-100 text-blue-700" :
              wpm >= 35 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
            )}>
              {wpmGrade}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-5xl font-display font-bold text-primary">{accuracy}%</p>
            <p className="text-sm font-semibold text-slate-600 mt-1">Accuracy</p>
            <span className={cn(
              "inline-block mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full",
              accuracy >= 95 ? "bg-emerald-100 text-emerald-700" :
              accuracy >= 85 ? "bg-blue-100 text-blue-700" :
              accuracy >= 70 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
            )}>
              {accGrade}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="font-bold text-primary text-lg">{correctChars}</p>
            <p className="text-xs text-slate-500">Correct chars</p>
          </div>
          <div>
            <p className="font-bold text-primary text-lg">{typed.length - correctChars}</p>
            <p className="text-xs text-slate-500">Errors</p>
          </div>
          <div>
            <p className="font-bold text-primary text-lg">{TYPING_DURATION - timeLeft}s</p>
            <p className="text-xs text-slate-500">Time used</p>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-primary">
          <p className="font-semibold mb-1">Benchmark for {role.split("/")[0].trim()} roles</p>
          <p className="text-slate-600 text-xs">
            Most employers expect a minimum of <strong>40 WPM</strong> with <strong>90%+ accuracy</strong> for professional roles.
            BPO and data-entry positions typically require <strong>50–60 WPM</strong>.
          </p>
        </div>

        <button
          onClick={() => onDone(wpm, accuracy)}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  /* ── Active typing test ── */
  return (
    <div className="space-y-5">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Evaluations
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Keyboard className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-display font-bold text-primary">Typing Speed Test</h2>
          </div>
          <p className="text-xs text-slate-500">{role} · {industry}</p>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="24" fill="none"
                stroke={timerColor}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - timerPct / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold tabular-nums" style={{ color: timerColor }}>{timeLeft}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-display font-bold text-primary tabular-nums">{wpm}</p>
          <p className="text-xs text-slate-500 font-medium">WPM</p>
        </div>
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-display font-bold text-primary tabular-nums">{accuracy}%</p>
          <p className="text-xs text-slate-500 font-medium">Accuracy</p>
        </div>
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-display font-bold text-primary tabular-nums">{typed.length}</p>
          <p className="text-xs text-slate-500 font-medium">Characters</p>
        </div>
      </div>

      {/* Passage display */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "bg-white border-2 rounded-2xl p-5 cursor-text transition-colors shadow-sm",
          focused ? "border-primary" : "border-slate-200"
        )}
      >
        {!started && (
          <div className="text-center mb-3 text-sm text-slate-400 font-medium animate-pulse flex items-center justify-center gap-1.5">
            <Timer className="w-4 h-4" /> Click here and start typing to begin the timer
          </div>
        )}
        <p className="font-mono text-sm leading-8 tracking-wide select-none break-words">
          {passage.split("").map((char, i) => {
            const typedChar = typed[i];
            if (typedChar === undefined) {
              return (
                <span key={i} className={cn(i === typed.length && focused ? "border-l-2 border-primary" : "text-slate-400")}>
                  {char}
                </span>
              );
            }
            if (typedChar === char) {
              return <span key={i} className="text-emerald-600">{char}</span>;
            }
            return (
              <span key={i} className="text-red-500 bg-red-100 rounded-sm">
                {char === " " ? "\u00a0" : char}
              </span>
            );
          })}
        </p>
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="absolute opacity-0 pointer-events-none"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input"
      />

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
          <span>{typed.length} / {passage.length} characters</span>
          <span>{Math.round((typed.length / passage.length) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-150"
            style={{ width: `${(typed.length / passage.length) * 100}%` }}
          />
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        Test runs for 60 seconds. Type the passage above as accurately and quickly as you can.
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN QUIZ COMPONENT
══════════════════════════════════════════════════════ */
export default function KnowledgeQuiz({ applicantId, initialIndustry, initialRole, onComplete, onBack }: Props) {
  const [phase, setPhase]       = useState<Phase>(
    initialIndustry && initialRole ? "quiz" :
    initialIndustry ? "select-role" : "select-industry"
  );
  const [industry, setIndustry] = useState<string>(initialIndustry ?? "");
  const [role, setRole]         = useState<string>(initialRole ?? "");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers]   = useState<Record<string, string>>({});
  const [current, setCurrent]   = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [typingWpm, setTypingWpm]   = useState<number | null>(null);
  const [typingAccuracy, setTypingAccuracy] = useState<number | null>(null);

  const savedIndustry = localStorage.getItem(`sm_ke_industry_${applicantId ?? "guest"}`);
  const savedRole = savedIndustry
    ? localStorage.getItem(`sm_ke_role_${applicantId ?? "guest"}_${encodeURIComponent(savedIndustry)}`) ?? ""
    : "";

  const loadQuiz = useCallback(async (ind: string, rl: string) => {
    setLoading(true);
    setError(null);
    const attemptedIds: string[] = JSON.parse(localStorage.getItem(storageKey("attempted", applicantId, ind)) ?? "[]");
    try {
      const params = new URLSearchParams({ industry: ind });
      if (rl) params.set("role", rl);
      if (attemptedIds.length) params.set("exclude", attemptedIds.join(","));
      const res = await fetch(`/api/assessments/ke-quiz?${params}`);
      if (!res.ok) throw new Error(await res.text());
      const qs: QuizQuestion[] = await res.json();
      // Inject typing test at a random position (not first, not last if 2+ questions)
      const insertAt = qs.length > 1
        ? 1 + Math.floor(Math.random() * (qs.length - 1))
        : 0;
      const typingQ: QuizQuestion = {
        id: "__typing__",
        difficulty: "medium",
        type: "typing" as QuizQuestion["type"],
        text: "Typing Speed Test",
      };
      qs.splice(insertAt, 0, typingQ);
      setQuestions(qs);
      setAnswers({});
      setCurrent(0);
      setPhase("quiz");
    } catch (e: any) {
      setError(e.message ?? "Could not load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [applicantId]);

  function selectIndustry(ind: string) {
    setIndustry(ind);
    setRole("");
    setPhase("select-role");
  }

  function startWithRole(rl: string) {
    setRole(rl);
    localStorage.setItem(`sm_ke_industry_${applicantId ?? "guest"}`, industry);
    localStorage.setItem(storageKey("role", applicantId, industry), rl);
    loadQuiz(industry, rl);
  }

  function retryQuiz() {
    setFinalScore(null);
    setTypingWpm(null);
    setTypingAccuracy(null);
    setPhase("select-industry");
    setQuestions([]);
    setAnswers({});
    setCurrent(0);
    setIndustry("");
    setRole("");
  }

  function setAnswer(qId: string, value: string) {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }

  const q = questions[current];

  async function submitQuiz() {
    setSubmitting(true);
    const weights = { easy: 1, medium: 2, hard: 3 } as const;
    let rawScore = 0, maxScore = 0;
    for (const question of questions) {
      if (question.id === "__typing__") continue; // typing test doesn't count toward quiz score
      const w = weights[question.difficulty];
      maxScore += w;
      if ((answers[question.id] ?? "").trim().length > 0) rawScore += w;
    }
    const pct = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

    const key = storageKey("attempted", applicantId, industry);
    const existing: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const fresh = Array.from(new Set([...existing, ...questions.map(q => q.id)]));
    localStorage.setItem(key, JSON.stringify(fresh));

    if (applicantId) {
      try {
        const resp = await fetch("/api/assessments/ke-quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicantId, industry, role, score: pct, answers, attemptedIds: fresh }),
        });
        if (resp.status === 429) {
          const body = await resp.json().catch(() => ({}));
          const availDate = body.retakeAvailableAt
            ? new Date(body.retakeAvailableAt).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })
            : "in 1 month";
          setSubmitError(`Retake cooldown active — available from ${availDate}.`);
          setSubmitting(false);
          return;
        }
      } catch {}
    }
    setSubmitError(null);
    setFinalScore(pct);
    setPhase("result");
    setSubmitting(false);
    onComplete?.(pct);
  }

  /* ── INDUSTRY SELECTION ── */
  if (phase === "select-industry") {
    return (
      <div className="space-y-6">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Evaluations
          </button>
        )}
        <div>
          <h2 className="text-xl font-display font-bold text-primary mb-1">Knowledge & Expertise</h2>
          <p className="text-sm text-muted-foreground">
            Step 1 of 2 — Select the industry that best matches the role you are applying for.
          </p>
        </div>

        {savedIndustry && savedRole && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary">
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Last: <strong>{savedIndustry}</strong> › <strong>{savedRole}</strong></span>
            <button
              onClick={() => { setIndustry(savedIndustry); setRole(savedRole); loadQuiz(savedIndustry, savedRole); }}
              className="ml-auto px-3 py-1 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading && <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {!loading && (
          <div className="grid sm:grid-cols-2 gap-2">
            {INDUSTRIES.map(ind => (
              <button
                key={ind}
                onClick={() => selectIndustry(ind)}
                className={cn(
                  "text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                  "border-slate-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                  savedIndustry === ind && "border-primary/40 bg-primary/5 text-primary"
                )}
              >
                {ind}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── ROLE SELECTION ── */
  if (phase === "select-role") {
    const roles = INDUSTRY_ROLES[industry] ?? [];
    return (
      <div className="space-y-6">
        <button onClick={() => setPhase("select-industry")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Industry
        </button>
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{industry}</span>
          <h2 className="text-xl font-display font-bold text-primary mt-0.5 mb-1">What role are you applying for?</h2>
          <p className="text-sm text-muted-foreground">
            Step 2 of 2 — Questions will be prioritised based on your target role.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {loading
          ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          : (
            <div className="space-y-2">
              {roles.map(rl => (
                <button
                  key={rl}
                  onClick={() => startWithRole(rl)}
                  className="w-full text-left px-4 py-3.5 rounded-xl border border-slate-200 text-sm font-medium transition-all flex items-center justify-between group hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                >
                  <span>{rl}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          )}
      </div>
    );
  }

  /* ── LOADING QUIZ ── */
  if (phase === "quiz" && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-slate-500">Loading your {role} quiz…</p>
      </div>
    );
  }

  /* ── RESULT ── */
  if (phase === "result") {
    const pass = (finalScore ?? 0) >= 60;
    return (
      <div className="space-y-6 max-w-xl mx-auto text-center">
        {onBack && (
          <div className="text-left">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back to Evaluations
            </button>
          </div>
        )}

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "w-28 h-28 rounded-full flex items-center justify-center mx-auto text-4xl font-display font-bold",
            pass ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          )}
        >
          {finalScore}%
        </motion.div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            {role} · {industry}
          </div>
          <h2 className="text-xl font-display font-bold text-primary mb-1">
            {pass ? "Assessment Complete!" : "Good Effort!"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {pass
              ? `You scored ${finalScore}% on the ${role} knowledge quiz.`
              : `You scored ${finalScore}% on the ${role} quiz. A score of 60% or above is needed to pass.`}
          </p>
        </div>

        {/* Typing test summary card */}
        {typingWpm !== null && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Keyboard className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Typing Speed</span>
              </div>
              <p className="text-2xl font-display font-bold text-primary">{typingWpm} <span className="text-sm font-normal text-slate-500">WPM</span></p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">Accuracy</span>
              </div>
              <p className="text-2xl font-display font-bold text-primary">{typingAccuracy}<span className="text-sm font-normal text-slate-500">%</span></p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 text-sm">
          {(["easy", "medium", "hard"] as const).map(d => ({
            d, count: questions.filter(q => q.difficulty === d).length,
            label: d === "easy" ? "Easy (×1)" : d === "medium" ? "Medium (×2)" : "Hard (×3)"
          })).map(({ d, count, label }) => (
            <div key={d} className={cn("rounded-lg p-3", DIFFICULTY_COLORS[d])}>
              <div className="font-bold text-lg">{count}</div>
              <div className="text-xs opacity-80">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={retryQuiz}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:border-primary/40 hover:text-primary transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Different Role
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Done
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── QUIZ ── */
  if (!q) return null;

  const progress    = ((current + 1) / questions.length) * 100;
  const allAnswered = questions.every(q2 =>
    q2.id === "__typing__"
      ? (answers["__typing__"] ?? "").length > 0
      : (answers[q2.id] ?? "").trim().length > 0
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">{role}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">{industry}</span>
            </div>
            <span className="text-xs text-muted-foreground">{current + 1} / {questions.length}</span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Typing score badge */}
      {typingWpm !== null && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary/5 border border-primary/20 rounded-xl text-xs">
          <Keyboard className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-primary font-semibold">Typing: {typingWpm} WPM · {typingAccuracy}% accuracy</span>
        </div>
      )}

      {/* Question card — or inline typing test */}
      {q.id === "__typing__" ? (
        answers["__typing__"] ? (
          /* Already completed — show compact summary */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-primary/30 shadow-sm p-8 text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Keyboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-primary text-lg">Typing Test Complete</p>
              <p className="text-sm text-slate-500 mt-1">{typingWpm} WPM · {typingAccuracy}% accuracy</p>
            </div>
            <button
              onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <TypingTestSection
            industry={industry}
            role={role}
            onDone={(wpm, accuracy) => {
              setTypingWpm(wpm);
              setTypingAccuracy(accuracy);
              if (applicantId) {
                localStorage.setItem(`sm_ke_typing_${applicantId}`, JSON.stringify({ wpm, accuracy, industry, role }));
              }
              setAnswer("__typing__", JSON.stringify({ wpm, accuracy }));
            }}
          />
        )
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 pt-4 pb-2">
              <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full", DIFFICULTY_COLORS[q.difficulty])}>
                {q.difficulty}
              </span>
              <span className="text-[10px] text-muted-foreground">{TYPE_LABELS[q.type]}</span>
            </div>

            {q.type === "berlitz" && q.passage && (
              <div className="mx-5 mb-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {q.passage}
              </div>
            )}

            <p className="px-5 pb-4 text-base font-semibold text-primary leading-snug">{q.text}</p>

            <div className="px-5 pb-5 space-y-2">
              {(q.type === "multiple_choice" || q.type === "berlitz") && q.options ? (
                q.options.map((opt, i) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswer(q.id, opt)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all",
                        selected
                          ? "border-primary bg-primary/5 text-primary font-semibold"
                          : "border-slate-200 hover:border-primary/40 hover:bg-primary/5"
                      )}
                    >
                      <span className="font-bold mr-2 text-muted-foreground">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })
              ) : (
                <textarea
                  rows={5}
                  placeholder="Type your answer here…"
                  value={answers[q.id] ?? ""}
                  onChange={e => setAnswer(q.id, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:border-primary transition-colors"
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-30 hover:border-primary/40 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === current ? "bg-primary scale-125" :
                (answers[qq.id] ?? "").trim() ? "bg-primary/50" : "bg-slate-300"
              )}
            />
          ))}
        </div>

        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={submitQuiz}
            disabled={submitting || !allAnswered}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold transition-colors",
              allAnswered && !submitting
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {submitting ? "Submitting…" : "Submit Quiz"}
          </button>
        )}
      </div>

      {current === questions.length - 1 && !allAnswered && (
        <p className="text-center text-xs text-amber-600">
          Answer all questions to submit. Unanswered: {questions.filter(q2 => !(answers[q2.id] ?? "").trim()).length}
        </p>
      )}

      {submitError && (
        <p className="text-center text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {submitError}
        </p>
      )}
    </div>
  );
}
