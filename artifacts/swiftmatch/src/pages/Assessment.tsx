import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useListAssessments, useSubmitAssessment } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isOwnerEmail } from "@/lib/owner";
import { cn } from "@/lib/utils";
import { arrayOrEmpty } from "@/lib/array-or-empty";
import {
  CheckCircle, ChevronRight, Video, ClipboardList, Brain,
  Heart, Users, Lightbulb, Bot, ArrowLeft, Upload, Lock,
  RotateCcw, TrendingUp, Briefcase,
} from "lucide-react";
import KnowledgeQuiz from "./KnowledgeQuiz";
import PersonalityQuiz from "./PersonalityQuiz";
import CulturalFitQuiz from "./CulturalFitQuiz";
import CriticalThinkingQuiz from "./CriticalThinkingQuiz";
import AIReadinessQuiz from "./AIReadinessQuiz";

const BASE_URL = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

function normalizeIndustry(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("tech") || s.includes("software") || s.includes("it consult")) return "Technology / IT";
  if (s.includes("bpo") || s.includes("call center") || s.includes("outsourc")) return "BPO / Call Center";
  if (s.includes("health") || s.includes("medical") || s.includes("nurs") || s.includes("pharma")) return "Healthcare / Medical";
  if (s.includes("financ") || s.includes("bank") || s.includes("invest") || s.includes("accounting")) return "Finance / Banking";
  if (s.includes("market") || s.includes("advertis") || s.includes("brand")) return "Marketing / Advertising";
  if (s.includes("real estate") || s.includes("construct") || s.includes("propert")) return "Real Estate & Construction";
  if (s.includes("manufactur") || s.includes("engineer") || s.includes("industrial")) return "Manufacturing & Engineering";
  if (s.includes("retail") || s.includes("e-commerce") || s.includes("ecommerce") || s.includes("fmcg") || s.includes("consum")) return "Retail & E-commerce";
  if (s.includes("educat") || s.includes("train") || s.includes("academ")) return "Education & Training";
  if (s.includes("hospital") || s.includes("tourism") || s.includes("hotel") || s.includes("travel")) return "Hospitality & Tourism";
  if (s.includes("food") || s.includes("beverage") || s.includes("restaurant")) return "Food & Beverage";
  if (s.includes("creat") || s.includes("design") || s.includes("art") || s.includes("media")) return "Creative Arts & Design";
  if (s.includes("logist") || s.includes("transport") || s.includes("aviation") || s.includes("freight") || s.includes("supply chain")) return "Logistics & Transportation";
  if (s.includes("telecom")) return "Telecommunications";
  if (s.includes("entertain") || s.includes("broadcast") || s.includes("publish")) return "Media & Entertainment";
  if (s.includes("human resource") || s.includes(" hr") || s === "hr") return "Human Resources";
  if (s.includes("government") || s.includes("public sector")) return "Government & Public Sector";
  if (s.includes("agri") || s.includes("environment") || s.includes("farm")) return "Agriculture & Environment";
  if (s.includes("legal") || s.includes("complian") || s.includes("law")) return "Legal & Compliance";
  if (s.includes("architect") || s.includes("urban") || s.includes("planning")) return "Architecture & Urban Planning";
  if (s.includes("virtual assist") || s.includes(" va ") || s === "va" || s.startsWith("va ") || s.endsWith(" va") || s.includes("remote assist")) return "Virtual Assistance";
  return raw;
}

type AssessmentResult = {
  id: number;
  applicantId: number;
  assessmentId: number | null;
  assessmentTitle: string;
  score: number;
  passed: boolean;
  completedAt: string;
};

function retakeAvailableAt(completedAt: string): Date {
  const d = new Date(completedAt);
  d.setMonth(d.getMonth() + 1);
  return d;
}

function canRetake(result: AssessmentResult): boolean {
  return new Date() >= retakeAvailableAt(result.completedAt);
}

const CATEGORY_META: Record<string, { icon: any; color: string; desc: string }> = {
  knowledge:        { icon: Brain,    color: "text-blue-600 bg-blue-50 border-blue-200",       desc: "Assess your industry knowledge with role-specific adaptive questions." },
  personality:      { icon: Heart,    color: "text-pink-600 bg-pink-50 border-pink-200",       desc: "Discover your work style and personality traits." },
  cultural_fit:     { icon: Users,    color: "text-orange-600 bg-orange-50 border-orange-200", desc: "See how your values and work style align with company culture." },
  critical_thinking:{ icon: Lightbulb,color: "text-yellow-600 bg-yellow-50 border-yellow-200",desc: "Demonstrate logical reasoning and sound decision-making." },
  ai_readiness:     { icon: Bot,      color: "text-violet-600 bg-violet-50 border-violet-200", desc: "Show how you adapt to and work alongside AI tools." },
};

export default function AssessmentCenter() {
  const { user } = useAuth();
  const cooldownBypassed = isOwnerEmail(user?.email);
  // Prefer the applicantId that /auth/me returned (populated by useAuth into localStorage),
  // fall back to the value set during the onboarding flow.
  const applicantId: number | null =
    (user?.applicantId ?? null) ||
    (Number(localStorage.getItem("sm_applicant_id") || "0") || null);
  const storedIndustry = applicantId ? localStorage.getItem(`sm_ke_industry_${applicantId}`) ?? "" : "";
  const storedRole = storedIndustry && applicantId
    ? localStorage.getItem(`sm_ke_role_${applicantId}_${encodeURIComponent(storedIndustry)}`) ?? ""
    : "";
  // Fall back to the profile's target industry/role when nothing is stored in localStorage yet
  const effectiveIndustry = storedIndustry || user?.targetIndustry || "";
  const effectiveRole = storedRole || (storedIndustry ? "" : user?.targetRole || "");
  const { data: assessmentData, isLoading, isError, refetch } = useListAssessments();
  const assessments = arrayOrEmpty<any>(assessmentData).filter(
    test => test && typeof test === "object" && typeof test.id === "number" &&
      typeof test.title === "string" && typeof test.category === "string",
  );
  const invalidAssessments = assessmentData !== undefined &&
    (!Array.isArray(assessmentData) || assessments.length !== assessmentData.length);
  const { mutateAsync: submitAssessment } = useSubmitAssessment();
  const { toast } = useToast();

  const [activeTab, setActiveTab]   = useState<"assessments" | "video">("assessments");
  const [activeTest, setActiveTest] = useState<any>(null);
  const [showKEQuiz, setShowKEQuiz] = useState(false);
  const [showPersonalityQuiz, setShowPersonalityQuiz] = useState(false);
  const [showCulturalFitQuiz, setShowCulturalFitQuiz] = useState(false);
  const [showCriticalThinkingQuiz, setShowCriticalThinkingQuiz] = useState(false);
  const [showAIReadinessQuiz, setShowAIReadinessQuiz] = useState(false);
  const [answers, setAnswers]       = useState<Record<number, any[]>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [videoFile, setVideoFile]   = useState<File | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  // ── Real results from server ──
  const [completedResults, setCompletedResults] = useState<Record<number, AssessmentResult>>({});
  const [keResult, setKeResult]                 = useState<AssessmentResult | null>(null);
  const [personalityResult, setPersonalityResult] = useState<AssessmentResult | null>(null);
  const [loadingResults, setLoadingResults]     = useState(true);
  const [resultsError, setResultsError] = useState<string | null>(null);

  // Job context — populated when redirected from Apply flow via URL params
  const jobContext = useMemo(() => {
    if (typeof window === "undefined") return null;
    const p = new URLSearchParams(window.location.search);
    const jobId = p.get("jobId");
    const industry = p.get("industry");
    if (!jobId || !industry) return null;
    return {
      jobId: Number(jobId),
      jobTitle: p.get("jobTitle") ?? "",
      company: p.get("company") ?? "",
      industry: normalizeIndustry(industry),
    };
  }, []);

  // Auto-open K&E quiz when page is reached from a job application
  useEffect(() => {
    if (jobContext) setShowKEQuiz(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResults = useCallback(async () => {
    if (!applicantId) { setLoadingResults(false); return; }
    const token = localStorage.getItem("sm_auth_token");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const res = await fetch(`${BASE_URL}/api/assessments/applicant/${applicantId}/results`, { headers });
      if (!res.ok) throw new Error(`Results could not be loaded (${res.status}).`);
      const payload: unknown = await res.json();
      if (!Array.isArray(payload)) throw new Error("Invalid assessment results response.");
      const results = arrayOrEmpty<AssessmentResult>(payload);
      const map: Record<number, AssessmentResult> = {};
      let ke: AssessmentResult | null = null;
      let personality: AssessmentResult | null = null;
      results.forEach(r => {
        if (!r || typeof r !== "object" || typeof r.score !== "number" ||
          typeof r.completedAt !== "string") return;
        if (r.assessmentId) map[r.assessmentId] = r;
        const title = typeof r.assessmentTitle === "string" ? r.assessmentTitle.toLowerCase() : "";
        if (title.includes("knowledge")) ke = r;
        if (title.includes("personality")) personality = r;
      });
      setCompletedResults(map);
      setKeResult(ke);
      setPersonalityResult(personality);
      setResultsError(null);
    } catch (error: any) {
      setResultsError(error?.message || "Results could not be loaded.");
    } finally {
      setLoadingResults(false);
    }
  }, [applicantId]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleAnswer = (testId: number, questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [testId]: [
        ...arrayOrEmpty<any>(prev[testId]).filter(a => a && a.questionId !== questionId),
        { questionId, answer }
      ]
    }));
  };

  const handleSubmitTest = async (test: any) => {
    if (!applicantId) {
      toast({ title: "No profile found", description: "Please create your profile first.", variant: "destructive" });
      return;
    }
    const testAnswers = arrayOrEmpty<any>(answers[test.id]);
    const questions = arrayOrEmpty<any>(test?.questions);
    if (!Array.isArray(test?.questions) || !questions.length || questions.some(q =>
      !q || typeof q !== "object" || typeof q.id !== "number" || typeof q.text !== "string" ||
      (q.type === "multiple_choice" && (!Array.isArray(q.options) || !q.options.length ||
        q.options.some((opt: unknown) => typeof opt !== "string"))))) {
      toast({ title: "Questions unavailable", description: "Please reload the assessments and try again.", variant: "destructive" });
      return;
    }
    if (questions.some(q => !testAnswers.some(a => a && a.questionId === q.id &&
      typeof a.answer === "string" && a.answer.trim().length > 0))) {
      toast({ title: "Incomplete", description: "Please answer all questions before submitting.", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(test.id);
      const result = await submitAssessment({ id: test.id, data: { applicantId, answers: testAnswers } });
      await fetchResults();
      setActiveTest(null);
      const score = (result as any)?.score;
      const passed = (result as any)?.passed;
      toast({
        title: passed ? "✓ Evaluation submitted!" : "Evaluation submitted",
        description: score != null
          ? `${test.title}: ${score}% — ${passed ? "Passed" : "Try again to improve your score"}`
          : `${test.title} results saved.`,
      });
    } catch (error: any) {
      toast({ title: "Submission failed", description: error?.response?.status === 401
        ? "Your session has expired. Please sign in again."
        : error?.response?.status === 403
          ? "You cannot submit an assessment for this profile."
          : "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  };

  // Completion counts (de-duplicated)
  const genericCompleted = assessments.filter(a =>
    a.category !== "knowledge" && a.category !== "personality" && completedResults[a.id]
  ).length;
  const completedCount = (keResult ? 1 : 0) + (personalityResult ? 1 : 0) + genericCompleted;
  const totalCount = assessments.length;

  // ── Knowledge & Expertise adaptive quiz view ──
  if (showKEQuiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <KnowledgeQuiz
            applicantId={applicantId}
            initialIndustry={jobContext?.industry || effectiveIndustry || undefined}
            initialRole={effectiveRole || undefined}
            recommendedIndustry={user?.targetIndustry || undefined}
            jobId={jobContext?.jobId ?? null}
            jobContext={jobContext ? { title: jobContext.jobTitle, company: jobContext.company } : null}
            onComplete={async (score: number) => {
              await fetchResults();
              setShowKEQuiz(false);
              toast({ title: "Knowledge quiz complete!", description: `You scored ${score}%. Results saved to your profile.` });
              // If this came from a job application, check for a recruiter custom assessment
              if (jobContext?.jobId) {
                try {
                  const r = await fetch(`${BASE_URL}/api/jobs/${jobContext.jobId}/custom-assessment`);
                  if (r.ok) {
                    const payload = await r.json();
                    if (Array.isArray(payload.questions) && payload.questions.length > 0) {
                      window.location.href = `${BASE_URL}/custom-assessment?jobId=${jobContext.jobId}`;
                    }
                  }
                } catch { /* silent */ }
              }
            }}
            onBack={() => setShowKEQuiz(false)}
          />
        </main>
      </div>
    );
  }

  // ── AI Readiness quiz view ──
  if (showAIReadinessQuiz) {
    const aiIndustry = jobContext?.industry || effectiveIndustry || user?.targetIndustry || "";
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <AIReadinessQuiz
            applicantId={applicantId}
            industry={aiIndustry}
            jobId={jobContext?.jobId ?? null}
            onComplete={async () => {
              await fetchResults();
              toast({ title: "AI Readiness submitted", description: "Your AI readiness result has been recorded." });
            }}
            onBack={() => { setShowAIReadinessQuiz(false); fetchResults(); }}
          />
        </main>
      </div>
    );
  }

  // ── Critical Thinking quiz view ──
  if (showCriticalThinkingQuiz) {
    const ctIndustry = jobContext?.industry || effectiveIndustry || user?.targetIndustry || "";
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <CriticalThinkingQuiz
            applicantId={applicantId}
            industry={ctIndustry}
            jobId={jobContext?.jobId ?? null}
            onComplete={async () => {
              await fetchResults();
              toast({ title: "Critical thinking submitted", description: "Your reasoning result has been recorded." });
            }}
            onBack={() => { setShowCriticalThinkingQuiz(false); fetchResults(); }}
          />
        </main>
      </div>
    );
  }

  // ── Cultural Fit quiz view ──
  if (showCulturalFitQuiz) {
    const cfIndustry = jobContext?.industry || effectiveIndustry || user?.targetIndustry || "";
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <CulturalFitQuiz
            applicantId={applicantId}
            industry={cfIndustry}
            jobId={jobContext?.jobId ?? null}
            onComplete={async () => {
              await fetchResults();
              toast({ title: "Cultural fit submitted", description: "Your cultural fit responses have been recorded." });
            }}
            onBack={() => { setShowCulturalFitQuiz(false); fetchResults(); }}
          />
        </main>
      </div>
    );
  }

  // ── Personality & Work Style quiz view ──
  if (showPersonalityQuiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <PersonalityQuiz
            applicantId={applicantId}
            recommendedLevel={user?.careerLevel || undefined}
            industry={jobContext?.industry || effectiveIndustry || undefined}
            role={effectiveRole || user?.targetRole || undefined}
            onComplete={async () => {
              await fetchResults();
              setShowPersonalityQuiz(false);
              toast({ title: "Personality assessment complete!", description: "Your personality profile has been saved." });
            }}
            onBack={() => setShowPersonalityQuiz(false)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-primary">Skills & Readiness Center</h1>
              <p className="text-sm text-muted-foreground">Complete all 5 evaluations and your intro video to maximise your match score.</p>
            </div>
          </div>

          {totalCount > 0 && (
            <div className="mt-4 bg-white rounded-xl border border-border p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                  <span>{completedCount} of {totalCount} completed</span>
                  <span>{Math.round((completedCount / totalCount) * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-700 rounded-full"
                    style={{ width: `${(completedCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
              {completedCount === totalCount && (
                <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm shrink-0">
                  <CheckCircle className="w-4 h-4" /> All done!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
          {[
            { id: "assessments", label: "Evaluations", icon: ClipboardList },
            { id: "video",       label: "Intro Video", icon: Video },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setActiveTest(null); }}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-primary"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Evaluations Tab ── */}
        {activeTab === "assessments" && (
          <>
            {activeTest ? (
              /* Active generic test form */
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTest(null)}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <div className="w-px h-4 bg-slate-200" />
                  <h2 className="font-display font-bold text-lg text-primary">{activeTest.title}</h2>
                </div>

                <div className="p-6 space-y-5">
                  <p className="text-slate-600 text-sm">{activeTest.description}</p>

                  {!Array.isArray(activeTest.questions) || !activeTest.questions.length ||
                    arrayOrEmpty<any>(activeTest.questions).some(q => !q || typeof q !== "object" ||
                      typeof q.id !== "number" || typeof q.text !== "string" ||
                      (q.type === "multiple_choice" && (!Array.isArray(q.options) || !q.options.length ||
                        q.options.some((opt: unknown) => typeof opt !== "string")))) ? (
                    <p role="alert" className="text-red-600">Questions unavailable. Please reload the assessments and try again.</p>
                  ) : arrayOrEmpty<any>(activeTest.questions).map((q, idx) => {
                    const selected = arrayOrEmpty<any>(answers[activeTest.id]).find(a => a?.questionId === q.id)?.answer;
                    return (
                      <div key={q.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <p className="font-semibold text-slate-800 text-sm">{idx + 1}. {q.text}</p>
                        {q.type === "multiple_choice" ? (
                          <div className="space-y-2">
                            {arrayOrEmpty<string>(q.options).filter(opt => typeof opt === "string").map((opt) => (
                              <label
                                key={opt}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all text-sm",
                                  selected === opt
                                    ? "border-accent bg-accent/8 text-primary font-medium"
                                    : "border-slate-200 bg-white hover:border-accent/50"
                                )}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  value={opt}
                                  checked={selected === opt}
                                  onChange={() => handleAnswer(activeTest.id, q.id, opt)}
                                  className="text-accent"
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            className="w-full p-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-accent focus:border-accent text-sm resize-none"
                            rows={3}
                            placeholder="Your answer…"
                            value={selected || ""}
                            onChange={e => handleAnswer(activeTest.id, q.id, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <p className="text-xs text-slate-400">
                    {arrayOrEmpty<any>(answers[activeTest.id]).length} / {arrayOrEmpty<any>(activeTest.questions).length} answered
                  </p>
                  <button
                    onClick={() => handleSubmitTest(activeTest)}
                    disabled={submitting === activeTest.id}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {submitting === activeTest.id ? "Submitting…" : "Submit"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Evaluation list */
              <div className="space-y-4">
                {isLoading || loadingResults ? (
                  [1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />)
                ) : isError || invalidAssessments || resultsError ? (
                  <div role="alert" className="rounded-xl border border-red-200 bg-white p-6 text-red-700">
                    <p>{resultsError || "Assessments could not be loaded. Please try again."}</p>
                    <button onClick={() => { void refetch(); void fetchResults(); }} className="mt-3 font-semibold underline">Retry</button>
                  </div>
                ) : assessments.length === 0 ? (
                  <p className="rounded-xl border bg-white p-6 text-slate-600">No assessments are available right now.</p>
                ) : assessments.map((test: any) => {
                  const meta        = CATEGORY_META[test.category] || CATEGORY_META.knowledge;
                  const Icon        = meta.icon;
                  const isKE        = test.category === "knowledge";
                  const isPersonality = test.category === "personality";
                  const result: AssessmentResult | null =
                    isKE ? keResult : isPersonality ? personalityResult : (completedResults[test.id] ?? null);
                  const isDone = !!result;

                  return (
                    <div
                      key={test.id}
                      className={cn(
                        "bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-5 transition-all",
                        isDone ? "border-green-200 bg-green-50/30" : "border-border hover:border-accent/40 hover:shadow-md"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center shrink-0", meta.color)}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-primary">{test.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 capitalize">
                          {test.category.replace(/_/g, " ")}
                        </p>
                        {isDone && result ? (
                          /* Score row */
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className={cn(
                              "text-xs font-bold px-2.5 py-0.5 rounded-full border",
                              result.passed
                                ? "text-green-700 bg-green-50 border-green-200"
                                : "text-amber-700 bg-amber-50 border-amber-200"
                            )}>
                              {result.score}%
                            </span>
                            <span className={cn(
                              "text-xs font-semibold",
                              result.passed ? "text-green-600" : "text-amber-600"
                            )}>
                              {result.passed ? "Passed" : "Did not pass"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              · {new Date(result.completedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5">{meta.desc}</p>
                        )}
                      </div>

                      {isDone ? (
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 text-green-600 font-semibold text-sm">
                            <CheckCircle className="w-4 h-4" /> Done
                          </div>
                          {result && (cooldownBypassed || test.category === "cultural_fit" || test.category === "critical_thinking" || test.category === "ai_readiness" || canRetake(result)) ? (
                            <button
                              onClick={() => {
                                if (isKE) setShowKEQuiz(true);
                                else if (isPersonality) setShowPersonalityQuiz(true);
                                else if (test.category === "cultural_fit") setShowCulturalFitQuiz(true);
                                else if (test.category === "critical_thinking") setShowCriticalThinkingQuiz(true);
                                else if (test.category === "ai_readiness") setShowAIReadinessQuiz(true);
                                else setActiveTest(test);
                              }}
                              className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              {!result.passed ? "Retake to improve" : "Retake"}
                            </button>
                          ) : result ? (
                            <div className="flex items-center gap-1 text-xs text-slate-400 select-none">
                              <Lock className="w-3 h-3" />
                              Available {retakeAvailableAt(result.completedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (isKE) setShowKEQuiz(true);
                            else if (isPersonality) setShowPersonalityQuiz(true);
                            else if (test.category === "cultural_fit") setShowCulturalFitQuiz(true);
                            else if (test.category === "critical_thinking") setShowCriticalThinkingQuiz(true);
                            else if (test.category === "ai_readiness") setShowAIReadinessQuiz(true);
                            else setActiveTest(test);
                          }}
                          disabled={!applicantId}
                          className="px-5 py-2.5 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  );
                })}

                {!applicantId && (
                  <div className="mt-6 p-5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-primary text-sm">Create your profile first</p>
                      <p className="text-xs text-slate-500 mt-0.5">Evaluation results are tied to your applicant profile.</p>
                    </div>
                    <Link href="/apply" className="px-4 py-2 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors shrink-0">
                      Create Profile
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Intro Video Tab ── */}
        {activeTab === "video" && (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-primary">Introduction Video</h2>
                <p className="text-xs text-slate-500">Employers watch this before reaching out to you.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Record or upload a short <strong>1-minute video</strong> introducing yourself — your skills, experience, and what makes you a great hire. Profiles with a video get <strong>3× more views</strong>.
            </p>

            <div
              onClick={() => videoRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all",
                videoFile ? "border-green-400 bg-green-50" : "border-slate-200 hover:border-accent/50 hover:bg-slate-50"
              )}
            >
              {videoFile ? (
                <>
                  <CheckCircle className="w-10 h-10 text-green-500 mb-3" />
                  <p className="font-semibold text-green-700">{videoFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB · Click to change</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-semibold text-slate-700">Drag & drop or click to upload</p>
                  <p className="text-xs text-slate-400 mt-1">MP4, MOV, WebM · up to 50MB</p>
                </>
              )}
            </div>

            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={e => setVideoFile(e.target.files?.[0] || null)}
            />

            {videoFile && (
              <button className="mt-4 w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" /> Upload Video
              </button>
            )}

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {[
                { label: "Keep it under 60s", tip: "Employers are busy — get to the point quickly." },
                { label: "Good lighting",      tip: "Natural light or a ring light works best." },
                { label: "Speak clearly",      tip: "No background noise, confident tone." },
              ].map(h => (
                <div key={h.label} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-primary mb-0.5">{h.label}</p>
                  <p className="text-xs text-slate-500">{h.tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
