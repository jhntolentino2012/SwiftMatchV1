import { useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";
import {
  Lock, Crown, BarChart2, Users, TrendingUp,
  CheckCircle, Star, Zap, ChevronRight, User, Building2
} from "lucide-react";

type Audience = "applicant" | "employer";

const APPLICANT_PREVIEWS = [
  { label: "Overall Match Score",     value: "—",    blur: true,  note: "Your fit across all active job postings" },
  { label: "Knowledge Score",         value: "—",    blur: true,  note: "Based on your knowledge assessment" },
  { label: "Personality Fit",         value: "—",    blur: true,  note: "Alignment with top employer profiles" },
  { label: "Commitment Index",        value: "—",    blur: true,  note: "Long-term retention prediction" },
  { label: "Situational Score",       value: "—",    blur: true,  note: "Decision-making in real scenarios" },
  { label: "Employer Views (30d)",    value: "—",    blur: true,  note: "How many employers viewed your profile" },
];

const EMPLOYER_PREVIEWS = [
  { label: "Total Candidates Matched", value: "—",   blur: true,  note: "Applicants matching your job criteria" },
  { label: "Avg Candidate Score",      value: "—",   blur: true,  note: "Mean assessment score of your matches" },
  { label: "Top Skill Match",          value: "—",   blur: true,  note: "Most common skill among your matches" },
  { label: "Candidate Pipeline",       value: "—",   blur: true,  note: "Applicants in active hiring stages" },
  { label: "Time-to-Match (avg)",      value: "—",   blur: true,  note: "Average days from post to first match" },
  { label: "Retention Forecast",       value: "—",   blur: true,  note: "Predicted 1-year retention rate" },
];

const PREMIUM_FEATURES = [
  { icon: BarChart2, label: "Full Assessment Breakdown", desc: "Detailed scores for all 4 assessment categories with peer benchmarks." },
  { icon: TrendingUp, label: "Match Analytics",          desc: "See how your profile ranks against others in your field." },
  { icon: Users,      label: "Employer Insights",        desc: "Know which companies viewed your profile and when." },
  { icon: Star,       label: "Priority Visibility",      desc: "Rise to the top of employer search results." },
  { icon: Zap,        label: "Instant Notifications",    desc: "Get alerted the moment a match requests contact." },
];

export default function ResultsPage() {
  const [audience, setAudience] = useState<Audience>("applicant");
  const previews = audience === "applicant" ? APPLICANT_PREVIEWS : EMPLOYER_PREVIEWS;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-4">
            <Crown className="w-4 h-4" /> Premium Feature
          </div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Your Results Dashboard</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Unlock detailed assessment scores, match analytics, and hiring insights — all in one place.
          </p>
        </div>

        {/* Audience toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-1 bg-white border border-border p-1 rounded-xl shadow-sm">
            {([
              { id: "applicant", label: "I'm an Applicant", icon: User },
              { id: "employer",  label: "I'm an Employer",  icon: Building2 },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAudience(id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all",
                  audience === id
                    ? "bg-primary text-white shadow"
                    : "text-slate-500 hover:text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Blurred preview cards */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-sm">
              {audience === "applicant" ? "Your Assessment Results" : "Candidate Analytics"}
            </span>
            <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" /> Premium only
            </span>
          </div>

          <div className="p-6 grid sm:grid-cols-2 gap-4">
            {previews.map((item, i) => (
              <div
                key={i}
                className="relative p-4 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden"
              >
                <p className="text-xs font-semibold text-slate-500 mb-1">{item.label}</p>
                <div className="relative">
                  <p className="text-2xl font-extrabold text-primary select-none" style={{ filter: "blur(8px)", userSelect: "none" }}>
                    87%
                  </p>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 bg-white/90 border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500">Locked</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Premium CTA */}
        <div className="bg-gradient-to-br from-primary to-blue-800 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl mb-1">Upgrade to Premium</h2>
              <p className="text-blue-200 text-sm">
                Get full access to your assessment results, match scores, and recruiter insights.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {PREMIUM_FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                <Icon className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-blue-200 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-colors text-sm">
              <Crown className="w-4 h-4" />
              Subscribe to Premium
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20">
              View Pricing
            </button>
          </div>
        </div>

        {/* Free teaser */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" /> What you have for free
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              "Access to the 10-step profile wizard",
              "Resume / CV auto-fill with AI",
              "4 pre-assessment categories",
              "Intro video upload",
              "Recommended job matches",
              "Course & training recommendations",
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Complete your assessments to unlock your preview scores.</p>
            <Link
              href="/assessment"
              className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              Go to Assessments <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
