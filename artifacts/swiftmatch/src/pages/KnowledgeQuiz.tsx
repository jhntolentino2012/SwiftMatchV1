import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, BookOpen, CheckCircle,
  RotateCcw, Loader2, AlertCircle, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Industry & Role data (mirrors server-side) ─── */
const INDUSTRIES = [
  "Technology / IT",
  "BPO / Call Center",
  "Healthcare / Medical",
  "Finance / Banking",
  "Marketing / Advertising",
  "Real Estate & Construction",
  "Manufacturing & Engineering",
  "Retail & E-commerce",
  "Education & Training",
  "Hospitality & Tourism",
  "Food & Beverage",
  "Creative Arts & Design",
  "Logistics & Transportation",
  "Telecommunications",
  "Media & Entertainment",
  "Human Resources",
  "Government & Public Sector",
  "Agriculture & Environment",
  "Legal & Compliance",
  "Architecture & Urban Planning",
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

function storageKey(type: string, applicantId: number | null | undefined, industry: string) {
  return `sm_ke_${type}_${applicantId ?? "guest"}_${encodeURIComponent(industry)}`;
}

export default function KnowledgeQuiz({ applicantId, initialIndustry, initialRole, onComplete, onBack }: Props) {
  const [phase, setPhase]         = useState<Phase>(initialIndustry && initialRole ? "quiz" : initialIndustry ? "select-role" : "select-industry");
  const [industry, setIndustry]   = useState<string>(initialIndustry ?? "");
  const [role, setRole]           = useState<string>(initialRole ?? "");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [current, setCurrent]     = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const savedIndustry = localStorage.getItem(`sm_ke_industry_${applicantId ?? "guest"}`);
  const savedRole     = savedIndustry
    ? localStorage.getItem(`sm_ke_role_${applicantId ?? "guest"}_${encodeURIComponent(savedIndustry)}`) ?? ""
    : "";

  // Auto-start when initial industry+role are pre-supplied from profile
  const autoStarted = useRef(false);
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

  // Auto-start if both initialIndustry and initialRole are pre-supplied from the applicant profile
  useEffect(() => {
    if (initialIndustry && initialRole && !autoStarted.current && phase === "quiz" && questions.length === 0 && !loading) {
      autoStarted.current = true;
      loadQuiz(initialIndustry, initialRole);
    }
  }, [initialIndustry, initialRole, phase, questions.length, loading, loadQuiz]);

  function selectIndustry(ind: string) {
    setIndustry(ind);
    setRole("");
    setPhase("select-role");
  }

  function startWithRole(rl: string) {
    const resolvedRole = rl;
    setRole(resolvedRole);
    localStorage.setItem(`sm_ke_industry_${applicantId ?? "guest"}`, industry);
    localStorage.setItem(storageKey("role", applicantId, industry), resolvedRole);
    loadQuiz(industry, resolvedRole);
  }

  function retryQuiz() {
    setFinalScore(null);
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
      const w = weights[question.difficulty];
      maxScore += w;
      if ((answers[question.id] ?? "").trim().length > 0) rawScore += w;
    }
    const pct = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

    // Track attempted IDs
    const key = storageKey("attempted", applicantId, industry);
    const existing: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const fresh = Array.from(new Set([...existing, ...questions.map(q => q.id)]));
    localStorage.setItem(key, JSON.stringify(fresh));

    // Persist to backend
    if (applicantId) {
      try {
        await fetch("/api/assessments/ke-quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicantId, industry, role, score: pct, answers, attemptedIds: fresh }),
        });
      } catch {}
    }

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
              onClick={() => {
                setIndustry(savedIndustry);
                setRole(savedRole);
                loadQuiz(savedIndustry, savedRole);
              }}
              className="ml-auto px-3 py-1 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
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
        <button
          onClick={() => setPhase("select-industry")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Industry
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{industry}</span>
          </div>
          <h2 className="text-xl font-display font-bold text-primary mb-1">What role are you applying for?</h2>
          <p className="text-sm text-muted-foreground">
            Step 2 of 2 — Questions will be prioritised based on your target role within this industry.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {roles.map(rl => (
              <button
                key={rl}
                onClick={() => startWithRole(rl)}
                className={cn(
                  "w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between group",
                  "border-slate-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                )}
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
              ? `You scored ${finalScore}% on the ${role} knowledge quiz. Your results have been saved to your profile.`
              : `You scored ${finalScore}% on the ${role} quiz. A score of 60% or above is needed to pass.`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          {(["easy","medium","hard"] as const).map(d => ({
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
  const allAnswered = questions.every(q2 => (answers[q2.id] ?? "").trim().length > 0);

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

      {/* Question card */}
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
    </div>
  );
}
