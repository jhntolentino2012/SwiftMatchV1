import { useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";
import {
  Lock, Crown, ChevronRight, User, Building2,
  FileText, Award, TrendingUp, Calendar, Download,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell, CartesianGrid,
  Legend,
} from "recharts";

/* ══════════════════════════════════════════════════════
   SAMPLE DATA  (shown blurred unless subscribed)
══════════════════════════════════════════════════════ */
const SAMPLE_APPLICANT = {
  name: "Maria Santos",
  email: "m.santos@gmail.com",
  industry: "Technology / IT",
  role: "Software Developer / Engineer",
  level: "Senior / Experienced Specialist",
  avatar: null,
  date: "May 1, 2026",
};

const SAMPLE_SCORES = [
  { key: "ke",   label: "Knowledge & Expertise",    short: "K&E",  score: 78, max: 100, color: "#1e40af" },
  { key: "pw",   label: "Personality & Work Style", short: "P&W",  score: 91, max: 100, color: "#7c3aed" },
  { key: "cf",   label: "Cultural Fit",             short: "C.Fit",score: 69, max: 100, color: "#ea580c" },
  { key: "ct",   label: "Critical Thinking",        short: "C.Think",score: 83, max: 100, color: "#0891b2" },
  { key: "air",  label: "AI Readiness",             short: "AI.R", score: 62, max: 100, color: "#16a34a" },
];
const OVERALL = Math.round(SAMPLE_SCORES.reduce((s, x) => s + x.score, 0) / SAMPLE_SCORES.length);
const RANK = "#3 of 148";
const PERCENTILE = "Top 2%";

const RADAR_DATA = SAMPLE_SCORES.map(s => ({ subject: s.short, score: s.score, fullMark: 100 }));

const SAMPLE_CANDIDATES = [
  { rank: 1,  name: "Maria Santos",     role: "Software Dev",       ke: 78, pw: 91, cf: 69, ct: 83, air: 62,  overall: 77 },
  { rank: 2,  name: "Carlo Reyes",      role: "Software Dev",       ke: 82, pw: 74, cf: 71, ct: 79, air: 70,  overall: 75 },
  { rank: 3,  name: "Andrea Lim",       role: "Software Dev",       ke: 68, pw: 88, cf: 80, ct: 72, air: 65,  overall: 75 },
  { rank: 4,  name: "Jose Mendoza",     role: "Software Dev",       ke: 75, pw: 69, cf: 75, ct: 77, air: 58,  overall: 71 },
  { rank: 5,  name: "Kristine Dela Cruz",role: "Software Dev",      ke: 60, pw: 80, cf: 66, ct: 68, air: 72,  overall: 69 },
];

const EMPLOYER_DIST_DATA = [
  { range: "90–100", count: 4 },
  { range: "80–89",  count: 12 },
  { range: "70–79",  count: 27 },
  { range: "60–69",  count: 38 },
  { range: "50–59",  count: 22 },
  { range: "<50",    count: 9 },
];

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
type Audience = "applicant" | "employer";

function ScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const color =
    score >= 80 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
    score >= 65 ? "text-amber-700 bg-amber-50 border-amber-200" :
                  "text-red-700 bg-red-50 border-red-200";
  return (
    <span className={cn(
      "font-bold border rounded-full tabular-nums",
      color,
      size === "sm"  ? "text-xs px-2 py-0.5" :
      size === "md"  ? "text-sm px-2.5 py-1" :
                       "text-base px-3 py-1.5"
    )}>
      {score}%
    </span>
  );
}

function MiniBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs tabular-nums font-semibold text-slate-600 w-8 text-right">{score}%</span>
    </div>
  );
}

function LockOverlay({ children, locked }: { children: React.ReactNode; locked: boolean }) {
  if (!locked) return <>{children}</>;
  return (
    <div className="relative">
      <div className="select-none pointer-events-none" style={{ filter: "blur(5px)", opacity: 0.55 }}>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="bg-white/95 border border-slate-200 shadow-xl rounded-2xl px-8 py-5 flex flex-col items-center gap-3 text-center max-w-xs">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-accent" />
          </div>
          <p className="font-bold text-primary text-sm">Premium Report</p>
          <p className="text-xs text-slate-500">Subscribe to unlock your full assessment report with scores, charts, and employer insights.</p>
          <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors">
            <Crown className="w-4 h-4" /> Unlock Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   APPLICANT REPORT
══════════════════════════════════════════════════════ */
function ApplicantReport({ locked }: { locked: boolean }) {
  const app = SAMPLE_APPLICANT;

  return (
    <div className="space-y-5">
      {/* Report Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-sm tracking-wide uppercase">SwiftMatch Assessment Report</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {app.date}
            <button className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:border-primary/40 hover:text-primary transition-colors">
              <Download className="w-3 h-3" /> Export PDF
            </button>
          </div>
        </div>

        {/* Applicant Identity */}
        <div className="px-6 py-5 flex items-start gap-5 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-2xl font-bold text-primary">
            {app.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-xl font-display font-bold text-primary">{app.name}</h2>
                <p className="text-sm text-slate-500">{app.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold">
                  <Award className="w-3.5 h-3.5" /> {RANK}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
                  {PERCENTILE}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">📂 {app.industry}</span>
              <span className="flex items-center gap-1">🎯 {app.role}</span>
              <span className="flex items-center gap-1">🏢 {app.level}</span>
            </div>
          </div>
        </div>

        {/* Overall Score Bar */}
        <div className="px-6 py-4 flex items-center gap-4 bg-primary/5 border-b border-slate-100">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-primary uppercase tracking-wide">Overall Match Score</span>
              <span className="text-lg font-display font-bold text-primary">{OVERALL}%</span>
            </div>
            <div className="h-3 bg-white border border-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all"
                style={{ width: `${OVERALL}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <LockOverlay locked={locked}>
        {/* Charts + Scorecard */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Radar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Competency Radar</p>
              <p className="text-sm font-bold text-primary mt-0.5">5-Dimension Assessment Profile</p>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={RADAR_DATA}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  tickCount={5}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#1d4ed8"
                  fill="#1d4ed8"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, "Score"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-1 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Assessment Scorecard</p>
              <p className="text-sm font-bold text-primary mt-0.5">Category Breakdown</p>
            </div>
            <div className="divide-y divide-slate-100">
              {SAMPLE_SCORES.map(cat => (
                <div key={cat.key} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{cat.label}</p>
                    <div className="mt-1.5">
                      <MiniBar score={cat.score} color={cat.color} />
                    </div>
                  </div>
                  <ScoreBadge score={cat.score} size="sm" />
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Overall</span>
              <ScoreBadge score={OVERALL} size="md" />
            </div>
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Score Distribution by Category</p>
            <p className="text-sm font-bold text-primary mt-0.5">Compared to PH Industry Benchmark</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                layout="vertical"
                data={SAMPLE_SCORES.map(s => ({
                  name: s.short,
                  "Your Score": s.score,
                  Benchmark: Math.round(s.score * 0.82 + 5),
                }))}
                margin={{ left: 10, right: 30, top: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} width={40} />
                <Tooltip
                  formatter={(v: any) => [`${v}%`]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Your Score"   fill="#1d4ed8" radius={[0, 4, 4, 0]} maxBarSize={14} />
                <Bar dataKey="Benchmark"   fill="#e2e8f0" radius={[0, 4, 4, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Summary Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Score Summary Table</p>
            <p className="text-sm font-bold text-primary mt-0.5">All Assessment Results — {app.date}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Applicant</th>
                  {SAMPLE_SCORES.map(s => (
                    <th key={s.key} className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{s.short}</th>
                  ))}
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Overall</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Rank</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 bg-primary/3">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {app.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-primary text-sm">{app.name}</p>
                        <p className="text-[10px] text-slate-400">{app.email}</p>
                      </div>
                    </div>
                  </td>
                  {SAMPLE_SCORES.map(s => (
                    <td key={s.key} className="text-center px-3 py-3.5">
                      <ScoreBadge score={s.score} size="sm" />
                    </td>
                  ))}
                  <td className="text-center px-3 py-3.5">
                    <ScoreBadge score={OVERALL} size="sm" />
                  </td>
                  <td className="text-center px-3 py-3.5">
                    <span className="text-xs font-bold text-primary">{RANK}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </LockOverlay>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   EMPLOYER REPORT
══════════════════════════════════════════════════════ */
function EmployerReport({ locked }: { locked: boolean }) {
  return (
    <div className="space-y-5">
      {/* Report Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-sm tracking-wide uppercase">SwiftMatch — Candidate Analytics Report</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            May 1, 2026
            <button className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:border-primary/40 hover:text-primary transition-colors">
              <Download className="w-3 h-3" /> Export PDF
            </button>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center gap-6 border-b border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">148</p>
            <p className="text-xs text-slate-500">Total Applicants</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">77%</p>
            <p className="text-xs text-slate-500">Avg Score</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">12</p>
            <p className="text-xs text-slate-500">Shortlisted</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">5.2d</p>
            <p className="text-xs text-slate-500">Avg Time-to-Match</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">87%</p>
            <p className="text-xs text-slate-500">Retention Forecast</p>
          </div>
        </div>
      </div>

      <LockOverlay locked={locked}>
        {/* Score Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Score Distribution</p>
            <p className="text-sm font-bold text-primary mt-0.5">Candidate Pool — Overall Score Buckets</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={EMPLOYER_DIST_DATA} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip
                  formatter={(v: any) => [`${v} candidates`, "Count"]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {EMPLOYER_DIST_DATA.map((entry, i) => (
                    <Cell key={i} fill={i <= 1 ? "#1d4ed8" : i <= 3 ? "#60a5fa" : "#cbd5e1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Top Candidates</p>
            <p className="text-sm font-bold text-primary mt-0.5">Ranked by Overall Assessment Score</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide w-12">Rank</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Applicant</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">K&E</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">P&W</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">C.Fit</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">C.Think</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">AI.R</th>
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Overall</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Chart</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SAMPLE_CANDIDATES.map((c) => {
                  const scores = [c.ke, c.pw, c.cf, c.ct, c.air];
                  const colors = ["#1d4ed8","#7c3aed","#ea580c","#0891b2","#16a34a"];
                  return (
                    <tr key={c.rank} className={cn("hover:bg-slate-50/50 transition-colors", c.rank === 1 && "bg-blue-50/40")}>
                      <td className="text-center px-4 py-3.5">
                        <span className={cn(
                          "text-sm font-display font-bold",
                          c.rank === 1 ? "text-primary" : c.rank <= 3 ? "text-slate-600" : "text-slate-400"
                        )}>
                          #{c.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            c.rank === 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                          )}>
                            {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                            <p className="text-[10px] text-slate-400">{c.role}</p>
                          </div>
                        </div>
                      </td>
                      {[c.ke, c.pw, c.cf, c.ct, c.air].map((score, i) => (
                        <td key={i} className="text-center px-3 py-3.5">
                          <ScoreBadge score={score} size="sm" />
                        </td>
                      ))}
                      <td className="text-center px-3 py-3.5">
                        <ScoreBadge score={c.overall} size="md" />
                      </td>
                      <td className="px-4 py-3.5 w-32">
                        <div className="space-y-0.5">
                          {scores.map((score, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${score}%`, backgroundColor: colors[i] }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-400">Columns: K&E = Knowledge & Expertise · P&W = Personality & Work Style · C.Fit = Cultural Fit · C.Think = Critical Thinking · AI.R = AI Readiness</p>
          </div>
        </div>

        {/* Category Radar for all candidates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category Analysis</p>
            <p className="text-sm font-bold text-primary mt-0.5">Pool Average vs Top Candidate — Radar Comparison</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart
                cx="50%" cy="50%" outerRadius="72%"
                data={SAMPLE_SCORES.map(s => ({
                  subject: s.short,
                  "Top Candidate": s.score,
                  "Pool Average": Math.round(s.score * 0.85),
                  fullMark: 100,
                }))}
              >
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} tickCount={5} />
                <Radar name="Top Candidate" dataKey="Top Candidate" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Pool Average"  dataKey="Pool Average"  stroke="#ea580c" fill="#ea580c" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 2" />
                <Tooltip formatter={(v: any) => [`${v}%`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </LockOverlay>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function ResultsPage() {
  const [audience, setAudience] = useState<Audience>("applicant");
  const isPremium = localStorage.getItem("sm_subscription") === "active";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-display font-bold text-primary">Assessment Results</h1>
              {!isPremium && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              Formal assessment report with charts, scores, and benchmarks — powered by SwiftMatch.
            </p>
          </div>

          {/* Audience Toggle */}
          <div className="flex gap-1 bg-white border border-border p-1 rounded-xl shadow-sm shrink-0">
            {([
              { id: "applicant", label: "My Report",       icon: User },
              { id: "employer",  label: "Candidate Pool",  icon: Building2 },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAudience(id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all",
                  audience === id ? "bg-primary text-white shadow" : "text-slate-500 hover:text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {audience === "applicant"
          ? <ApplicantReport locked={!isPremium} />
          : <EmployerReport  locked={!isPremium} />
        }

        {/* Free tier footer */}
        {!isPremium && (
          <div className="mt-8 bg-gradient-to-br from-primary to-blue-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-accent" />
                <h3 className="font-display font-bold text-lg">Unlock Your Full Report</h3>
              </div>
              <p className="text-blue-200 text-sm">
                Subscribe to view real scores, radar charts, benchmarks, and your employer visibility data.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-colors text-sm">
                <Crown className="w-4 h-4" /> Subscribe
                <ChevronRight className="w-4 h-4" />
              </button>
              <Link href="/assessment"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20">
                Complete Assessments
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
