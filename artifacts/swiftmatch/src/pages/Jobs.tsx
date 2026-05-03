import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { JobSearchWidget } from "@/components/JobSearchWidget";
import { useListJobs } from "@workspace/api-client-react";
import {
  MapPin, Briefcase, Building2, ChevronRight, Search,
  CheckCircle2, Clock, Banknote, ArrowUpRight, X,
  Pencil, Save, AlertCircle, Plus, Loader2, Trash2,
  ClipboardList, CheckSquare, Square, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BulletTextarea } from "@/components/BulletTextarea";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

type CustomQuestion = {
  id: string;
  text: string;
  type: "multiple_choice" | "text";
  options?: string[];
  correctAnswers: string[];
  points?: number;
};

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salaryRange: string;
  industry: string;
  companyDescription?: string;
  customQuestions?: CustomQuestion[];
  isDemo?: boolean;
  createdAt: string;
};

function newQuestion(): CustomQuestion {
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text: "",
    type: "multiple_choice",
    options: ["", ""],
    correctAnswers: [],
    points: 1,
  };
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/** Parse Work Setup / Employment Type lines appended during job creation */
function parseJobDescription(desc: string) {
  const wsMatch = desc.match(/\n\nWork Setup: (.+?)(\n|$)/);
  const etMatch = desc.match(/\nEmployment Type: (.+?)(\n|$)/);
  const baseDesc = desc.replace(/\n\nWork Setup:[\s\S]*$/, "").trim();
  const workSetup = wsMatch ? wsMatch[1].split(",").map(s => s.trim()).filter(Boolean) : [];
  const employmentType = etMatch ? etMatch[1].split(",").map(s => s.trim()).filter(Boolean) : [];
  return { baseDesc, workSetup, employmentType };
}

function buildFullDescription(baseDesc: string, workSetup: string[], employmentType: string[]) {
  return [
    baseDesc,
    workSetup.length > 0 ? `\n\nWork Setup: ${workSetup.join(", ")}` : "",
    employmentType.length > 0 ? `\nEmployment Type: ${employmentType.join(", ")}` : "",
  ].join("");
}

function isEmployerSession(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("sm_employer_profile");
}

function getEmployerCompany(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("sm_employer_profile");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.companyName === "string" ? parsed.companyName : null;
  } catch {
    return null;
  }
}

function hasValidToken(): boolean {
  const token = localStorage.getItem("sm_auth_token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

const ADMIN_EMAIL = "jhn.tolentino2012@gmail.com";

function isAdminSession(): boolean {
  const token = localStorage.getItem("sm_auth_token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      typeof payload.email === "string" &&
      payload.email.toLowerCase() === ADMIN_EMAIL &&
      typeof payload.exp === "number" &&
      payload.exp * 1000 > Date.now()
    );
  } catch {
    return false;
  }
}

const inputCls =
  "w-full border border-slate-200 rounded-xl bg-white text-sm placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all px-4 py-3";

export default function JobsPage() {
  const { data: rawJobs = [], isLoading, refetch } = useListJobs();
  const [, setLocation] = useLocation();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [employerCompany, setEmployerCompany] = useState<string | null>(null);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "", company: "", location: "", salaryRange: "",
    industry: "", description: "", companyDescription: "",
    requirements: [""], workSetup: [] as string[], employmentType: [] as string[],
    customQuestions: [] as CustomQuestion[],
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [applying, setApplying] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setIsEmployer(isEmployerSession());
    setIsAdmin(isAdminSession());
    setEmployerCompany(getEmployerCompany());
  }, []);

  /** True only if the current employer session belongs to THIS job's company. */
  function ownsJob(job: { company: string }): boolean {
    return isEmployer
      && !!employerCompany
      && employerCompany.trim().toLowerCase() === job.company.trim().toLowerCase();
  }

  async function handleApply(job: Job) {
    if (isEmployer) return;
    if (ownsJob(job)) return;
    if (!hasValidToken()) {
      setLocation(`${BASE}/signup?next=/jobs`);
      return;
    }
    setApplying(job.id);
    try {
      const token = localStorage.getItem("sm_auth_token");
      const res = await fetch(`${BASE}/api/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 409) {
        setAppliedJobIds(prev => new Set([...prev, job.id]));
        const p = new URLSearchParams({
          jobId: String(job.id),
          jobTitle: job.title,
          company: job.company,
          industry: job.industry,
        });
        setLocation(`${BASE}/assessment?${p}`);
      } else if (res.status === 404) {
        const body = await res.json().catch(() => ({}));
        setLocation(body.error?.includes("profile") ? `${BASE}/apply` : `${BASE}/signup`);
      } else {
        setLocation(`${BASE}/signup`);
      }
    } catch {
      setLocation(`${BASE}/signup`);
    } finally {
      setApplying(null);
    }
  }

  function restoreEmployerSession(job: Job) {
    localStorage.setItem("sm_employer_profile", JSON.stringify({
      companyName: job.company,
      industry: job.industry,
      companySize: "",
      location: job.location,
      website: "",
      description: job.companyDescription || "",
      contactPerson: "",
      contactEmail: "",
      contactPhone: "",
    }));
    setIsEmployer(true);
    setEmployerCompany(job.company);
  }

  function exitEmployerMode() {
    localStorage.removeItem("sm_employer_profile");
    setIsEmployer(false);
    setEmployerCompany(null);
  }

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const filterIndustry = params.get("industry") || "";
  const filterLocation = params.get("location") || "";

  const jobs = rawJobs as Job[];
  const filtered = jobs.filter(j => {
    const matchIndustry = filterIndustry
      ? (j.industry ?? "").toLowerCase().includes(filterIndustry.toLowerCase()) ||
        filterIndustry.toLowerCase().includes((j.industry ?? "").toLowerCase()) ||
        (j.title ?? "").toLowerCase().includes(filterIndustry.toLowerCase())
      : true;
    const matchLocation = filterLocation
      ? (j.location ?? "").toLowerCase().includes(filterLocation.toLowerCase())
      : true;
    return matchIndustry && matchLocation;
  });

  const activeFilters = [filterIndustry, filterLocation].filter(Boolean);

  function openEdit(job: Job) {
    if (!hasValidToken()) {
      setNeedsSignIn(true);
      return;
    }
    const { baseDesc, workSetup, employmentType } = parseJobDescription(job.description);
    setEditForm({
      title: job.title,
      company: job.company,
      location: job.location,
      salaryRange: job.salaryRange || "",
      industry: job.industry,
      description: baseDesc,
      companyDescription: job.companyDescription || "",
      requirements: job.requirements.length > 0 ? [...job.requirements] : [""],
      workSetup,
      employmentType,
      customQuestions: job.customQuestions ? [...job.customQuestions] : [],
    });
    setSaveError("");
    setNeedsSignIn(false);
    setEditing(true);
  }

  function cancelEdit() { setEditing(false); setSaveError(""); setNeedsSignIn(false); }

  async function handleDeleteJob() {
    if (!selectedJob) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("sm_auth_token");
      const res = await fetch(`${BASE}/api/jobs/${selectedJob.id}`, {
        method: "DELETE",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        setSelectedJob(null);
        setDeleteConfirm(false);
        refetch();
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  }

  function setEF<K extends keyof typeof editForm>(k: K, v: typeof editForm[K]) {
    setEditForm(p => ({ ...p, [k]: v }));
  }

  function togglePill(field: "workSetup" | "employmentType", val: string) {
    setEditForm(p => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter(v => v !== val) : [...p[field], val],
    }));
  }

  function addReq() { setEF("requirements", [...editForm.requirements, ""]); }
  function removeReq(i: number) { setEF("requirements", editForm.requirements.filter((_, idx) => idx !== i)); }
  function setReqVal(i: number, val: string) {
    const r = [...editForm.requirements]; r[i] = val; setEF("requirements", r);
  }

  // ── Custom assessment question helpers (functional updates to avoid stale state) ─
  function mutateQs(fn: (qs: CustomQuestion[]) => CustomQuestion[]) {
    setEditForm(p => ({ ...p, customQuestions: fn(p.customQuestions) }));
  }
  function addCustomQ() { mutateQs(qs => [...qs, newQuestion()]); }
  function removeCustomQ(i: number) { mutateQs(qs => qs.filter((_, idx) => idx !== i)); }
  function updateCustomQ(i: number, patch: Partial<CustomQuestion>) {
    mutateQs(qs => {
      const next = [...qs];
      next[i] = { ...next[i], ...patch };
      if (patch.type === "text") {
        delete next[i].options;
        if (next[i].correctAnswers.length === 0) next[i].correctAnswers = [];
      }
      if (patch.type === "multiple_choice" && (!next[i].options || next[i].options!.length < 2)) {
        next[i].options = ["", ""];
        next[i].correctAnswers = [];
      }
      return next;
    });
  }
  function setCustomQOption(i: number, optIdx: number, val: string) {
    mutateQs(qs => {
      const next = [...qs];
      const opts = [...(next[i].options ?? [])];
      const oldVal = opts[optIdx];
      opts[optIdx] = val;
      next[i] = {
        ...next[i],
        options: opts,
        correctAnswers: next[i].correctAnswers.map(a => (a === oldVal ? val : a)),
      };
      return next;
    });
  }
  function addCustomQOption(i: number) {
    mutateQs(qs => {
      const next = [...qs];
      next[i] = { ...next[i], options: [...(next[i].options ?? []), ""] };
      return next;
    });
  }
  function removeCustomQOption(i: number, optIdx: number) {
    mutateQs(qs => {
      const next = [...qs];
      const opts = (next[i].options ?? []).filter((_, idx) => idx !== optIdx);
      const removed = (next[i].options ?? [])[optIdx];
      next[i] = {
        ...next[i],
        options: opts,
        correctAnswers: next[i].correctAnswers.filter(a => a !== removed),
      };
      return next;
    });
  }
  function toggleMCCorrect(i: number, opt: string) {
    mutateQs(qs => {
      const next = [...qs];
      const has = next[i].correctAnswers.includes(opt);
      next[i] = {
        ...next[i],
        correctAnswers: has
          ? next[i].correctAnswers.filter(a => a !== opt)
          : [...next[i].correctAnswers, opt],
      };
      return next;
    });
  }
  function setTextCorrect(i: number, val: string) {
    mutateQs(qs => {
      const next = [...qs];
      next[i] = {
        ...next[i],
        correctAnswers: val.split("|").map(s => s.trim()).filter(Boolean),
      };
      return next;
    });
  }

  async function handleSave() {
    if (!selectedJob) return;
    setSaving(true); setSaveError("");
    try {
      const token = localStorage.getItem("sm_auth_token");
      const fullDescription = buildFullDescription(editForm.description, editForm.workSetup, editForm.employmentType);
      const payload = {
        title: editForm.title.trim(),
        company: editForm.company.trim(),
        location: editForm.location.trim(),
        salaryRange: editForm.salaryRange.trim(),
        industry: editForm.industry.trim(),
        description: fullDescription,
        companyDescription: editForm.companyDescription.trim(),
        requirements: editForm.requirements.map(r => r.trim()).filter(Boolean),
        customQuestions: editForm.customQuestions
          .map(q => ({
            ...q,
            text: q.text.trim(),
            options: q.options?.map(o => o.trim()).filter(Boolean),
            correctAnswers: q.correctAnswers.map(a => a.trim()).filter(Boolean),
          }))
          .filter(q =>
            q.text &&
            q.correctAnswers.length > 0 &&
            (q.type === "text" || (q.options && q.options.length >= 2))
          ),
      };
      const res = await fetch(`${BASE}/api/jobs/${selectedJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 401) {
        // Token expired mid-session — show sign-in prompt
        setEditing(false);
        setNeedsSignIn(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Save failed");

      const updated: Job = { ...selectedJob, ...data };
      setSelectedJob(updated);
      setEditing(false);
      setNeedsSignIn(false);
      refetch();
    } catch (err: any) {
      setSaveError(err.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  const canEditJob = !!(selectedJob && !selectedJob.isDemo && (isAdmin || ownsJob(selectedJob)));
  const canDeleteJob = !!(selectedJob && ((isAdmin) || (!selectedJob.isDemo && ownsJob(selectedJob))));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-primary mb-1">
            {activeFilters.length > 0 ? "Search Results" : "Browse Jobs in the Philippines"}
          </h1>
          <p className="text-sm text-slate-500 mb-5">
            {activeFilters.length > 0
              ? `Showing results for ${activeFilters.join(" · ")}`
              : "Discover opportunities across industries and locations"}
          </p>
          <JobSearchWidget />

          {isEmployer && isAdmin && (
            <div className="mt-4 flex items-center justify-between gap-3 bg-accent/8 border border-accent/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-slate-700 min-w-0">
                <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 shrink-0">
                  Employer mode
                </span>
                <span className="truncate text-slate-500">
                  {employerCompany
                    ? <>Signed in as <strong className="text-slate-700">{employerCompany}</strong>. Apply isn't available in employer mode.</>
                    : <>You're in employer mode. Apply isn't available.</>}
                </span>
              </div>
              <button
                onClick={exitEmployerMode}
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-primary border border-primary/30 hover:bg-primary hover:text-white transition-colors"
              >
                Switch to applicant
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-primary mb-1">No exact matches found</h3>
            <p className="text-slate-500 text-sm mb-4">Try a broader search or clear a filter.</p>
            <Link href="/jobs" className="text-accent font-semibold text-sm hover:underline">Clear filters</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 font-medium">{filtered.length} job{filtered.length !== 1 ? "s" : ""} found</p>
            {filtered.map(job => (
              <div key={job.id}
                className="bg-white rounded-2xl border border-border shadow-sm p-6 hover:shadow-md hover:border-primary/20 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/12">
                        {job.industry}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(job.createdAt)}
                      </span>
                      {!job.isDemo && ownsJob(job) && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                          Your posting
                        </span>
                      )}
                      {!job.isDemo && !ownsJob(job) && (
                        <button
                          onClick={e => { e.stopPropagation(); restoreEmployerSession(job); }}
                          className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 hover:bg-primary/8 hover:text-primary hover:border-primary/20 transition-colors"
                        >
                          Re-enter as employer
                        </button>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-lg text-primary group-hover:text-accent transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      {job.salaryRange && (
                        <span className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5" />{job.salaryRange}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2">{job.description}</p>
                    <button onClick={() => { setSelectedJob(job); setEditing(false); }}
                      className="mt-2 text-sm font-semibold text-accent hover:text-accent/80 transition-colors text-left">
                      View more
                    </button>
                  </div>
                  {!isEmployer && (
                    <div className="shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApply(job); }}
                        disabled={applying === job.id}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-70 transition-colors">
                        {applying === job.id
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Applying…</>
                          : appliedJobIds.has(job.id)
                            ? <><CheckCircle2 className="w-3.5 h-3.5" /> Applied</>
                            : <>Apply <ChevronRight className="w-3.5 h-3.5" /></>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!filterIndustry && !filterLocation && (
          <div className="mt-10 p-6 bg-gradient-to-r from-primary to-blue-700 rounded-2xl text-white flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-display font-bold text-lg">Build your profile once. Get found by top employers.</p>
              <p className="text-blue-200 text-sm mt-0.5">Create a free profile and let employers come to you.</p>
            </div>
            <Link href="/signup" className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors shrink-0">
              Create Free Profile <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      {/* ── Job Detail / Edit Panel ── */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-full bg-white shadow-2xl flex flex-col",
        "transition-transform duration-300 ease-in-out",
        selectedJob ? "translate-x-0" : "translate-x-full"
      )}>
        {selectedJob && (
          <>
            {/* ── Panel Header ── */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
              <div className="max-w-3xl mx-auto flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/12 inline-block mb-2">
                    {selectedJob.industry}
                  </span>
                  <h2 className="font-display font-bold text-2xl text-primary leading-tight">
                    {editing ? editForm.title || selectedJob.title : selectedJob.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{selectedJob.company}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{selectedJob.location}</span>
                  </div>
                  {selectedJob.salaryRange && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1">
                      <Banknote className="w-3.5 h-3.5" /> {selectedJob.salaryRange}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {canEditJob && !editing && !deleteConfirm && (
                    <button onClick={() => openEdit(selectedJob)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 text-primary rounded-lg text-xs font-semibold hover:bg-primary/15 transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit Posting
                    </button>
                  )}
                  {canDeleteJob && !editing && (
                    deleteConfirm ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Delete this posting?</span>
                        <button
                          onClick={handleDeleteJob}
                          disabled={deleting}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          Yes, delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(false)}
                          disabled={deleting}
                          className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )
                  )}
                  <button onClick={() => { setSelectedJob(null); setEditing(false); setDeleteConfirm(false); }}
                    className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
                    aria-label="Close">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Scrollable Body ── */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-6 py-8">

                {/* Sign-in required banner */}
                {needsSignIn && !editing && (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-800">Sign in required to edit</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Your session has expired or you haven't signed in yet. Sign in with your employer account to edit this posting.
                      </p>
                      <button
                        onClick={() => setLocation(`${BASE}/signin?next=/jobs`)}
                        className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                      >
                        Sign In to Edit
                      </button>
                    </div>
                  </div>
                )}

                {editing ? (
                  /* ──── Edit Mode ──── */
                  <div className="space-y-6">
                    {saveError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
                      </div>
                    )}

                    {/* Basic fields */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Job Title</label>
                        <input value={editForm.title} onChange={e => setEF("title", e.target.value)} className={inputCls} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</label>
                        <input value={editForm.location} onChange={e => setEF("location", e.target.value)} className={inputCls} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Salary Range</label>
                        <input value={editForm.salaryRange} onChange={e => setEF("salaryRange", e.target.value)}
                          placeholder="e.g. PHP 45,000–65,000/month" className={inputCls} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Industry</label>
                        <input value={editForm.industry} onChange={e => setEF("industry", e.target.value)} className={inputCls} />
                      </div>
                    </div>

                    {/* Work Setup pills */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Work Setup</label>
                      <div className="flex flex-wrap gap-2">
                        {["Onsite", "Work from Home", "Hybrid"].map(ws => {
                          const sel = editForm.workSetup.includes(ws);
                          return (
                            <button key={ws} type="button" onClick={() => togglePill("workSetup", ws)}
                              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                sel ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200 hover:border-primary/40")}>
                              {ws}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Employment Type pills */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Employment Type</label>
                      <div className="flex flex-wrap gap-2">
                        {["Full-time", "Part-time", "Project-based", "Contractual"].map(et => {
                          const sel = editForm.employmentType.includes(et);
                          return (
                            <button key={et} type="button" onClick={() => togglePill("employmentType", et)}
                              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                sel ? "bg-accent text-white border-accent" : "bg-white text-slate-600 border-slate-200 hover:border-accent/40")}>
                              {et}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* About the Job */}
                    <div className="space-y-2 rounded-xl border border-accent/20 bg-accent/[0.03] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-accent" />
                        <label className="text-sm font-bold text-accent">About the Job</label>
                      </div>
                      <BulletTextarea
                        value={editForm.description}
                        onChange={v => setEF("description", v)}
                        placeholder="Describe the role and responsibilities…"
                        rows={6}
                        className="bg-white"
                      />
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Requirements</label>
                      <div className="space-y-2">
                        {editForm.requirements.map((r, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input value={r} onChange={e => setReqVal(i, e.target.value)}
                              placeholder={`Requirement ${i + 1}`} className={cn(inputCls, "flex-1")} />
                            {editForm.requirements.length > 1 && (
                              <button type="button" onClick={() => removeReq(i)}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={addReq}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                          <Plus className="w-3.5 h-3.5" /> Add requirement
                        </button>
                      </div>
                    </div>

                    {/* About the Company */}
                    <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <label className="text-sm font-bold text-primary">About the Company</label>
                      </div>
                      <BulletTextarea
                        value={editForm.companyDescription}
                        onChange={v => setEF("companyDescription", v)}
                        placeholder="Describe your company — culture, mission, benefits…"
                        rows={5}
                        className="bg-white"
                      />
                    </div>

                    {/* Custom Assessment Questions */}
                    <div className="space-y-3 rounded-xl border border-accent/30 bg-accent/[0.04] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-accent" />
                          <label className="text-sm font-bold text-accent">Custom Assessment Questions</label>
                        </div>
                        <span className="text-xs text-slate-500">
                          {editForm.customQuestions.length} question{editForm.customQuestions.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Applicants will answer these after the K&E quiz. Multiple-choice answers are matched exactly. For free-text, separate accepted answers with <code className="px-1 bg-white rounded">|</code>.
                      </p>

                      {editForm.customQuestions.map((q, i) => (
                        <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                {i + 1}
                              </span>
                              <select
                                value={q.type}
                                onChange={e => updateCustomQ(i, { type: e.target.value as CustomQuestion["type"] })}
                                className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                              >
                                <option value="multiple_choice">Multiple choice</option>
                                <option value="text">Free-form text</option>
                              </select>
                            </div>
                            <button type="button" onClick={() => removeCustomQ(i)}
                              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <textarea
                            value={q.text}
                            onChange={e => updateCustomQ(i, { text: e.target.value })}
                            placeholder="Question text…"
                            rows={2}
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                          />

                          {q.type === "multiple_choice" ? (
                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <CheckSquare className="w-3 h-3" /> Tap the box to mark correct answer(s)
                              </div>
                              {(q.options ?? []).map((opt, optIdx) => {
                                const isCorrect = !!opt && q.correctAnswers.includes(opt);
                                return (
                                  <div key={optIdx} className="flex items-center gap-2">
                                    <button type="button"
                                      onClick={() => opt && toggleMCCorrect(i, opt)}
                                      disabled={!opt}
                                      className={cn(
                                        "shrink-0 w-7 h-7 rounded-md border flex items-center justify-center transition-colors",
                                        isCorrect
                                          ? "bg-emerald-500 border-emerald-500 text-white"
                                          : "border-slate-300 hover:border-emerald-400 disabled:opacity-40"
                                      )}
                                      title={isCorrect ? "Correct answer" : "Mark as correct"}
                                    >
                                      {isCorrect ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                    </button>
                                    <input
                                      value={opt}
                                      onChange={e => setCustomQOption(i, optIdx, e.target.value)}
                                      placeholder={`Option ${optIdx + 1}`}
                                      className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    />
                                    {(q.options ?? []).length > 2 && (
                                      <button type="button" onClick={() => removeCustomQOption(i, optIdx)}
                                        className="p-1.5 text-slate-400 hover:text-red-500">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                              <button type="button" onClick={() => addCustomQOption(i)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80">
                                <Plus className="w-3 h-3" /> Add option
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <FileText className="w-3 h-3" /> Accepted answer(s) — separate with <code className="px-1 bg-slate-100 rounded">|</code>
                              </label>
                              <input
                                value={q.correctAnswers.join(" | ")}
                                onChange={e => setTextCorrect(i, e.target.value)}
                                placeholder="e.g. Manila | Metro Manila | NCR"
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                              />
                              <p className="text-[11px] text-slate-400">Matching is case-insensitive.</p>
                            </div>
                          )}
                        </div>
                      ))}

                      <button type="button" onClick={addCustomQ}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add question
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ──── View Mode ──── */
                  <div className="space-y-10">
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <h3 className="font-display font-bold text-primary text-lg">About the Job</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {selectedJob.description}
                      </p>
                      {selectedJob.requirements.length > 0 && (
                        <div className="mt-6">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Requirements</p>
                          <ul className="space-y-2.5">
                            {selectedJob.requirements.map((req, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </section>

                    {selectedJob.customQuestions && selectedJob.customQuestions.length > 0 && (
                      <>
                        <div className="border-t border-slate-100" />
                        <section className="rounded-xl bg-accent/5 border border-accent/20 p-4">
                          <div className="flex items-center gap-2">
                            <ClipboardList className="w-4 h-4 text-accent" />
                            <h3 className="font-display font-bold text-accent text-sm">Custom Assessment Included</h3>
                          </div>
                          <p className="text-xs text-slate-600 mt-1.5">
                            This role includes {selectedJob.customQuestions.length} recruiter-set question{selectedJob.customQuestions.length === 1 ? "" : "s"} after the K&E quiz.
                          </p>
                        </section>
                      </>
                    )}

                    <div className="border-t border-slate-100" />

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="w-4 h-4 text-primary" />
                        <h3 className="font-display font-bold text-primary text-lg">About {selectedJob.company}</h3>
                      </div>
                      {selectedJob.companyDescription ? (
                        <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.companyDescription}</p>
                      ) : (
                        <p className="text-sm text-slate-400 italic">No company information provided yet.</p>
                      )}
                    </section>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-white">
              <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                {editing ? (
                  <>
                    <button onClick={cancelEdit} disabled={saving}
                      className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || !editForm.title.trim() || !editForm.description.trim()}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 disabled:opacity-50 transition-all">
                      {saving
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                        : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-400">
                      {needsSignIn
                        ? "Sign in to edit this job posting."
                        : canEditJob
                          ? "Signed in as employer — you can edit this posting."
                          : isEmployer
                            ? "You're signed in as an employer. Switch to an applicant profile to apply."
                            : "Create a free profile to apply — takes less than 5 minutes."}
                    </p>
                    {needsSignIn ? (
                      <button
                        onClick={() => setLocation(`${BASE}/signin?next=/jobs`)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shrink-0">
                        Sign In to Edit
                      </button>
                    ) : canEditJob ? (
                      <button onClick={() => openEdit(selectedJob)}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors shrink-0">
                        <Pencil className="w-4 h-4" /> Edit Posting
                      </button>
                    ) : isEmployer ? null : hasValidToken() ? (
                      <button
                        onClick={() => selectedJob && handleApply(selectedJob)}
                        disabled={applying === selectedJob?.id}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 disabled:opacity-70 transition-all shrink-0">
                        {applying === selectedJob?.id
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> Applying…</>
                          : appliedJobIds.has(selectedJob?.id ?? 0)
                            ? <><CheckCircle2 className="w-4 h-4" /> Applied — Take Assessment</>
                            : <>Apply Now <ArrowUpRight className="w-4 h-4" /></>}
                      </button>
                    ) : (
                      <Link href="/signup"
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors shrink-0">
                        Create Profile to Apply <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
