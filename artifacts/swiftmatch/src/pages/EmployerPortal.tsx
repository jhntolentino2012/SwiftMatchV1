import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DataPrivacyConsent, hasPrivacyConsent } from "@/components/DataPrivacyConsent";
import { Building2, ArrowRight, CheckCircle2, Briefcase, Users, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";

const BASE_PATH = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const EMPLOYER_DPA_KEY = "sm_dpa_consent_employer";

function isEmployerSession(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("sm_employer_profile");
}

export default function EmployerPortal() {
  const [, setLocation] = useLocation();
  const [consented, setConsented] = useState<boolean>(() => hasPrivacyConsent(EMPLOYER_DPA_KEY));
  const isEmployer = isEmployerSession();

  if (!consented) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <DataPrivacyConsent
            role="employer"
            storageKey={EMPLOYER_DPA_KEY}
            onAccept={() => setConsented(true)}
            onDecline={() => setLocation("/")}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center pt-24 pb-16">
          <div className="mx-auto w-20 h-20 bg-primary/8 rounded-2xl flex items-center justify-center mb-8">
            <Building2 className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary mb-4">
            Employer Portal
          </h1>

          <p className="text-lg text-slate-600 mb-3 leading-relaxed">
            Hire faster with pre-assessed Filipino talent. Post a job, review pre-qualified
            applicants with verified skills and Knowledge &amp; Excellence scores, and reach out
            in minutes.
          </p>

          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full mb-10">
            <Sparkles className="w-3.5 h-3.5" /> Now live for employers
          </p>

          {/* Feature highlights */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10 text-left">
            <div className="bg-white border border-border rounded-2xl p-5">
              <Briefcase className="w-6 h-6 text-accent mb-2" />
              <p className="font-bold text-sm text-slate-900 mb-1">Post unlimited jobs</p>
              <p className="text-xs text-slate-500">Build descriptions, requirements, and custom assessments per role.</p>
            </div>
            <div className="bg-white border border-border rounded-2xl p-5">
              <Users className="w-6 h-6 text-accent mb-2" />
              <p className="font-bold text-sm text-slate-900 mb-1">Browse candidates</p>
              <p className="text-xs text-slate-500">Filter by industry, role, and assessment score — all profiles vetted.</p>
            </div>
            <div className="bg-white border border-border rounded-2xl p-5">
              <CheckCircle2 className="w-6 h-6 text-accent mb-2" />
              <p className="font-bold text-sm text-slate-900 mb-1">Pre-assessed talent</p>
              <p className="text-xs text-slate-500">Every applicant is graded on knowledge, personality, and commitment.</p>
            </div>
          </div>

          {/* Primary actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isEmployer ? (
              <>
                <button
                  onClick={() => setLocation(`${BASE_PATH}/candidates`)}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                >
                  <Users className="w-4 h-4" /> Browse Candidates
                </button>
                <button
                  onClick={() => setLocation(`${BASE_PATH}/jobs`)}
                  className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors"
                >
                  Manage Postings <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setLocation(`${BASE_PATH}/employer/onboarding`)}
                  className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors"
                >
                  Create Employer Profile <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLocation(`${BASE_PATH}/signin?next=/employer`)}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-primary/30 text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-colors"
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary text-sm font-medium mt-8 transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to homepage
          </Link>
        </div>
      </main>
    </div>
  );
}
