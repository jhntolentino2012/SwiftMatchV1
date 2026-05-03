import { useState } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Building2, User, Briefcase, Check, ChevronRight, ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const INDUSTRIES = [
  "Technology / IT","BPO / Call Center","Healthcare / Medical","Finance / Banking",
  "Marketing / Advertising","Real Estate & Construction","Manufacturing & Engineering",
  "Retail & E-commerce","Education & Training","Hospitality & Tourism","Food & Beverage",
  "Creative Arts & Design","Logistics & Transportation","Telecommunications",
  "Media & Entertainment","Human Resources","Government & Public Sector",
  "Agriculture & Environment","Legal & Compliance","Architecture & Urban Planning",
];

const COMPANY_SIZES = ["1–10 employees","11–50 employees","51–200 employees","201–500 employees","501–1,000 employees","1,000+ employees"];

const STEPS = [
  { label: "Company",  icon: Building2 },
  { label: "Contact",  icon: User },
  { label: "Job Post", icon: Briefcase },
];

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all px-4 py-3";

export default function EmployerOnboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [company, setCompany] = useState({
    companyName: "", industry: "", companySize: "", location: "", website: "", description: "",
  });
  const [contact, setContact] = useState({
    contactPerson: "", contactPosition: "", contactEmail: "jhn.tolentino2012@gmail.com", contactPhone: "",
  });
  const [job, setJob] = useState({
    title: "", workSetup: [] as string[], employmentType: [] as string[],
    location: "", salaryRange: "", description: "", requirements: [""],
  });

  const setC = (k: keyof typeof company) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setCompany(p => ({ ...p, [k]: e.target.value }));
  const setP = (k: keyof typeof contact) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setContact(p => ({ ...p, [k]: e.target.value }));
  const setJ = (k: keyof typeof job) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setJob(p => ({ ...p, [k]: e.target.value }));

  function togglePill(field: "workSetup" | "employmentType", val: string) {
    setJob(p => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter(v => v !== val) : [...p[field], val],
    }));
  }

  function addReq() { setJob(p => ({ ...p, requirements: [...p.requirements, ""] })); }
  function removeReq(i: number) { setJob(p => ({ ...p, requirements: p.requirements.filter((_, idx) => idx !== i) })); }
  function setReq(i: number, val: string) {
    setJob(p => { const r = [...p.requirements]; r[i] = val; return { ...p, requirements: r }; });
  }

  function step0Valid() { return company.companyName.trim() && company.industry && company.companySize && company.location.trim(); }
  function step1Valid() { return contact.contactPerson.trim() && contact.contactPosition.trim() && contact.contactEmail.trim(); }
  function step2Valid() { return job.title.trim() && job.description.trim() && job.workSetup.length > 0; }

  async function handleSubmit() {
    const token = localStorage.getItem("sm_auth_token");
    setSaving(true);
    try {
      const reqs = job.requirements.map(r => r.trim()).filter(Boolean);
      const payload = {
        title: job.title.trim(),
        company: company.companyName.trim(),
        location: job.location.trim() || company.location.trim(),
        description: job.description.trim(),
        requirements: reqs,
        salaryRange: job.salaryRange.trim() || "Competitive — to be discussed",
        industry: company.industry,
        companyDescription: company.description.trim(),
        workSetup: job.workSetup.join(", "),
        employmentType: job.employmentType.join(", "),
        isDemo: false,
      };

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${BASE}/api/jobs`, { method: "POST", headers, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Failed to post job");

      localStorage.setItem("sm_employer_profile", JSON.stringify({
        companyName: company.companyName,
        industry: company.industry,
        companySize: company.companySize,
        location: company.location,
        website: company.website,
        description: company.description,
        contactPerson: contact.contactPerson,
        contactEmail: contact.contactEmail,
        contactPhone: contact.contactPhone,
      }));

      setDone(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4 pt-20">
          <div className="bg-white rounded-2xl border border-border shadow-lg p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-primary mb-2">You're all set!</h2>
            <p className="text-slate-500 text-sm mb-2">
              <strong className="text-slate-700">{company.companyName}</strong> is now registered on SwiftMatch.
            </p>
            <p className="text-slate-400 text-xs mb-8">Your first job post is live. Candidates matching your criteria will be surfaced automatically.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setLocation("/profile")}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors text-sm">
                Go to Employer Profile
              </button>
              <button onClick={() => setLocation("/jobs")}
                className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm">
                View Job Listings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-accent" />
            <span className="font-display font-extrabold text-2xl text-primary">Employer Setup</span>
          </div>
          <p className="text-sm text-slate-500">Complete your profile and post your first job in minutes.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > i;
            const active = step === i;
            return (
              <div key={i} className="flex items-center">
                <div className={cn(
                  "flex flex-col items-center gap-1.5 w-24",
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    done ? "bg-primary border-primary" : active ? "bg-white border-primary" : "bg-white border-slate-200"
                  )}>
                    {done
                      ? <Check className="w-4 h-4 text-white" />
                      : <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-slate-300")} />
                    }
                  </div>
                  <span className={cn("text-[11px] font-semibold", active ? "text-primary" : done ? "text-primary/70" : "text-slate-300")}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 w-12 mb-5 transition-all", step > i ? "bg-primary" : "bg-slate-200")} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8">

          {/* ── Step 0: Company ── */}
          {step === 0 && (
            <div className="space-y-5">
              <h3 className="font-display font-bold text-lg text-primary mb-1">Company Information</h3>
              <FieldGroup label="Company Name" required>
                <input value={company.companyName} onChange={setC("companyName")} placeholder="e.g. Nexus Contact Solutions" className={inputCls} />
              </FieldGroup>
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldGroup label="Industry" required>
                  <select value={company.industry} onChange={setC("industry")} className={inputCls}>
                    <option value="">— Select industry —</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </FieldGroup>
                <FieldGroup label="Company Size" required>
                  <select value={company.companySize} onChange={setC("companySize")} className={inputCls}>
                    <option value="">— Select size —</option>
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FieldGroup>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldGroup label="Office Location" required>
                  <input value={company.location} onChange={setC("location")} placeholder="e.g. Ortigas, Pasig City" className={inputCls} />
                </FieldGroup>
                <FieldGroup label="Website (optional)">
                  <input value={company.website} onChange={setC("website")} placeholder="https://yourcompany.com" className={inputCls} />
                </FieldGroup>
              </div>
              <FieldGroup label="Company Description (optional)">
                <textarea value={company.description} onChange={setC("description")}
                  placeholder="Tell candidates about your company culture, mission, and what makes you a great place to work..."
                  rows={4} className={cn(inputCls, "resize-none")} />
              </FieldGroup>
            </div>
          )}

          {/* ── Step 1: Contact ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="font-display font-bold text-lg text-primary mb-1">Contact Person</h3>
              <p className="text-sm text-slate-500 -mt-2">Who should candidates and SwiftMatch reach out to?</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldGroup label="Full Name" required>
                  <input value={contact.contactPerson} onChange={setP("contactPerson")} placeholder="e.g. Maria Santos" className={inputCls} />
                </FieldGroup>
                <FieldGroup label="Position / Title" required>
                  <input value={contact.contactPosition} onChange={setP("contactPosition")} placeholder="e.g. HR Manager" className={inputCls} />
                </FieldGroup>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldGroup label="Email" required>
                  <input type="email" value={contact.contactEmail} onChange={setP("contactEmail")} placeholder="hr@company.com" className={inputCls} />
                </FieldGroup>
                <FieldGroup label="Phone (optional)">
                  <input type="tel" value={contact.contactPhone} onChange={setP("contactPhone")} placeholder="+63 9XX XXX XXXX" className={inputCls} />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* ── Step 2: Job Post ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-display font-bold text-lg text-primary mb-1">Post Your First Job</h3>
              <FieldGroup label="Job Title" required>
                <input value={job.title} onChange={setJ("title")} placeholder="e.g. Operations Manager" className={inputCls} />
              </FieldGroup>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Work Setup <span className="text-accent">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {["Onsite","Work from Home","Hybrid"].map(ws => {
                    const sel = job.workSetup.includes(ws);
                    return (
                      <button key={ws} type="button" onClick={() => togglePill("workSetup", ws)}
                        className={cn("px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
                          sel ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary"
                        )}>
                        {ws}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Employment Type</label>
                <div className="flex flex-wrap gap-2">
                  {["Full-time","Part-time","Project-based","Contractual"].map(et => {
                    const sel = job.employmentType.includes(et);
                    return (
                      <button key={et} type="button" onClick={() => togglePill("employmentType", et)}
                        className={cn("px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
                          sel ? "bg-accent text-white border-accent" : "bg-white text-slate-600 border-slate-200 hover:border-accent/40 hover:text-accent"
                        )}>
                        {et}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldGroup label="Job Location">
                  <input value={job.location} onChange={setJ("location")} placeholder={company.location || "e.g. Makati City"} className={inputCls} />
                </FieldGroup>
                <FieldGroup label="Salary Range">
                  <input value={job.salaryRange} onChange={setJ("salaryRange")} placeholder="e.g. PHP 45,000–65,000/month" className={inputCls} />
                </FieldGroup>
              </div>
              <FieldGroup label="Job Description" required>
                <textarea value={job.description} onChange={setJ("description")}
                  placeholder="Describe the role, responsibilities, and what a typical day looks like..."
                  rows={5} className={cn(inputCls, "resize-none")} />
              </FieldGroup>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Requirements</label>
                <div className="space-y-2">
                  {job.requirements.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={r} onChange={e => setReq(i, e.target.value)}
                        placeholder={`Requirement ${i + 1}`} className={cn(inputCls, "flex-1")} />
                      {job.requirements.length > 1 && (
                        <button type="button" onClick={() => removeReq(i)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addReq}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors mt-1">
                    <Plus className="w-3.5 h-3.5" /> Add requirement
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 ? !step0Valid() : !step1Valid()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-all"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving || !step2Valid()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent/90 disabled:opacity-40 transition-all"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</> : <><Check className="w-4 h-4" /> Post Job & Finish</>}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
