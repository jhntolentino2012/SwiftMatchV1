import { useState } from "react";
import { ShieldCheck, FileLock2, Eye, Mail, AlertCircle } from "lucide-react";

type Role = "applicant" | "employer";

interface Props {
  role: Role;
  storageKey: string;
  onAccept: () => void;
  onDecline?: () => void;
}

const COMMON_RIGHTS = [
  "Access — request a copy of your personal data we hold.",
  "Correction — ask us to update inaccurate or outdated information.",
  "Erasure or blocking — withdraw consent and request deletion, subject to retention required by law.",
  "Object to processing — refuse certain uses (e.g. marketing).",
  "Data portability — receive your data in a structured, electronic format.",
  "File a complaint with the National Privacy Commission (NPC) at privacy.gov.ph.",
];

const APPLICANT_COPY = {
  intro:
    "To match you with employers, SwiftMatch collects and processes the personal information you submit through this profile.",
  collected: [
    "Identifiers — full name, suffix, nickname, pronouns, contact number, email, current and permanent address.",
    "Employment data — work history, positions held, reasons for leaving, education, certifications, skills, and references.",
    "Assessment data — answers to our knowledge, personality, and typing assessments, and the resulting scores.",
    "Profile content — resume file, social/professional links (LinkedIn, Facebook), expected salary, and availability.",
    "Technical data — device, browser, and basic usage logs needed to operate and secure the platform.",
  ],
  purposes: [
    "Build your applicant profile and recommend matching job openings.",
    "Allow verified employers who use SwiftMatch to discover and contact you.",
    "Generate your personalized assessment results and career suggestions.",
    "Send service-related notifications (account, application status, security).",
    "Improve our matching algorithms and platform reliability.",
  ],
  sharing:
    "Your profile and assessment summary may be shared with verified employers on SwiftMatch when you apply or appear in their candidate searches. We do not sell your data to third parties.",
};

const EMPLOYER_COPY = {
  intro:
    "To onboard your company and grant access to candidate matching, SwiftMatch collects information about you and your business.",
  collected: [
    "Contact identifiers — your name, work email, phone number, and job title.",
    "Company details — business name, address, industry, and verification documents (when applicable).",
    "Hiring data — job postings, role requirements, and shortlisting actions you take inside SwiftMatch.",
    "Technical data — device, browser, and basic usage logs needed to operate and secure the platform.",
  ],
  purposes: [
    "Verify your company and create your employer account.",
    "Match your job postings with assessed candidates.",
    "Provide analytics on your hiring funnel and candidate engagement.",
    "Send service-related notifications (billing, account, security).",
    "Comply with applicable Philippine labor and tax regulations.",
  ],
  sharing:
    "Information you publish in job postings is visible to applicants. We do not share your hiring activity with other employers, and we do not sell your data to third parties.",
};

export function DataPrivacyConsent({ role, storageKey, onAccept, onDecline }: Props) {
  const [agreed, setAgreed] = useState(false);
  const copy = role === "applicant" ? APPLICANT_COPY : EMPLOYER_COPY;

  const handleAccept = () => {
    if (!agreed) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ acceptedAt: new Date().toISOString(), version: "1.0", role }),
      );
    } catch {
      /* ignore storage errors */
    }
    onAccept();
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-accent/5 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-primary">
            Data Privacy Notice & Consent
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            In compliance with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173)
          </p>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6 space-y-6 text-sm text-slate-700 leading-relaxed">
        <p>{copy.intro}</p>

        {/* What we collect */}
        <section>
          <h3 className="flex items-center gap-2 font-semibold text-primary mb-2">
            <FileLock2 className="w-4 h-4 text-accent" /> What we collect
          </h3>
          <ul className="space-y-1.5 pl-1">
            {copy.collected.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Why we collect */}
        <section>
          <h3 className="flex items-center gap-2 font-semibold text-primary mb-2">
            <Eye className="w-4 h-4 text-accent" /> How we use your data
          </h3>
          <ul className="space-y-1.5 pl-1">
            {copy.purposes.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Sharing */}
        <section>
          <h3 className="flex items-center gap-2 font-semibold text-primary mb-2">
            <Mail className="w-4 h-4 text-accent" /> Who we share it with
          </h3>
          <p>{copy.sharing}</p>
        </section>

        {/* Retention & Security */}
        <section>
          <h3 className="font-semibold text-primary mb-2">Retention & security</h3>
          <p>
            We keep your data only for as long as your account is active or as required by law (e.g. tax,
            labor, or anti-fraud regulations). Data is stored on secured servers with industry-standard
            encryption in transit and at rest. You may request deletion at any time, subject to legal
            retention requirements.
          </p>
        </section>

        {/* Your rights */}
        <section>
          <h3 className="font-semibold text-primary mb-2">Your rights as a data subject</h3>
          <ul className="space-y-1.5 pl-1">
            {COMMON_RIGHTS.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            To exercise your rights or raise a concern, contact our Data Protection Officer at{" "}
            <span className="font-semibold text-primary">privacy@swiftmatch.ph</span>.
          </p>
        </section>

        {/* Important callout */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>
            Please do not submit sensitive personal information that is not requested in the form
            (e.g. government IDs, health records, religious or political affiliations) unless an
            employer specifically requires it for a verified job application.
          </p>
        </div>

        {/* Consent checkbox */}
        <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-accent/50 transition-colors">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-accent focus:ring-accent shrink-0"
          />
          <span className="text-sm text-slate-700">
            I have read and understood this Data Privacy Notice. I freely give my informed consent
            to SwiftMatch to collect, store, and process my personal information for the purposes
            stated above, in accordance with the Philippine Data Privacy Act of 2012.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {onDecline && (
          <button
            type="button"
            onClick={onDecline}
            className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium text-sm transition-colors"
          >
            Decline
          </button>
        )}
        <button
          type="button"
          onClick={handleAccept}
          disabled={!agreed}
          className="px-8 py-2.5 rounded-xl font-semibold text-sm bg-primary text-white shadow-md hover:bg-primary/90 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          I Agree — Continue
        </button>
      </div>
    </div>
  );
}

export function hasPrivacyConsent(storageKey: string): boolean {
  try {
    return Boolean(localStorage.getItem(storageKey));
  } catch {
    return false;
  }
}
