import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { DataPrivacyConsent, hasPrivacyConsent } from "@/components/DataPrivacyConsent";
import { Building2, ArrowRight, Mail } from "lucide-react";
import { Link, useLocation } from "wouter";

const BASE_PATH = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const EMPLOYER_DPA_KEY = "sm_dpa_consent_employer";

export default function EmployerPortal() {
  const [, setLocation] = useLocation();
  const [consented, setConsented] = useState<boolean>(() => hasPrivacyConsent(EMPLOYER_DPA_KEY));
  const [email, setEmail] = useState("");

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
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center">
          <div className="mx-auto w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mb-8">
            <Building2 className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary mb-6">
            Employer Portal
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            We are fine-tuning our automated matching algorithms for employers. 
            Soon, you will have access to a curated pool of top-tier, pre-assessed candidates.
          </p>

          <div className="bg-white p-2 rounded-xl border border-border shadow-lg flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-10">
            <div className="relative flex-1 flex items-center">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none text-slate-900"
                onKeyDown={e => {
                  if (e.key === "Enter" && email.trim()) {
                    setLocation(`${BASE_PATH}/signup?role=employer&email=${encodeURIComponent(email.trim())}`);
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                if (email.trim()) {
                  setLocation(`${BASE_PATH}/signup?role=employer&email=${encodeURIComponent(email.trim())}`);
                } else {
                  setLocation(`${BASE_PATH}/signup?role=employer`);
                }
              }}
              className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors whitespace-nowrap">
              Join Waitlist
            </button>
          </div>

          <Link href="/" className="inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to homepage
          </Link>
        </div>
      </main>
    </div>
  );
}
