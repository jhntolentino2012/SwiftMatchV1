import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, CheckCircle, XCircle, Lightbulb, RotateCcw, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const BASE_URL = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

type CTQuestion = { id: string; prompt: string; options: string[] };

type CTDetail = {
  id: string;
  prompt: string;
  picked: number;
  pickedText: string;
  bestIndex: number;
  bestText: string;
  correct: boolean;
};

type CTResult = {
  score: number;
  correctCount: number;
  total: number;
  details: CTDetail[];
  remainingPool: number;
  totalPerIndustry: number;
};

type Props = {
  applicantId: number | null;
  industry: string;
  jobId?: number | null;
  onComplete: (score: number) => void;
  onBack: () => void;
};

export default function CriticalThinkingQuiz({ applicantId, industry, jobId, onComplete, onBack }: Props) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<"loading" | "quiz" | "submitting" | "result" | "error" | "exhausted">("loading");
  const [questions, setQuestions] = useState<CTQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [poolMeta, setPoolMeta] = useState<{ remaining: number; total: number; perAttempt: number }>({
    remaining: 50,
    total: 50,
    perAttempt: 10,
  });
  const [result, setResult] = useState<CTResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function fetchBatch() {
    if (!applicantId || !industry) {
      setErrorMsg("Missing applicant or industry context.");
      setPhase("error");
      return;
    }
    try {
      const token = localStorage.getItem("sm_auth_token");
      if (!token) throw new Error("Sign in to load your assessment questions.");
      const headers: HeadersInit = { Authorization: `Bearer ${token}` };
      const url = `${BASE_URL}/api/assessments/critical-thinking/quiz?applicantId=${applicantId}&industry=${encodeURIComponent(industry)}`;
      const r = await fetch(url, { headers });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error(r.status === 401 ? "Your session has expired. Please sign in again."
          : r.status === 403 ? "You cannot load questions for this profile."
          : body?.error || `Request failed (${r.status})`);
      }
      const data = await r.json();
      setQuestions(data.questions || []);
      setPoolMeta({
        remaining: data.remainingPool ?? 0,
        total: data.totalPerIndustry ?? 50,
        perAttempt: data.perAttempt ?? 10,
      });
      setAnswers({});
      setCurrent(0);
      setResult(null);
      setPhase(data.questions?.length ? "quiz" : "exhausted");
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to load Critical Thinking questions.");
      setPhase("error");
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await fetchBatch(); })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantId, industry]);

  const total = questions.length;
  const currentQ = questions[current];
  const allAnswered = total > 0 && questions.every(q => typeof answers[q.id] === "number");
  const progressPct = total > 0
    ? Math.round(((current + (currentQ && typeof answers[currentQ.id] === "number" ? 1 : 0)) / total) * 100)
    : 0;

  const pickAnswer = (idx: number) => {
    if (!currentQ) return;
    setAnswers(a => ({ ...a, [currentQ.id]: idx }));
  };

  const next = () => { if (current < total - 1) setCurrent(c => c + 1); };

  const submit = async () => {
    if (!applicantId || !allAnswered) return;
    setPhase("submitting");
    try {
      const token = localStorage.getItem("sm_auth_token");
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const body = {
        applicantId,
        industry,
        jobId: jobId ?? null,
        questionIds: questions.map(q => q.id),
        answers,
      };
      const r = await fetch(`${BASE_URL}/api/assessments/critical-thinking/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const errBody = await r.json().catch(() => ({}));
        throw new Error(errBody?.error || `Submit failed (${r.status})`);
      }
      const data = await r.json();
      const g = data.grading || {};
      const finalResult: CTResult = {
        score: g.score ?? data.score ?? 0,
        correctCount: g.correctCount ?? 0,
        total: g.total ?? questions.length,
        details: g.details ?? [],
        remainingPool: data.remainingPool ?? 0,
        totalPerIndustry: data.totalPerIndustry ?? 50,
      };
      setResult(finalResult);
      setPhase("result");
      onComplete(finalResult.score);
    } catch (e: any) {
      toast({ title: "Submission failed", description: e?.message || "Please try again.", variant: "destructive" });
      setPhase("quiz");
    }
  };

  if (phase === "loading") {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-3 w-full bg-slate-200 rounded" />
          <div className="h-24 w-full bg-slate-200 rounded" />
          <div className="h-12 w-full bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-red-600 font-semibold">{errorMsg}</p>
        <p className="text-xs text-slate-500 mt-2">Make sure your profile has a target industry set.</p>
      </div>
    );
  }

  if (phase === "exhausted") {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
            <Lock className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="text-lg font-bold text-primary">All critical thinking questions completed</h2>
        </div>
        <p className="text-sm text-slate-600">
          You've answered all {poolMeta.total} critical thinking questions for <strong>{industry}</strong>.
          No further attempts are available for this industry.
        </p>
      </div>
    );
  }

  if (phase === "result" && result) {
    const pct = result.score;
    const passed = pct >= 60;
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center border",
            passed ? "bg-green-50 text-green-600 border-green-200" : "bg-amber-50 text-amber-600 border-amber-200"
          )}>
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Critical Thinking · {industry}</h2>
            <p className="text-sm text-slate-500">
              You scored <strong>{pct}%</strong> ({result.correctCount}/{result.total} correct)
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-4 text-xs text-slate-600 flex items-center justify-between">
          <span>Question pool</span>
          <span className="font-semibold text-primary">
            {Math.max(0, result.totalPerIndustry - result.remainingPool)} / {result.totalPerIndustry} answered
          </span>
        </div>

        <div className="space-y-3 mb-6">
          {result.details.map((d, i) => (
            <div key={d.id} className={cn(
              "rounded-xl border p-4",
              d.correct ? "border-green-200 bg-green-50/40" : "border-amber-200 bg-amber-50/40"
            )}>
              <div className="flex items-start gap-2">
                {d.correct ? (
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary">{i + 1}. {d.prompt}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Your answer: <span className="font-medium">{d.pickedText || "(no answer)"}</span>
                  </p>
                  {!d.correct && (
                    <p className="text-xs text-green-700 mt-0.5">
                      Correct: <span className="font-medium">{d.bestText}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90"
          >
            Back to assessments
          </button>
          {result.remainingPool > 0 && (
            <button
              onClick={() => { setPhase("loading"); fetchBatch(); }}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-primary rounded-xl font-semibold text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Take another set ({result.remainingPool} questions left)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-xs text-slate-500">
          Pool: {poolMeta.total - poolMeta.remaining}/{poolMeta.total} used · This set: {total} questions
        </span>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-primary">Critical Thinking · {industry}</h2>
          <p className="text-xs text-slate-500">Question {Math.min(current + 1, total)} of {total}</p>
        </div>
      </div>

      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-accent transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      {currentQ && (
        <div className="space-y-4">
          <p className="text-base font-semibold text-primary">{currentQ.prompt}</p>
          <div className="space-y-2">
            {currentQ.options.map((opt, idx) => {
              const selected = answers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => pickAnswer(idx)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm",
                    selected
                      ? "border-accent bg-accent/5 text-primary font-semibold"
                      : "border-slate-200 hover:border-accent/40 text-slate-700"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="text-sm text-slate-500 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        {current < total - 1 ? (
          <button
            onClick={next}
            disabled={!currentQ || typeof answers[currentQ.id] !== "number"}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={!allAnswered || phase === "submitting"}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {phase === "submitting" ? "Submitting…" : "Submit"} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
