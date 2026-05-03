import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Users, FileText, Search, ChevronDown, ChevronUp, AlertCircle,
  CheckCircle, Clock, MapPin, Briefcase, GraduationCap,
  Loader2, Download, ExternalLink, Copy, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

type Applicant = {
  id: number;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  headline?: string | null;
  email: string;
  targetIndustry?: string | null;
  targetRole?: string | null;
  careerLevel?: string | null;
  workSetup?: string | null;
  skills: string[];
  expectedSalary?: string | null;
  availabilityDate: string;
  cvText?: string | null;
  cvShareToken?: string | null;
  cvFileName?: string | null;
  status: string;
  createdAt: string;
};

function isEmployerSession(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("sm_employer_profile");
}

function getToken(): string | null {
  return localStorage.getItem("sm_auth_token");
}

function SkillBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-primary/8 text-primary border border-primary/15">
      {label}
    </span>
  );
}

type CvPanelData = { cvText: string | null; cvFileName: string | null; };

function CvPanel({ applicantId, name, cvShareToken }: { applicantId: number; name: string; cvShareToken?: string | null }) {
  const [state, setState] = useState<CvPanelData | "loading" | "error">("loading");

  useEffect(() => {
    const token = getToken();
    if (!token) { setState("error"); return; }
    fetch(`${BASE}/api/resume/cv/${applicantId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setState({ cvText: data.cvText ?? null, cvFileName: data.cvFileName ?? null }))
      .catch(() => setState("error"));
  }, [applicantId]);

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center py-10 gap-2 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading CV…
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex items-center gap-2 py-6 text-red-500 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" /> Could not load CV. Please try again.
      </div>
    );
  }

  if (!state.cvText) {
    return (
      <div className="flex items-center gap-3 py-6 text-slate-400 text-sm">
        <Clock className="w-4 h-4 shrink-0" /> {name} hasn't uploaded a CV yet.
      </div>
    );
  }

  const { cvText, cvFileName } = state;
  const ext = cvFileName?.split(".").pop()?.toUpperCase();

  function downloadOriginal() {
    if (!cvShareToken) return;
    const a = document.createElement("a");
    a.href = `${BASE}/api/resume/original/${cvShareToken}`;
    a.download = cvFileName ?? `${name.replace(/\s+/g, "_")}_CV`;
    a.click();
  }

  function downloadTxt() {
    const blob = new Blob([cvText!], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_")}_CV.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {cvFileName && <span className="text-slate-500 normal-case font-medium mr-2">{cvFileName}</span>}
          {cvText.length.toLocaleString()} chars extracted
        </p>
        <div className="flex items-center gap-2">
          {cvShareToken && (
            <button
              onClick={downloadOriginal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ background: "hsl(214 80% 34%)" }}
            >
              <Download className="w-3.5 h-3.5" /> Download {ext ?? "Original"}
            </button>
          )}
          <button
            onClick={downloadTxt}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary border border-slate-200 hover:border-primary/40 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> TXT
          </button>
        </div>
      </div>
      <pre className="whitespace-pre-wrap text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-96 overflow-y-auto">
        {cvText}
      </pre>
    </div>
  );
}

function CandidateCard({ applicant }: { applicant: Applicant }) {
  const [expanded, setExpanded] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const displayName = [applicant.firstName, applicant.lastName].filter(Boolean).join(" ");

  function copyLink() {
    if (!applicant.cvShareToken) return;
    const url = `${window.location.origin}${BASE}/cv/${applicant.cvShareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  }
  const availability = applicant.availabilityDate
    ? new Date(applicant.availabilityDate) <= new Date()
      ? "Available now"
      : `Available ${new Date(applicant.availabilityDate).toLocaleDateString("en-PH", { month: "short", year: "numeric" })}`
    : null;

  return (
    <div className={cn(
      "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all",
      expanded ? "border-primary/30 shadow-primary/10" : "border-border hover:border-slate-300"
    )}>
      {/* Card header */}
      <div
        className="flex items-start gap-4 p-5 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base shrink-0">
          {applicant.firstName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-slate-800 text-sm">{displayName}</p>
              {applicant.headline && (
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{applicant.headline}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full",
                applicant.cvText ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              )}>
                {applicant.cvText ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {applicant.cvText ? "CV Available" : "No CV"}
              </span>
              {applicant.cvShareToken && (
                <Link
                  href={`/cv/${applicant.cvShareToken}`}
                  onClick={e => e.stopPropagation()}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-full px-2 py-0.5 transition-colors"
                >
                  <ExternalLink className="w-2.5 h-2.5" /> View CV
                </Link>
              )}
              {expanded
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {applicant.targetIndustry && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Briefcase className="w-3 h-3" /> {applicant.targetIndustry}
              </span>
            )}
            {applicant.targetRole && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <GraduationCap className="w-3 h-3" /> {applicant.targetRole}
              </span>
            )}
            {applicant.workSetup && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="w-3 h-3" /> {applicant.workSetup}
              </span>
            )}
            {availability && (
              <span className="text-[11px] text-slate-400">{availability}</span>
            )}
          </div>

          {applicant.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {applicant.skills.slice(0, 5).map(s => <SkillBadge key={s} label={s} />)}
            </div>
          )}
        </div>
      </div>

      {/* Expanded CV panel */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          <h4 className="font-display font-bold text-xs text-primary uppercase tracking-wide flex items-center gap-1.5 mb-3">
            <FileText className="w-3.5 h-3.5 text-accent" /> CV / Resume
          </h4>
          <CvPanel applicantId={applicant.id} name={displayName} cvShareToken={applicant.cvShareToken} />
        </div>
      )}
    </div>
  );
}

export default function CandidatesPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const [candidates, setCandidates] = useState<Applicant[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterCvOnly, setFilterCvOnly] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState("");
  const [isEmployer, setIsEmployer] = useState(false);

  useEffect(() => {
    setIsEmployer(isEmployerSession());
  }, []);

  useEffect(() => {
    if (!loading && !user) { setLocation("/signin?next=/candidates"); return; }
    if (!user) return;
    const token = getToken();
    if (!token) { setFetchLoading(false); return; }
    fetch(`${BASE}/api/applicants`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setCandidates(data))
      .catch(() => setFetchError("Could not load candidates. Please try again."))
      .finally(() => setFetchLoading(false));
  }, [user, loading]);

  const industries = Array.from(new Set(candidates.map(c => c.targetIndustry).filter(Boolean) as string[])).sort();

  const filtered = candidates.filter(c => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchQuery = !query || fullName.includes(query.toLowerCase())
      || (c.headline ?? "").toLowerCase().includes(query.toLowerCase())
      || c.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))
      || (c.targetRole ?? "").toLowerCase().includes(query.toLowerCase());
    const matchCv = !filterCvOnly || !!c.cvText;
    const matchIndustry = !filterIndustry || c.targetIndustry === filterIndustry;
    return matchQuery && matchCv && matchIndustry;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-primary leading-tight">Candidate Pool</h1>
              <p className="text-xs text-slate-400 mt-0.5">Pre-assessed Filipino talent — click any card to view their CV</p>
            </div>
          </div>
        </div>

        {!isEmployer && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
            <strong>Employer access only.</strong> Sign in with an employer account to view full candidate profiles and CVs.
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, role, skill…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>
          <select
            value={filterIndustry}
            onChange={e => setFilterIndustry(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-white"
          >
            <option value="">All industries</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer shrink-0 px-1">
            <input
              type="checkbox"
              checked={filterCvOnly}
              onChange={e => setFilterCvOnly(e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary/30"
            />
            CV uploaded only
          </label>
        </div>

        {/* Stats row */}
        {!fetchLoading && !fetchError && (
          <div className="flex items-center gap-4 mb-4 px-1">
            <p className="text-xs text-slate-400">
              Showing <strong className="text-slate-600">{filtered.length}</strong> of <strong className="text-slate-600">{candidates.length}</strong> candidates
            </p>
            <p className="text-xs text-slate-400">
              <strong className="text-green-600">{candidates.filter(c => !!c.cvText).length}</strong> with CV uploaded
            </p>
          </div>
        )}

        {/* States */}
        {fetchLoading && (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading candidates…
          </div>
        )}

        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {fetchError}
          </div>
        )}

        {!fetchLoading && !fetchError && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-600 text-sm">No candidates match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting the search or clearing the industry filter.</p>
          </div>
        )}

        {/* Candidate cards */}
        <div className="space-y-3">
          {filtered.map(a => <CandidateCard key={a.id} applicant={a} />)}
        </div>
      </div>
    </div>
  );
}
