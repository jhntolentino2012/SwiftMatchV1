import { useState, useRef } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useListAssessments, useSubmitAssessment } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CheckCircle, ChevronRight, Video, ClipboardList, Brain,
  Heart, Users, Lightbulb, Bot, ArrowLeft, Upload, Lock
} from "lucide-react";

const CATEGORY_META: Record<string, { icon: any; color: string; desc: string }> = {
  knowledge:        { icon: Brain,    color: "text-blue-600 bg-blue-50 border-blue-200",    desc: "Test your domain knowledge and technical skills." },
  personality:      { icon: Heart,    color: "text-pink-600 bg-pink-50 border-pink-200",    desc: "Understand your work style and interpersonal traits." },
  cultural_fit:     { icon: Users,    color: "text-orange-600 bg-orange-50 border-orange-200", desc: "See how your values and work style align with company culture." },
  critical_thinking:{ icon: Lightbulb,color: "text-yellow-600 bg-yellow-50 border-yellow-200", desc: "Demonstrate logical reasoning and sound decision-making." },
  ai_readiness:     { icon: Bot,      color: "text-violet-600 bg-violet-50 border-violet-200", desc: "Show how you adapt to and work alongside AI tools." },
};

export default function AssessmentCenter() {
  const applicantId = Number(localStorage.getItem("sm_applicant_id") || "0");
  const { data: assessments = [], isLoading } = useListAssessments();
  const { mutateAsync: submitAssessment } = useSubmitAssessment();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"assessments" | "video">("assessments");
  const [activeTest, setActiveTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, any[]>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<Set<number>>(new Set());
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleAnswer = (testId: number, questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [testId]: [
        ...(prev[testId] || []).filter((a: any) => a.questionId !== questionId),
        { questionId, answer }
      ]
    }));
  };

  const handleSubmitTest = async (test: any) => {
    if (!applicantId) {
      toast({ title: "No profile found", description: "Please create your profile first.", variant: "destructive" });
      return;
    }
    const testAnswers = answers[test.id] || [];
    if (testAnswers.length < test.questions?.length) {
      toast({ title: "Incomplete", description: "Please answer all questions before submitting.", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(test.id);
      await submitAssessment({ id: test.id, data: { applicantId, answers: testAnswers } });
      setSubmitted(prev => new Set([...prev, test.id]));
      setActiveTest(null);
      toast({ title: "Assessment submitted!", description: `${test.title} results saved.` });
    } catch {
      toast({ title: "Submission failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  };

  const completedCount = submitted.size;
  const totalCount = assessments.length;

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

          {/* Progress bar */}
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

        {/* ── Assessment Tab ── */}
        {activeTab === "assessments" && (
          <>
            {/* Active test */}
            {activeTest ? (
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

                  {activeTest.questions?.map((q: any, idx: number) => {
                    const selected = (answers[activeTest.id] || []).find((a: any) => a.questionId === q.id)?.answer;
                    return (
                      <div key={q.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <p className="font-semibold text-slate-800 text-sm">{idx + 1}. {q.text}</p>
                        {q.type === "multiple_choice" ? (
                          <div className="space-y-2">
                            {q.options?.map((opt: string) => (
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
                    {(answers[activeTest.id] || []).length} / {activeTest.questions?.length || 0} answered
                  </p>
                  <button
                    onClick={() => handleSubmitTest(activeTest)}
                    disabled={submitting === activeTest.id}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all"
                  >
                    {submitting === activeTest.id ? "Submitting…" : "Submit Assessment"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Assessment list */
              <div className="space-y-4">
                {isLoading ? (
                  [1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />)
                ) : assessments.map((test: any) => {
                  const meta = CATEGORY_META[test.category] || CATEGORY_META.knowledge;
                  const Icon = meta.icon;
                  const isDone = submitted.has(test.id);
                  return (
                    <div
                      key={test.id}
                      className={cn(
                        "bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-5 transition-all",
                        isDone ? "border-green-200" : "border-border hover:border-accent/40 hover:shadow-md"
                      )}
                    >
                      <div className={cn("w-12 h-12 rounded-xl border flex items-center justify-center shrink-0", meta.color)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-primary">{test.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 capitalize">{test.category.replace(/_/g, " ")} · {test.questions?.length || 0} questions</p>
                        <p className="text-xs text-slate-400 mt-0.5">{meta.desc}</p>
                      </div>
                      {isDone ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold text-sm shrink-0">
                          <CheckCircle className="w-5 h-5" /> Completed
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveTest(test)}
                          className="px-5 py-2.5 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors shrink-0"
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
                      <p className="text-xs text-slate-500 mt-0.5">Assessment results are tied to your applicant profile.</p>
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
                { label: "Good lighting", tip: "Natural light or a ring light works best." },
                { label: "Speak clearly", tip: "No background noise, confident tone." },
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
