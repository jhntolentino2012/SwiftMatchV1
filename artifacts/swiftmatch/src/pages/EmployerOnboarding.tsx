import { useState } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import {
  Building2, User, Briefcase, Check, ChevronRight, ChevronLeft,
  Loader2, Plus, X, Eye, EyeOff, Pencil, MapPin, Banknote, CheckCircle2,
  ClipboardList, Lock, Crown, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BulletTextarea } from "@/components/BulletTextarea";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const INDUSTRIES = [
  "Technology / IT","BPO / Call Center","Healthcare / Medical","Finance / Banking",
  "Marketing / Advertising","Real Estate & Construction","Manufacturing & Engineering",
  "Retail & E-commerce","Education & Training","Hospitality & Tourism","Food & Beverage",
  "Creative Arts & Design","Logistics & Transportation","Telecommunications",
  "Media & Entertainment","Human Resources","Government & Public Sector",
  "Agriculture & Environment","Legal & Compliance","Architecture & Urban Planning",
];

const COMPANY_SIZES = [
  "1–10 employees","11–50 employees","51–200 employees",
  "201–500 employees","501–1,000 employees","1,000+ employees",
];

const STEPS = [
  { label: "Company",       icon: Building2,     premium: false },
  { label: "Contact",       icon: User,          premium: false },
  { label: "Job Post",      icon: Briefcase,     premium: false },
  { label: "Custom Quiz",   icon: ClipboardList, premium: true  },
];

function FieldGroup({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-semibold text-slate-700">
          {label}{required && <span className="text-accent ml-0.5">*</span>}
        </label>
        {hint && <span className="text-[11px] text-slate-400 italic">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all px-4 py-3";

function SectionLabel({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 mb-1">
      <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="font-display font-bold text-primary text-base leading-tight">{title}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function EmployerOnboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingAboutCompany, setEditingAboutCompany] = useState(false);

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

  const setC = (k: keyof typeof company) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setCompany(p => ({ ...p, [k]: e.target.value }));
  const setP = (k: keyof typeof contact) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setContact(p => ({ ...p, [k]: e.target.value }));
  const setJ = (k: keyof typeof job) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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

  function step0Valid() {
    return company.companyName.trim() && company.industry && company.companySize && company.location.trim();
  }
  function step1Valid() {
    return contact.contactPerson.trim() && contact.contactPosition.trim() && contact.contactEmail.trim();
  }
  function step2Valid() {
    return job.title.trim() && job.description.trim() && job.workSetup.length > 0;
  }

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

  /* ── Done screen ── */
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
            <p className="text-slate-400 text-xs mb-8">
              Your first job post is live. Candidates matching your criteria will be surfaced automatically.
            </p>
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

  const previewReqs = job.requirements.map(r => r.trim()).filter(Boolean);

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
            const isDone = step > i;
            const active = step === i;
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5 w-24 relative">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all relative",
                    s.premium
                      ? "bg-white border-dashed border-accent/40"
                      : isDone ? "bg-primary border-primary" : active ? "bg-white border-primary" : "bg-white border-slate-200"
                  )}>
                    {isDone && !s.premium
                      ? <Check className="w-4 h-4 text-white" />
                      : <Icon className={cn("w-4 h-4",
                          s.premium ? "text-accent/60" : active ? "text-primary" : "text-slate-300")} />}
                    {s.premium && (
                      <span className="absolute -top-1.5 -right-1.5 bg-accent text-white rounded-full w-4 h-4 flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <span className={cn("text-[11px] font-semibold",
                    s.premium ? "text-accent/70" :
                    active ? "text-primary" : isDone ? "text-primary/70" : "text-slate-300")}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("h-0.5 w-12 mb-5 transition-all",
                    STEPS[i + 1]?.premium
                      ? "bg-gradient-to-r from-slate-200 to-accent/20"
                      : step > i ? "bg-primary" : "bg-slate-200")} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8">

          {/* ──── Step 0: Company ──── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-lg text-primary">Company Information</h3>
                <p className="text-sm text-slate-400 mt-0.5">Basic details shown on every job listing you post.</p>
              </div>

              <FieldGroup label="Company Name" required>
                <input value={company.companyName} onChange={setC("companyName")}
                  placeholder="e.g. Nexus Contact Solutions" className={inputCls} />
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
                  <input value={company.location} onChange={setC("location")}
                    placeholder="e.g. Ortigas, Pasig City" className={inputCls} />
                </FieldGroup>
                <FieldGroup label="Website">
                  <input value={company.website} onChange={setC("website")}
                    placeholder="https://yourcompany.com" className={inputCls} />
                </FieldGroup>
              </div>

              {/* About the Company — prominent section */}
              <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
                <SectionLabel
                  icon={Building2}
                  title="About the Company"
                  sub='Appears in every job listing under "About [Your Company Name]" — help candidates understand who you are.'
                />
                <BulletTextarea
                  value={company.description}
                  onChange={v => setCompany(p => ({ ...p, description: v }))}
                  placeholder={`Tell candidates about ${company.companyName || "your company"}'s culture, mission, benefits, and what makes it a great place to work.`}
                  rows={6}
                  className="bg-white"
                />
              </div>
            </div>
          )}

          {/* ──── Step 1: Contact ──── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display font-bold text-lg text-primary">Contact Person</h3>
                <p className="text-sm text-slate-400 mt-0.5">Who should candidates and SwiftMatch reach out to?</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldGroup label="Full Name" required>
                  <input value={contact.contactPerson} onChange={setP("contactPerson")}
                    placeholder="e.g. Maria Santos" className={inputCls} />
                </FieldGroup>
                <FieldGroup label="Position / Title" required>
                  <input value={contact.contactPosition} onChange={setP("contactPosition")}
                    placeholder="e.g. HR Manager" className={inputCls} />
                </FieldGroup>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldGroup label="Email" required>
                  <input type="email" value={contact.contactEmail} onChange={setP("contactEmail")}
                    placeholder="hr@company.com" className={inputCls} />
                </FieldGroup>
                <FieldGroup label="Phone">
                  <input type="tel" value={contact.contactPhone} onChange={setP("contactPhone")}
                    placeholder="+63 9XX XXX XXXX" className={inputCls} />
                </FieldGroup>
              </div>
            </div>
          )}

          {/* ──── Step 2: Job Post ──── */}
          {step === 2 && (
            <div className="space-y-6">

              {/* Tab bar: Edit / Preview */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-primary">Post Your First Job</h3>
                  <p className="text-sm text-slate-400 mt-0.5">Fill in the job details then preview how it will look to candidates.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreview(v => !v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                    showPreview
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-500 border-slate-200 hover:border-primary/40 hover:text-primary"
                  )}
                >
                  {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPreview ? "Edit" : "Preview"}
                </button>
              </div>

              {!showPreview ? (
                /* ── Edit Mode ── */
                <div className="space-y-5">
                  <FieldGroup label="Job Title" required>
                    <input value={job.title} onChange={setJ("title")}
                      placeholder="e.g. Operations Manager" className={inputCls} />
                  </FieldGroup>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Work Setup <span className="text-accent">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["Onsite", "Work from Home", "Hybrid"].map(ws => {
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
                      {["Full-time", "Part-time", "Project-based", "Contractual"].map(et => {
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
                      <input value={job.location} onChange={setJ("location")}
                        placeholder={company.location || "e.g. Makati City"} className={inputCls} />
                    </FieldGroup>
                    <FieldGroup label="Salary Range">
                      <input value={job.salaryRange} onChange={setJ("salaryRange")}
                        placeholder="e.g. PHP 45,000–65,000/month" className={inputCls} />
                    </FieldGroup>
                  </div>

                  {/* About the Job */}
                  <div className="space-y-2 rounded-xl border border-accent/20 bg-accent/[0.03] p-4">
                    <SectionLabel
                      icon={Briefcase}
                      title="About the Job"
                      sub='Appears in the job listing under "About the Job" — describe the role, responsibilities, and day-to-day.'
                    />
                    <BulletTextarea
                      value={job.description}
                      onChange={v => setJob(p => ({ ...p, description: v }))}
                      placeholder="Describe the role, key responsibilities, what success looks like, and what a typical day involves."
                      rows={6}
                      className="bg-white"
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Requirements</label>
                    <div className="space-y-2">
                      {job.requirements.map((r, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input value={r} onChange={e => setReq(i, e.target.value)}
                            placeholder={`e.g. Requirement ${i + 1}`} className={cn(inputCls, "flex-1")} />
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

                  {/* About the Company — review / edit panel */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-slate-700">About the Company</span>
                        <span className="text-[11px] text-slate-400">· carried from Step 1</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingAboutCompany(v => !v)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        {editingAboutCompany ? "Done" : "Edit"}
                      </button>
                    </div>
                    <div className="p-4">
                      {editingAboutCompany ? (
                        <BulletTextarea
                          value={company.description}
                          onChange={v => setCompany(p => ({ ...p, description: v }))}
                          placeholder="Describe your company — culture, mission, benefits, and why candidates should join you."
                          rows={5}
                        />
                      ) : company.description.trim() ? (
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
                          {company.description}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingAboutCompany(true)}
                          className="text-sm text-slate-400 italic hover:text-primary transition-colors"
                        >
                          No company description yet — click to add one.
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Preview Mode ── */
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Candidate view — how this listing will appear
                    </p>
                  </div>
                  <div className="p-5 space-y-6">

                    {/* Header */}
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/12 inline-block mb-2">
                        {company.industry || "Industry"}
                      </span>
                      <h2 className="font-display font-bold text-xl text-primary leading-tight">
                        {job.title || <span className="text-slate-300">Job Title</span>}
                      </h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          {company.companyName || <span className="text-slate-300">Company</span>}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location || company.location || <span className="text-slate-300">Location</span>}
                        </span>
                      </div>
                      {job.salaryRange && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1">
                          <Banknote className="w-3.5 h-3.5" /> {job.salaryRange}
                        </div>
                      )}
                      {(job.workSetup.length > 0 || job.employmentType.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {job.workSetup.map(w => (
                            <span key={w} className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">{w}</span>
                          ))}
                          {job.employmentType.map(e => (
                            <span key={e} className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-medium">{e}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* About the Job */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <h3 className="font-display font-bold text-primary">About the Job</h3>
                      </div>
                      {job.description.trim() ? (
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                          {job.description}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-300 italic">Job description will appear here…</p>
                      )}

                      {previewReqs.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Requirements</p>
                          <ul className="space-y-2">
                            {previewReqs.map((req, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* About the Company */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="w-4 h-4 text-primary" />
                        <h3 className="font-display font-bold text-primary">
                          About {company.companyName || "the Company"}
                        </h3>
                      </div>
                      {company.description.trim() ? (
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {company.description}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-300 italic">Company description will appear here…</p>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── Step 3: Custom Assessment (Premium — locked) ──── */}
          {step === 3 && (
            <div className="space-y-6">
              <SectionLabel
                icon={ClipboardList}
                title="Custom Assessment (Optional)"
                sub="Add recruiter-set questions applicants answer right after the K&E quiz."
              />

              <div className="relative rounded-2xl border-2 border-dashed border-accent/30 bg-gradient-to-br from-accent/5 via-white to-primary/5 p-6 sm:p-8 overflow-hidden">
                <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                  <Crown className="w-3 h-3" /> Premium
                </div>

                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-primary text-lg mb-1">
                      Build a custom quiz for this role
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Filter applicants automatically with role-specific questions you write yourself. Each candidate's score is shown alongside their K&amp;E results.
                    </p>
                  </div>
                </div>

                {/* Feature list */}
                <ul className="grid sm:grid-cols-2 gap-2.5 mb-6 text-sm">
                  {[
                    "Multiple choice & short answer questions",
                    "Set accepted answers and points per question",
                    "Auto-graded with the K&E assessment",
                    "Filter & rank applicants by quiz score",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Disabled preview field */}
                <div className="bg-white/70 border border-slate-200 rounded-xl p-4 mb-5 select-none pointer-events-none opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sample Question 1</span>
                    <span className="text-[10px] text-slate-400">Multiple choice · 1pt</span>
                  </div>
                  <div className="h-9 rounded-lg bg-slate-100 mb-2" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-7 rounded-md bg-slate-100" />
                    <div className="h-7 rounded-md bg-slate-100" />
                    <div className="h-7 rounded-md bg-slate-100" />
                    <div className="h-7 rounded-md bg-slate-100" />
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  disabled
                  title="Available with the Premium plan"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent/30 text-white font-bold rounded-xl cursor-not-allowed text-sm"
                >
                  <Sparkles className="w-4 h-4" /> Upgrade to Premium to unlock
                </button>

                <p className="text-[11px] text-center text-slate-400 mt-3">
                  You can post this job now and add a custom assessment later once you upgrade.
                </p>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={() => { setStep(s => s - 1); setShowPreview(false); }}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={
                  step === 0 ? !step0Valid()
                  : step === 1 ? !step1Valid()
                  : !step2Valid()
                }
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 disabled:opacity-40 transition-all"
              >
                {step === 2 ? <>Next: Custom Quiz <ChevronRight className="w-4 h-4" /></> : <>Continue <ChevronRight className="w-4 h-4" /></>}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving || !step2Valid()}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent/90 disabled:opacity-40 transition-all"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting…</>
                  : <><Check className="w-4 h-4" /> Post Job & Finish</>}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
