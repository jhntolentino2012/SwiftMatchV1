import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { arrayOrEmpty } from "@/lib/array-or-empty";
import {
  Briefcase, CheckCircle2, XCircle, Loader2, AlertCircle,
  ChevronLeft, Send, ClipboardList,
} from "lucide-react";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

type Question = {
  id: string;
  text: string;
  type: "multiple_choice" | "text";
  options: string[];
  points: number;
};

type AssessmentPayload = {
  jobId: number;
  jobTitle: string;
  company: string;
  questions: Question[];
};

type GradedItem = {
  questionId: string;
  questionText: string;
  type: "multiple_choice" | "text";
  yourAnswer: string;
  correctAnswers: string[];
  correct: boolean;
};

type SubmitResult = {
  score: number;
  correctCount: number;
  totalCount: number;
  breakdown: GradedItem[];
};

function validQuestion(value: unknown): value is Question {
  if (!value || typeof value !== "object") return false;
  const q = value as Partial<Question>;
  return typeof q.id === "string" && q.id.trim() !== "" &&
    typeof q.text === "string" && q.text.trim() !== "" &&
    (q.type === "text" || (q.type === "multiple_choice" &&
      arrayOrEmpty<string>(q.options).filter(o => typeof o === "string" && o.trim() !== "").length > 0));
}

function validBreakdownItem(value: unknown): value is GradedItem {
  return !!value && typeof value === "object" &&
    typeof (value as GradedItem).questionId === "string" &&
    typeof (value as GradedItem).questionText === "string";
}

export default function CustomAssessment() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const params = useMemo(() => {
    if (typeof window === "undefined") return null;
    const p = new URLSearchParams(window.location.search);
    const jobId = Number(p.get("jobId") || "0");
    if (!jobId) return null;
    return { jobId };
  }, []);

  const [data, setData] = useState<AssessmentPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [breakdownInvalid, setBreakdownInvalid] = useState(false);

  useEffect(() => {
    if (!params) {
      setLoadError("Missing job ID. Please open this page from a job application.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${BASE}/api/jobs/${params.jobId}/custom-assessment`);
        if (!res.ok) {
          setLoadError("Could not load this assessment.");
          setLoading(false);
          return;
        }
         const payload: AssessmentPayload = await res.json();
         const rawQuestions = arrayOrEmpty<Question>(payload?.questions);
         if (!rawQuestions.length || rawQuestions.some(q => !validQuestion(q))) {
           setLoadError(rawQuestions.length ? "This assessment contains invalid questions. Please contact the employer." : "This job does not have a custom assessment.");
          setLoading(false);
          return;
        }
         setData({ ...payload, questions: rawQuestions.map(q => ({
           ...q, options: arrayOrEmpty<string>(q.options).filter(o => typeof o === "string" && o.trim() !== ""),
         })) });
      } catch {
        setLoadError("Network error while loading the assessment.");
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  function setAnswer(qId: string, value: string) {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }

   const questions = arrayOrEmpty<Question>(data?.questions);
   const allAnswered = questions.length > 0 && questions.every(q => validQuestion(q) && (answers[q.id] ?? "").trim() !== "");

  async function handleSubmit() {
     if (!data || !params || !allAnswered) return;
    if (!user) {
      setLocation(`${BASE}/signin?next=/custom-assessment?jobId=${params.jobId}`);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const token = localStorage.getItem("sm_auth_token");
      const res = await fetch(`${BASE}/api/jobs/${params.jobId}/custom-assessment/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.error || "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
       const r: SubmitResult = await res.json();
       if (!r || typeof r !== "object" || typeof r.score !== "number" ||
           typeof r.correctCount !== "number" || typeof r.totalCount !== "number") {
         setSubmitError("The assessment response was invalid. Please check your results later.");
         return;
       }
       setBreakdownInvalid(!Array.isArray(r.breakdown) ||
         arrayOrEmpty<GradedItem>(r.breakdown).some(b => !validBreakdownItem(b) || !Array.isArray(b.correctAnswers)));
       setResult({ ...r, breakdown: arrayOrEmpty<GradedItem>(r?.breakdown).filter(validBreakdownItem).map(b => ({
         ...b, correctAnswers: arrayOrEmpty<string>(b.correctAnswers).filter(a => typeof a === "string"),
       })) });
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h2 className="font-display text-lg font-bold text-slate-900 mb-2">Assessment unavailable</h2>
            <p className="text-sm text-muted-foreground mb-5">{loadError || "Please try again from the Jobs page."}</p>
            <Link href={`${BASE}/jobs`} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              <ChevronLeft className="w-4 h-4" /> Back to Jobs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Result view ─────────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                result.score >= 70 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              )}>
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-primary">Assessment Submitted</h1>
                <p className="text-sm text-muted-foreground">{data.jobTitle} — {data.company}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary">{result.score}%</div>
                <div className="text-xs text-muted-foreground mt-1">Score</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-700">{result.correctCount}</div>
                <div className="text-xs text-muted-foreground mt-1">Correct</div>
              </div>
              <div className="bg-rose-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-rose-700">{result.totalCount - result.correctCount}</div>
                <div className="text-xs text-muted-foreground mt-1">Wrong</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold text-primary">Answer breakdown</h2>
             {(breakdownInvalid || arrayOrEmpty<GradedItem>(result.breakdown).filter(validBreakdownItem).length !== result.totalCount) && (
               <p className="text-sm text-amber-700">Some answer breakdown details are unavailable for this submission.</p>
             )}
             {arrayOrEmpty<GradedItem>(result.breakdown).filter(validBreakdownItem).map((b, i) => (
              <div key={b.questionId} className={cn(
                "bg-white border rounded-xl p-5",
                b.correct ? "border-emerald-200" : "border-rose-200"
              )}>
                <div className="flex items-start gap-3 mb-3">
                  {b.correct
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Question {i + 1}</div>
                    <div className="text-sm font-medium text-slate-900">{b.questionText}</div>
                  </div>
                </div>
                <div className="ml-8 space-y-1.5 text-sm">
                  <div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Your answer:</span>{" "}
                    <span className={cn("font-medium", b.correct ? "text-emerald-700" : "text-rose-700")}>
                      {b.yourAnswer || "(no answer)"}
                    </span>
                  </div>
                  {!b.correct && (
                    <div>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                         {arrayOrEmpty<string>(b.correctAnswers).length > 1 ? "Accepted answers:" : "Correct answer:"}
                      </span>{" "}
                       <span className="font-medium text-slate-700">{arrayOrEmpty<string>(b.correctAnswers).join(", ") || "Unavailable"}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`${BASE}/results`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90">
              View full results
            </Link>
            <Link href={`${BASE}/jobs`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
              Back to Jobs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Quiz view ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20 space-y-6">
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 flex items-start gap-3">
          <Briefcase className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-0.5">Employer Assessment</div>
            <div className="text-sm font-medium text-slate-900 truncate">{data.jobTitle}</div>
            <div className="text-xs text-muted-foreground">{data.company}</div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h1 className="font-display text-xl font-bold text-primary">Custom Assessment</h1>
          </div>
          <p className="text-sm text-muted-foreground">
             {questions.length} question{questions.length === 1 ? "" : "s"} from the recruiter. Answer all to submit.
          </p>
        </div>

        <div className="space-y-4">
           {questions.filter(validQuestion).map((q, i) => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-start gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="text-sm font-medium text-slate-900 flex-1">{q.text}</div>
              </div>

              {q.type === "multiple_choice" ? (
                <div className="space-y-2 ml-8">
                   {arrayOrEmpty<string>(q.options).filter(o => typeof o === "string").map((opt, optIdx) => {
                    const selected = answers[q.id] === opt;
                    return (
                      <label key={optIdx} className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}>
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={selected}
                          onChange={() => setAnswer(q.id, opt)}
                          className="text-primary"
                        />
                        <span className="text-sm text-slate-700">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  value={answers[q.id] ?? ""}
                  onChange={e => setAnswer(q.id, e.target.value)}
                  placeholder="Type your answer here…"
                  rows={3}
                  className="ml-8 w-[calc(100%-2rem)] border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              )}
            </div>
          ))}
        </div>

        {submitError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {submitError}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <Link href={`${BASE}/jobs`} className="text-sm text-muted-foreground hover:text-primary">
            <ChevronLeft className="w-4 h-4 inline" /> Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
              allAnswered && !submitting
                ? "bg-primary text-white hover:bg-primary/90"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            )}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Submitting…" : "Submit Assessment"}
          </button>
        </div>
        {!allAnswered && (
          <p className="text-xs text-muted-foreground text-right">
             Unanswered: {questions.filter(q => !validQuestion(q) || !(answers[q.id] ?? "").trim()).length}
          </p>
        )}
      </main>
    </div>
  );
}
