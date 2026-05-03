import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useParams } from "wouter";
import {
  FileText, Briefcase, MapPin, GraduationCap, CheckCircle, Clock,
  Loader2, AlertCircle, Download, ExternalLink, Copy, Check, FileIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

type CvData = {
  id: number;
  name: string;
  headline: string | null;
  targetIndustry: string | null;
  targetRole: string | null;
  careerLevel: string | null;
  workSetup: string | null;
  skills: string[];
  expertise: string[];
  availabilityDate: string | null;
  cvText: string;
  cvFileName: string | null;
  cvFileMime: string | null;
  hasOriginal: boolean;
};

function SkillBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/8 text-primary border border-primary/15">
      {label}
    </span>
  );
}

export default function CvViewPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [data, setData] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"pdf" | "text">("pdf");

  const isPdf = !!(data?.hasOriginal && data?.cvFileMime === "application/pdf");

  useEffect(() => {
    if (!token) { setError("Invalid link."); setLoading(false); return; }
    fetch(`${BASE}/api/resume/view/${token}`)
      .then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(d.error || "Not found")))
      .then(d => {
        setData(d);
        if (d.hasOriginal && d.cvFileMime === "application/pdf") {
          setActiveTab("pdf");
        } else {
          setActiveTab("text");
        }
      })
      .catch(err => setError(typeof err === "string" ? err : "CV not found or link has expired."))
      .finally(() => setLoading(false));
  }, [token]);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!data) return;
    if (data.hasOriginal && token) {
      const a = document.createElement("a");
      a.href = `${BASE}/api/resume/original/${token}`;
      a.download = data.cvFileName ?? `${data.name.replace(/\s+/g, "_")}_CV`;
      a.click();
    } else {
      const blob = new Blob([data.cvText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.name.replace(/\s+/g, "_")}_CV.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  const availability = data?.availabilityDate
    ? new Date(data.availabilityDate) <= new Date()
      ? "Available now"
      : `Available from ${new Date(data.availabilityDate).toLocaleDateString("en-PH", { month: "long", year: "numeric" })}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Slim branding bar */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display font-extrabold text-lg tracking-tight" style={{ color: "hsl(214 80% 34%)" }}>
              Swift<span style={{ color: "hsl(24 95% 52%)" }}>Match</span>
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:block">· CV Viewer</span>
          </Link>
          {data && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary border border-slate-200 hover:border-primary/40 rounded-lg px-3 py-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: "hsl(214 80% 34%)" }}
              >
                <Download className="w-3.5 h-3.5" />
                {data.hasOriginal ? `Download ${data.cvFileName?.split(".").pop()?.toUpperCase() ?? "Original"}` : "Download TXT"}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="pt-20 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-32 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading CV…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <p className="font-bold text-slate-700 text-lg mb-2">CV not found</p>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <Link href="/jobs" className="text-sm font-semibold text-primary hover:underline">
              Browse open positions →
            </Link>
          </div>
        )}

        {/* CV Content */}
        {!loading && data && (
          <div className="space-y-5">

            {/* Candidate header card */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {data.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-display font-extrabold text-xl text-slate-900 leading-tight">{data.name}</h1>
                  {data.headline && (
                    <p className="text-sm text-slate-500 mt-1">{data.headline}</p>
                  )}

                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                    {data.targetRole && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <GraduationCap className="w-3.5 h-3.5 text-accent shrink-0" /> {data.targetRole}
                      </span>
                    )}
                    {data.targetIndustry && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Briefcase className="w-3.5 h-3.5 text-accent shrink-0" /> {data.targetIndustry}
                      </span>
                    )}
                    {data.careerLevel && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" /> {data.careerLevel}
                      </span>
                    )}
                    {data.workSetup && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-accent shrink-0" /> {data.workSetup}
                      </span>
                    )}
                    {availability && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-accent shrink-0" /> {availability}
                      </span>
                    )}
                  </div>

                  {data.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {data.skills.map(s => <SkillBadge key={s} label={s} />)}
                    </div>
                  )}
                  {data.expertise?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expertise</p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.expertise.map(e => (
                          <span key={e} className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-accent/[0.08] text-accent border border-accent/20">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CV card */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Card header with tabs */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  {isPdf && (
                    <button
                      onClick={() => setActiveTab("pdf")}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all",
                        activeTab === "pdf"
                          ? "bg-white text-primary shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      <FileIcon className="w-3.5 h-3.5" /> PDF View
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("text")}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all",
                      activeTab === "text"
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    <FileText className="w-3.5 h-3.5" /> Text View
                  </button>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {data.cvFileName && (
                    <span className="text-xs text-slate-400 hidden sm:block truncate max-w-[160px]">{data.cvFileName}</span>
                  )}
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {data.cvText.length.toLocaleString()} chars
                  </span>
                </div>
              </div>

              {/* PDF embed */}
              {activeTab === "pdf" && isPdf && token && (
                <div className="w-full" style={{ height: "780px" }}>
                  <iframe
                    src={`${BASE}/api/resume/original/${token}?inline=true`}
                    title="CV PDF"
                    className="w-full h-full border-0"
                  />
                </div>
              )}

              {/* Text view */}
              {activeTab === "text" && (
                <div className="p-6">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">
                    {data.cvText}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-sm text-primary">Powered by SwiftMatch</p>
                <p className="text-xs text-slate-500 mt-0.5">Pre-assessed Filipino talent — Don't search. Get spotted.</p>
              </div>
              <Link
                href="/jobs"
                className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-xl transition-colors"
                style={{ background: "hsl(24 95% 52%)" }}
              >
                Browse Jobs <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
