import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface QuizQuestion {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple_choice" | "text" | "berlitz";
  passage?: string;
  text: string;
  options?: string[];
}

type Phase = "select" | "quiz" | "result";

interface Props {
  applicantId?: number | null;
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

function getAttemptedKey(applicantId: number | null | undefined, industry: string) {
  return `sm_ke_attempted_${applicantId ?? "guest"}_${encodeURIComponent(industry)}`;
}

function getAnswersKey(applicantId: number | null | undefined, industry: string) {
  return `sm_ke_answers_${applicantId ?? "guest"}_${encodeURIComponent(industry)}`;
}

export default function KnowledgeQuiz({ applicantId, onComplete, onBack }: Props) {
  const [phase, setPhase]         = useState<Phase>("select");
  const [industry, setIndustry]   = useState<string>("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [current, setCurrent]     = useState(0);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const savedIndustry = localStorage.getItem(`sm_ke_industry_${applicantId ?? "guest"}`);

  const loadQuiz = useCallback(async (ind: string) => {
    setLoading(true);
    setError(null);
    const key = getAttemptedKey(applicantId, ind);
    const storedIds: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    try {
      const params = new URLSearchParams({ industry: ind });
      if (storedIds.length) params.set("exclude", storedIds.join(","));
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

  function startQuiz(ind: string) {
    setIndustry(ind);
    localStorage.setItem(`sm_ke_industry_${applicantId ?? "guest"}`, ind);
    loadQuiz(ind);
  }

  function retryQuiz() {
    setFinalScore(null);
    setPhase("select");
    setQuestions([]);
    setAnswers({});
    setCurrent(0);
  }

  function setAnswer(qId: string, value: string) {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }

  const q = questions[current];

  async function submitQuiz() {
    setSubmitting(true);

    // Score: each MC/berlitz correct if answered (we score by "answered")
    // For text questions: always get credit for a non-empty answer
    // Simple scoring: answered count × difficulty weight
    let rawScore = 0;
    let maxScore = 0;
    const weights = { easy: 1, medium: 2, hard: 3 };
    for (const question of questions) {
      const w = weights[question.difficulty];
      maxScore += w;
      const ans = answers[question.id] ?? "";
      if (ans.trim().length > 0) rawScore += w;
    }
    const pct = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

    // Track attempted IDs to avoid repeats
    const key = getAttemptedKey(applicantId, industry);
    const existing: string[] = JSON.parse(localStorage.getItem(key) ?? "[]");
    const fresh = Array.from(new Set([...existing, ...questions.map(q => q.id)]));
    localStorage.setItem(key, JSON.stringify(fresh));

    // Save answers for display
    localStorage.setItem(getAnswersKey(applicantId, industry), JSON.stringify(answers));

    // Persist to backend
    if (applicantId) {
      try {
        await fetch("/api/assessments/ke-quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicantId,
            industry,
            score: pct,
            answers,
            attemptedIds: fresh,
          }),
        });
      } catch {}
    }

    setFinalScore(pct);
    setPhase("result");
    setSubmitting(false);
    onComplete?.(pct);
  }

  if (phase === "select") {
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
            Select your industry to receive a personalised 10-question quiz — 3 easy, 4 medium, and 3 hard.
            Questions adapt based on your previous attempts so you never see the same set twice.
          </p>
        </div>

        {savedIndustry && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Last attempted: <strong>{savedIndustry}</strong></span>
            <button
              onClick={() => startQuiz(savedIndustry)}
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
                onClick={() => startQuiz(ind)}
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
          <h2 className="text-xl font-display font-bold text-primary mb-1">
            {pass ? "Assessment Complete!" : "Good Effort!"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {pass
              ? `You scored ${finalScore}% on the ${industry} Knowledge & Expertise quiz. Your results have been added to your profile.`
              : `You scored ${finalScore}% on the ${industry} quiz. A score of 60% or above is needed to pass. Retry with a fresh set of questions!`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            { label: "Easy (×1)",   difficulty: "easy",   count: questions.filter(q => q.difficulty === "easy").length },
            { label: "Medium (×2)", difficulty: "medium", count: questions.filter(q => q.difficulty === "medium").length },
            { label: "Hard (×3)",   difficulty: "hard",   count: questions.filter(q => q.difficulty === "hard").length },
          ].map(d => (
            <div key={d.difficulty} className={cn("rounded-lg p-3", DIFFICULTY_COLORS[d.difficulty])}>
              <div className="font-bold text-lg">{d.count}</div>
              <div className="text-xs opacity-80">{d.label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={retryQuiz}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold hover:border-primary/40 hover:text-primary transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Try Another Industry
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

  // ── QUIZ PHASE ──
  if (!q) return null;

  const progress = ((current + 1) / questions.length) * 100;
  const answered = answers[q.id] !== undefined && answers[q.id].trim().length > 0;
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
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{industry}</span>
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
          {/* Meta */}
          <div className="flex items-center gap-2 px-5 pt-4 pb-2">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full", DIFFICULTY_COLORS[q.difficulty])}>
              {q.difficulty}
            </span>
            <span className="text-[10px] text-muted-foreground">{TYPE_LABELS[q.type]}</span>
          </div>

          {/* Berlitz passage */}
          {q.type === "berlitz" && q.passage && (
            <div className="mx-5 mb-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {q.passage}
            </div>
          )}

          {/* Question text */}
          <p className="px-5 pb-4 text-base font-semibold text-primary leading-snug">{q.text}</p>

          {/* Answers */}
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

        {/* Question dots */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === current ? "bg-primary scale-125" :
                answers[qq.id]?.trim() ? "bg-primary/50" : "bg-slate-300"
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

      {/* Answer all reminder */}
      {current === questions.length - 1 && !allAnswered && (
        <p className="text-center text-xs text-amber-600">
          Please answer all questions before submitting. Unanswered:{" "}
          {questions.filter(q2 => !(answers[q2.id] ?? "").trim()).length}
        </p>
      )}
    </div>
  );
}
