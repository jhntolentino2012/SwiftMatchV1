import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  User, Briefcase, GraduationCap, Users, Share2, Settings,
  Edit2, Building2, Phone, Mail, Globe, FileText, ListChecks,
  CheckCircle, Clock, ChevronRight, Save, ExternalLink, Linkedin, Facebook,
  Camera, Pencil, X, Check, Loader2, BadgeCheck, MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
const EMPLOYER_PROFILE_KEY = "sm_employer_profile";


type ApplicantProfile = {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  suffix?: string | null;
  pronoun?: string | null;
  nickname?: string | null;
  permanentAddress: string;
  currentAddress: string;
  phoneAreaCode: string;
  phoneNumber: string;
  homePhone?: string | null;
  email: string;
  phone: string;
  skills: string[];
  employmentHistory: any[];
  certificates: any[];
  references: any[];
  facebookUrl?: string | null;
  linkedinUrl?: string | null;
  targetIndustry?: string | null;
  targetRole?: string | null;
  careerLevel?: string | null;
  expectedSalary?: string | null;
  salaryNegotiable: boolean;
  availabilityDate: string;
  headline?: string | null;
  cvText?: string | null;
  status: string;
  createdAt: string;
};

type EmployerProfile = {
  companyName: string;
  industry: string;
  companySize: string;
  location: string;
  website: string;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
};

const DEFAULT_EMPLOYER: EmployerProfile = {
  companyName: "",
  industry: "",
  companySize: "",
  location: "",
  website: "",
  description: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-slate-100 last:border-0">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider sm:w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700 break-all min-w-0">{value}</span>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, className }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-2xl border border-border shadow-sm p-6", className)}>
      <h3 className="font-display font-bold text-sm text-primary flex items-center gap-2 mb-4 uppercase tracking-wide">
        <Icon className="w-4 h-4 text-accent" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldInput({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-36 bg-slate-200 rounded-2xl" />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="h-48 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-40 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

const PROFILE_PIC_KEY = (uid: number | string) => `sm_profile_pic_${uid}`;

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"applicant" | "employer">("applicant");

  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ── Profile picture ──────────────────────────────────
  const [picSrc, setPicSrc] = useState<string | null>(null);
  const picInputRef = useRef<HTMLInputElement>(null);

  // ── Inline name edit ─────────────────────────────────
  const [editingName, setEditingName] = useState(false);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  // ── Inline headline edit ─────────────────────────────
  const [editingHeadline, setEditingHeadline] = useState(false);
  const [editHeadlineText, setEditHeadlineText] = useState("");
  const [headlineSaving, setHeadlineSaving] = useState(false);

  // ── Inline tag (career) edit ──────────────────────────
  const [editingTags, setEditingTags] = useState(false);
  const [editIndustry, setEditIndustry] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [tagsSaving, setTagsSaving] = useState(false);

  const [employer, setEmployer] = useState<EmployerProfile>(() => {
    try {
      const stored = localStorage.getItem(EMPLOYER_PROFILE_KEY);
      return stored ? { ...DEFAULT_EMPLOYER, ...JSON.parse(stored) } : DEFAULT_EMPLOYER;
    } catch {
      return DEFAULT_EMPLOYER;
    }
  });
  const [employerSaved, setEmployerSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/signin");
      return;
    }
    if (!user) return;

    // Load saved profile picture
    const saved = localStorage.getItem(PROFILE_PIC_KEY(user.id));
    if (saved) setPicSrc(saved);

    const token = localStorage.getItem("sm_auth_token");
    if (!token) {
      setProfileLoading(false);
      return;
    }

    fetch(`${BASE}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: ApplicantProfile) => setProfile(data))
      .catch((status) => {
        if (status !== 404) setProfileError("Could not load profile data.");
      })
      .finally(() => setProfileLoading(false));
  }, [user, loading]);

  function handlePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPicSrc(dataUrl);
      localStorage.setItem(PROFILE_PIC_KEY(user.id), dataUrl);
    };
    reader.readAsDataURL(file);
    // reset so same file can be re-selected
    e.target.value = "";
  }

  function startEditName() {
    setEditFirst(profile?.firstName ?? "");
    setEditLast(profile?.lastName ?? "");
    setEditingName(true);
  }

  function cancelEditName() {
    setEditingName(false);
  }

  async function saveEditName() {
    if (!editFirst.trim() || !editLast.trim()) return;
    const token = localStorage.getItem("sm_auth_token");
    if (!token) return;
    setNameSaving(true);
    try {
      const res = await fetch(`${BASE}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: editFirst.trim(), lastName: editLast.trim() }),
      });
      if (res.ok) {
        const updated: ApplicantProfile = await res.json();
        setProfile(updated);
        setEditingName(false);
      }
    } finally {
      setNameSaving(false);
    }
  }

  function startEditHeadline() {
    setEditHeadlineText(profile?.headline ?? "");
    setEditingHeadline(true);
  }

  async function saveEditHeadline() {
    const token = localStorage.getItem("sm_auth_token");
    if (!token) return;
    setHeadlineSaving(true);
    try {
      const res = await fetch(`${BASE}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ headline: editHeadlineText.trim() || null }),
      });
      if (res.ok) {
        const updated: ApplicantProfile = await res.json();
        setProfile(updated);
        setEditingHeadline(false);
      }
    } finally {
      setHeadlineSaving(false);
    }
  }

  function startEditTags() {
    setEditIndustry(profile?.targetIndustry ?? "");
    setEditRole(profile?.targetRole ?? "");
    setEditLevel(profile?.careerLevel ?? "");
    setEditingTags(true);
  }

  async function saveEditTags() {
    const token = localStorage.getItem("sm_auth_token");
    if (!token) return;
    setTagsSaving(true);
    try {
      const res = await fetch(`${BASE}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          targetIndustry: editIndustry || null,
          targetRole: editRole || null,
          careerLevel: editLevel || null,
        }),
      });
      if (res.ok) {
        const updated: ApplicantProfile = await res.json();
        setProfile(updated);
        setEditingTags(false);
      }
    } finally {
      setTagsSaving(false);
    }
  }

  function saveEmployer() {
    localStorage.setItem(EMPLOYER_PROFILE_KEY, JSON.stringify(employer));
    setEmployerSaved(true);
    setTimeout(() => setEmployerSaved(false), 2500);
  }

  const displayName = profile
    ? [
        profile.firstName,
        profile.nickname ? `(${profile.nickname})` : null,
        profile.middleName ? profile.middleName.charAt(0) + "." : null,
        profile.lastName,
        profile.suffix,
      ]
        .filter(Boolean)
        .join(" ")
    : (user?.email?.split("@")[0] ?? "—");

  const initial = (profile?.firstName ?? user?.email ?? "?").charAt(0).toUpperCase();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <LoadingSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* ── Hero header ───────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/[0.03] rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-48 h-48 bg-accent/[0.04] rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            {/* ── Avatar with upload ── */}
            <div className="relative shrink-0 group/avatar">
              <input
                ref={picInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePicChange}
              />
              <button
                onClick={() => picInputRef.current?.click()}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title="Upload profile photo"
              >
                {picSrc ? (
                  <img src={picSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white"
                    style={{ background: "linear-gradient(135deg, hsl(214 80% 34%), hsl(214 80% 55%))" }}
                  >
                    {initial}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>

            <div className="flex-1 min-w-0">
              {/* ── Editable name headline ── */}
              {editingName ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    autoFocus
                    value={editFirst}
                    onChange={e => setEditFirst(e.target.value)}
                    placeholder="First name"
                    className="font-display font-bold text-xl text-primary bg-slate-50 border border-primary/30 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 w-32"
                    onKeyDown={e => { if (e.key === "Enter") saveEditName(); if (e.key === "Escape") cancelEditName(); }}
                  />
                  <input
                    value={editLast}
                    onChange={e => setEditLast(e.target.value)}
                    placeholder="Last name"
                    className="font-display font-bold text-xl text-primary bg-slate-50 border border-primary/30 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 w-32"
                    onKeyDown={e => { if (e.key === "Enter") saveEditName(); if (e.key === "Escape") cancelEditName(); }}
                  />
                  <button
                    onClick={saveEditName}
                    disabled={nameSaving || !editFirst.trim() || !editLast.trim()}
                    className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {nameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={cancelEditName}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap group/name">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">{displayName}</h1>
                  <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
                  {profile && (
                    <button
                      onClick={startEditName}
                      className="opacity-0 group-hover/name:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary"
                      title="Edit name"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* ── Professional headline ── */}
              {editingHeadline ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    autoFocus
                    value={editHeadlineText}
                    onChange={e => setEditHeadlineText(e.target.value)}
                    placeholder="Seasoned Operations Leader | Key achievement..."
                    className="flex-1 text-sm text-slate-700 bg-slate-50 border border-primary/30 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    onKeyDown={e => { if (e.key === "Enter") saveEditHeadline(); if (e.key === "Escape") setEditingHeadline(false); }}
                  />
                  <button onClick={saveEditHeadline} disabled={headlineSaving}
                    className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0">
                    {headlineSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setEditingHeadline(false)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-1.5 mt-2 group/headline">
                  <p className="text-sm text-slate-600 leading-snug">
                    {profile?.headline ?? (
                      <span className="text-slate-300 italic">Add a professional headline...</span>
                    )}
                  </p>
                  {profile && (
                    <button onClick={startEditHeadline}
                      className="opacity-0 group-hover/headline:opacity-100 transition-opacity p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-primary shrink-0 mt-0.5"
                      title="Edit headline">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* ── Current company · education ── */}
              {profile && (() => {
                const emp = profile.employmentHistory as any[];
                const cert = profile.certificates as any[];
                const company = emp.length > 0 ? (emp[emp.length - 1]?.company ?? null) : null;
                const edu = cert.length > 0 ? (cert[0]?.issuer ?? cert[0]?.name ?? null) : null;
                const line = [company, edu].filter(Boolean).join(" · ");
                return line ? (
                  <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {line}
                  </p>
                ) : null;
              })()}

              {/* ── Location ── */}
              {profile?.currentAddress && profile.currentAddress !== "N/A" && (
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  {profile.currentAddress}
                </p>
              )}

              {/* ── Career tags — editable ── */}
              {editingTags ? (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="grid sm:grid-cols-3 gap-2">
                    {/* Industry */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Industry</label>
                      <input
                        type="text"
                        value={editIndustry}
                        onChange={e => setEditIndustry(e.target.value)}
                        placeholder="e.g. BPO / Call Center"
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        onKeyDown={e => { if (e.key === "Escape") setEditingTags(false); }}
                      />
                    </div>
                    {/* Role */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Role</label>
                      <input
                        type="text"
                        value={editRole}
                        onChange={e => setEditRole(e.target.value)}
                        placeholder="e.g. Operations Manager"
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        onKeyDown={e => { if (e.key === "Escape") setEditingTags(false); }}
                      />
                    </div>
                    {/* Career level */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Career Level</label>
                      <input
                        type="text"
                        value={editLevel}
                        onChange={e => setEditLevel(e.target.value)}
                        placeholder="e.g. Senior / Experienced"
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        onKeyDown={e => { if (e.key === "Escape") setEditingTags(false); }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={saveEditTags}
                      disabled={tagsSaving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {tagsSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTags(false)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2 mt-3 group/tags">
                  {profile?.targetRole && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full">
                      <Briefcase className="w-3 h-3" /> {profile.targetRole}
                    </span>
                  )}
                  {profile?.targetIndustry && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/[0.08] text-primary text-xs font-semibold rounded-full">
                      {profile.targetIndustry}
                    </span>
                  )}
                  {profile?.careerLevel && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                      {profile.careerLevel}
                    </span>
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full",
                      profile?.cvText ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {profile?.cvText ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {profile?.cvText ? "CV Uploaded" : "No CV Yet"}
                  </span>
                  {profile && (
                    <button
                      onClick={startEditTags}
                      className="opacity-0 group-hover/tags:opacity-100 transition-opacity inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-400 hover:text-primary hover:bg-slate-200 text-xs font-semibold rounded-full"
                      title="Edit career details"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            <Link
              href="/apply"
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all shadow-md"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* ── Tab switcher ──────────────────────────────── */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
          {(["applicant", "employer"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === t
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-primary"
              )}
            >
              {t === "applicant" ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
              {t === "applicant" ? "Applicant Profile" : "Employer Profile"}
            </button>
          ))}
        </div>

        {/* ── APPLICANT TAB ─────────────────────────────── */}
        {tab === "applicant" && (
          <>
            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-sm">
                {profileError} —{" "}
                <Link href="/apply" className="underline font-semibold">
                  Create your applicant profile
                </Link>{" "}
                to get started.
              </div>
            )}

            {!profileError && !profile && (
              <div className="bg-white rounded-2xl border border-border shadow-sm p-12 text-center">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <User className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="font-display font-bold text-primary text-xl mb-2">
                  No applicant profile yet
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-7">
                  Complete the application flow to create your profile and start getting matched with Philippine employers.
                </p>
                <Link
                  href="/apply"
                  className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: "linear-gradient(135deg, hsl(24 95% 52%), hsl(24 95% 44%))" }}
                >
                  Create Applicant Profile
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {profile && (
              <div className="grid lg:grid-cols-3 gap-5">

                {/* ── Left column ── */}
                <div className="space-y-5">

                  <SectionCard title="Personal Information" icon={User}>
                    <InfoRow
                      label="Full Name"
                      value={[
                        profile.firstName,
                        profile.middleName,
                        profile.lastName,
                        profile.suffix,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                    <InfoRow label="Nickname" value={profile.nickname} />
                    <InfoRow label="Pronoun" value={profile.pronoun} />
                    <InfoRow label="Availability" value={profile.availabilityDate} />
                  </SectionCard>

                  <SectionCard title="Contact Details" icon={Phone}>
                    <InfoRow
                      label="Mobile"
                      value={`+${profile.phoneAreaCode} ${profile.phoneNumber}`}
                    />
                    <InfoRow label="Home Phone" value={profile.homePhone} />
                    <InfoRow label="Email" value={profile.email} />
                    <InfoRow
                      label="Current Address"
                      value={profile.currentAddress}
                    />
                    <InfoRow
                      label="Permanent Address"
                      value={
                        profile.permanentAddress !== profile.currentAddress
                          ? profile.permanentAddress
                          : "Same as current"
                      }
                    />
                  </SectionCard>

                  <SectionCard title="Social Links" icon={Share2}>
                    {profile.linkedinUrl ? (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors py-1.5"
                      >
                        <Linkedin className="w-4 h-4 shrink-0" />
                        LinkedIn Profile
                        <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                      </a>
                    ) : (
                      <p className="text-sm text-slate-300 italic py-1">No LinkedIn added</p>
                    )}
                    {profile.facebookUrl && (
                      <a
                        href={profile.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors py-1.5 border-t border-slate-100 mt-1"
                      >
                        <Facebook className="w-4 h-4 shrink-0" />
                        Facebook Profile
                        <ExternalLink className="w-3 h-3 ml-auto text-slate-400" />
                      </a>
                    )}
                  </SectionCard>
                </div>

                {/* ── Right column (wider) ── */}
                <div className="lg:col-span-2 space-y-5">

                  <SectionCard title="Career Preferences" icon={Settings}>
                    <div className="grid sm:grid-cols-2">
                      <InfoRow label="Target Industry" value={profile.targetIndustry} />
                      <InfoRow label="Target Role" value={profile.targetRole} />
                      <InfoRow label="Career Level" value={profile.careerLevel} />
                      <InfoRow
                        label="Expected Salary"
                        value={
                          profile.expectedSalary
                            ? `${profile.expectedSalary}${profile.salaryNegotiable ? " (negotiable)" : ""}`
                            : null
                        }
                      />
                    </div>
                  </SectionCard>

                  {profile.skills.length > 0 && (
                    <SectionCard title="Skills" icon={ListChecks}>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-primary/[0.07] text-primary text-xs font-semibold rounded-full border border-primary/15"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {profile.employmentHistory.length > 0 && (
                    <SectionCard title="Employment History" icon={Briefcase}>
                      <div className="space-y-4">
                        {(profile.employmentHistory as any[]).map((job, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-accent mt-1.5 shrink-0" />
                              {i < profile.employmentHistory.length - 1 && (
                                <div className="w-px flex-1 bg-slate-100 mt-1" />
                              )}
                            </div>
                            <div className="pb-4 last:pb-0">
                              <p className="font-semibold text-sm text-slate-800">
                                {job.title ?? job.position ?? "Role"}
                              </p>
                              <p className="text-sm text-slate-500">{job.company}</p>
                              {(job.startDate || job.endDate) && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {job.startDate} — {job.endDate || "Present"}
                                </p>
                              )}
                              {job.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {job.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {profile.certificates.length > 0 && (
                    <SectionCard title="Certificates & Training" icon={GraduationCap}>
                      <div className="space-y-3">
                        {(profile.certificates as any[]).map((cert, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                              <GraduationCap className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-slate-800">
                                {cert.name ?? cert.title}
                              </p>
                              {cert.issuer && (
                                <p className="text-xs text-slate-500">{cert.issuer}</p>
                              )}
                              {cert.date && (
                                <p className="text-xs text-slate-400">{cert.date}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {profile.references.length > 0 && (
                    <SectionCard title="References" icon={Users}>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(profile.references as any[]).map((ref, i) => (
                          <div key={i} className="bg-slate-50 rounded-xl p-4">
                            <p className="font-semibold text-sm text-slate-800">{ref.name}</p>
                            {ref.position && (
                              <p className="text-xs font-medium text-accent mt-0.5">{ref.position}</p>
                            )}
                            {ref.company && (
                              <p className="text-xs text-slate-500">{ref.company}</p>
                            )}
                            {ref.email && (
                              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {ref.email}
                              </p>
                            )}
                            {ref.phone && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" /> {ref.phone}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* CV Status */}
                  <SectionCard title="CV / Resume" icon={FileText}>
                    {profile.cvText ? (
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">
                            CV uploaded and indexed
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {profile.cvText.length.toLocaleString()} characters extracted — ready for AI match analysis
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-800">No CV uploaded yet</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Upload your CV on the Results page to unlock AI match analysis
                          </p>
                        </div>
                        <Link
                          href="/results"
                          className="shrink-0 text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                        >
                          Go to Results <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </SectionCard>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── EMPLOYER TAB ──────────────────────────────── */}
        {tab === "employer" && (
          <div className="max-w-2xl space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 leading-relaxed">
              <strong>Draft Profile</strong> — Full employer accounts are coming soon. Fill in your company details below; they are saved on this device until the employer portal launches.
            </div>

            <SectionCard title="Company Information" icon={Building2}>
              <div className="space-y-4">
                <FieldInput
                  label="Company Name *"
                  value={employer.companyName}
                  onChange={v => setEmployer(e => ({ ...e, companyName: v }))}
                  placeholder="e.g. Nexus Contact Solutions"
                />
                <FieldInput
                  label="Industry"
                  value={employer.industry}
                  onChange={v => setEmployer(e => ({ ...e, industry: v }))}
                  placeholder="e.g. BPO / Call Center"
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FieldInput
                    label="Company Size"
                    value={employer.companySize}
                    onChange={v => setEmployer(e => ({ ...e, companySize: v }))}
                    placeholder="e.g. 500–1,000 employees"
                  />
                  <FieldInput
                    label="Location"
                    value={employer.location}
                    onChange={v => setEmployer(e => ({ ...e, location: v }))}
                    placeholder="e.g. Quezon City, Metro Manila"
                  />
                </div>
                <FieldInput
                  label="Website"
                  value={employer.website}
                  onChange={v => setEmployer(e => ({ ...e, website: v }))}
                  placeholder="https://yourcompany.com"
                  type="url"
                />
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    About the Company
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition"
                    rows={4}
                    placeholder="Briefly describe your company, culture, and what makes it a great place to work..."
                    value={employer.description}
                    onChange={e =>
                      setEmployer(prev => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Contact Person" icon={User}>
              <div className="space-y-4">
                <FieldInput
                  label="Full Name"
                  value={employer.contactPerson}
                  onChange={v => setEmployer(e => ({ ...e, contactPerson: v }))}
                  placeholder="e.g. Maria Santos"
                />
                <FieldInput
                  label="Work Email"
                  value={employer.contactEmail}
                  onChange={v => setEmployer(e => ({ ...e, contactEmail: v }))}
                  placeholder="hiring@yourcompany.com"
                  type="email"
                />
                <FieldInput
                  label="Phone Number"
                  value={employer.contactPhone}
                  onChange={v => setEmployer(e => ({ ...e, contactPhone: v }))}
                  placeholder="+63 917 000 0000"
                />
              </div>
            </SectionCard>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={saveEmployer}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-sm rounded-xl transition-all shadow-md",
                  employerSaved
                    ? "bg-green-600 text-white"
                    : "bg-primary text-white hover:bg-primary/90 active:scale-95"
                )}
              >
                {employerSaved ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {employerSaved ? "Saved!" : "Save Draft"}
              </button>
              <Link
                href="/employer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border bg-white text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
              >
                <Globe className="w-4 h-4" />
                Employer Portal
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
