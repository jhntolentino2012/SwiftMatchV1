import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Briefcase, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Comprehensive PH data ─── */
export const PH_JOB_DIRECTORY: { industry: string; roles: string[]; locations: string[] }[] = [
  { industry: "Technology / IT", roles: ["Software Engineer", "Full Stack Developer", "Data Engineer", "DevOps Engineer", "QA Engineer", "Product Manager", "Systems Analyst", "IT Support Specialist", "Cybersecurity Analyst", "AI/ML Engineer"], locations: ["Makati City", "BGC, Taguig", "Ortigas, Pasig", "Quezon City", "Cebu City", "IT Park, Cebu", "Clark, Pampanga", "Mandaluyong", "Remote / Anywhere in Philippines"] },
  { industry: "BPO / Call Center", roles: ["Customer Service Representative", "Technical Support Agent", "Team Leader", "Operations Manager", "Quality Analyst", "Trainer", "Workforce Analyst", "Chat Support Specialist"], locations: ["Makati City", "BGC, Taguig", "Quezon City", "Ortigas, Pasig", "Mandaluyong", "Alabang, Muntinlupa", "Cebu City", "Davao City", "Clark, Pampanga", "Iloilo City"] },
  { industry: "Healthcare / Medical", roles: ["Registered Nurse", "Medical Technologist", "Physical Therapist", "Pharmacist", "Radiologist", "General Physician", "Hospital Administrator", "Dental Assistant", "Medical Coder"], locations: ["Quezon City", "Makati City", "Manila", "Pasig City", "Cebu City", "Davao City", "Cagayan de Oro", "Iloilo City"] },
  { industry: "Finance / Banking", roles: ["Financial Analyst", "Credit Analyst", "Accountant", "Auditor", "Investment Analyst", "Treasury Officer", "Risk Manager", "Branch Manager", "Relationship Manager"], locations: ["Makati City", "BGC, Taguig", "Ortigas, Pasig", "Quezon City", "Manila", "Cebu City"] },
  { industry: "Marketing / Advertising", roles: ["Digital Marketing Specialist", "Social Media Manager", "SEO Specialist", "Brand Manager", "Content Strategist", "Media Planner", "Copywriter", "Marketing Analyst"], locations: ["Makati City", "BGC, Taguig", "Quezon City", "Mandaluyong", "Cebu City", "Remote / Anywhere in Philippines"] },
  { industry: "Real Estate & Construction", roles: ["Real Estate Agent", "Property Manager", "Civil Engineer", "Structural Engineer", "Architect", "Site Supervisor", "Quantity Surveyor"], locations: ["Makati City", "BGC, Taguig", "Quezon City", "Parañaque", "Cavite", "Laguna", "Cebu City", "Davao City", "Clark, Pampanga"] },
  { industry: "Manufacturing & Engineering", roles: ["Production Supervisor", "Quality Control Engineer", "Mechanical Engineer", "Electrical Engineer", "Industrial Engineer", "Safety Officer", "Maintenance Technician"], locations: ["Laguna", "Cavite", "Clark, Pampanga", "Calamba, Laguna", "Batangas", "Cagayan de Oro", "Davao City", "Cebu City"] },
  { industry: "Retail & E-commerce", roles: ["Store Manager", "Retail Associate", "E-commerce Manager", "Inventory Analyst", "Category Manager", "Visual Merchandiser", "Customer Experience Lead"], locations: ["Makati City", "Mandaluyong", "Quezon City", "BGC, Taguig", "Pasay", "Cebu City", "Davao City", "Remote / Anywhere in Philippines"] },
  { industry: "Education & Training", roles: ["Teacher", "Academic Coordinator", "Training Specialist", "Curriculum Developer", "School Principal", "Guidance Counselor", "E-learning Developer", "ESL Tutor"], locations: ["Quezon City", "Mandaluyong", "Manila", "Makati City", "Cebu City", "Davao City", "Iloilo City", "Remote / Anywhere in Philippines"] },
  { industry: "Hospitality & Tourism", roles: ["Hotel Manager", "Front Desk Officer", "Event Coordinator", "Food & Beverage Manager", "Tour Guide", "Resort Operations Staff", "Revenue Manager", "Concierge"], locations: ["Pasay", "Parañaque", "Cebu City", "Davao City", "Boracay, Aklan", "Palawan", "BGC, Taguig", "Makati City"] },
  { industry: "Food & Beverage", roles: ["Executive Chef", "Restaurant Manager", "Barista", "Kitchen Supervisor", "Food Safety Officer", "Purchasing Officer", "Pastry Chef"], locations: ["Makati City", "Quezon City", "BGC, Taguig", "Cebu City", "Davao City", "Ortigas, Pasig", "Mandaluyong"] },
  { industry: "Creative Arts & Design", roles: ["Graphic Designer", "UI/UX Designer", "Motion Designer", "Illustrator", "Video Editor", "Creative Director", "Art Director", "3D Artist"], locations: ["Makati City", "BGC, Taguig", "Quezon City", "Cebu City", "Remote / Anywhere in Philippines"] },
  { industry: "Logistics & Transportation", roles: ["Logistics Coordinator", "Supply Chain Manager", "Warehouse Supervisor", "Freight Forwarder", "Fleet Manager", "Customs Specialist", "Procurement Officer"], locations: ["Pasay", "Parañaque", "Manila", "Cebu City", "Davao City", "Clark, Pampanga", "Laguna", "Batangas"] },
  { industry: "Telecommunications", roles: ["Network Engineer", "RF Engineer", "Telecom Project Manager", "Technical Account Manager", "Field Service Technician", "Sales Engineer"], locations: ["Makati City", "BGC, Taguig", "Quezon City", "Ortigas, Pasig", "Cebu City", "Davao City"] },
  { industry: "Media & Entertainment", roles: ["Broadcast Journalist", "Content Creator", "Video Producer", "Social Media Content Writer", "Radio DJ", "Film Production Assistant", "Scriptwriter"], locations: ["Quezon City", "Makati City", "Mandaluyong", "Manila", "Cebu City"] },
  { industry: "Human Resources", roles: ["HR Manager", "Recruiter", "Talent Acquisition Specialist", "Compensation & Benefits Analyst", "HRIS Specialist", "HR Business Partner"], locations: ["Makati City", "BGC, Taguig", "Ortigas, Pasig", "Quezon City", "Cebu City", "Remote / Anywhere in Philippines"] },
  { industry: "Government & Public Sector", roles: ["Public Health Officer", "Social Worker", "Government Accountant", "Policy Analyst", "LGU Staff", "Public Information Officer"], locations: ["Manila", "Quezon City", "Pasig City", "Cebu City", "Davao City", "Iloilo City", "Cagayan de Oro"] },
  { industry: "Agriculture & Environment", roles: ["Agronomist", "Farm Manager", "Agricultural Engineer", "Environmental Scientist", "Food Technologist", "Veterinarian"], locations: ["Davao City", "Laguna", "Clark, Pampanga", "Cagayan de Oro", "Bukidnon", "Iloilo City", "Batangas"] },
  { industry: "Legal & Compliance", roles: ["Corporate Lawyer", "Compliance Officer", "Legal Assistant", "Paralegal", "Data Privacy Officer", "Contract Specialist"], locations: ["Makati City", "BGC, Taguig", "Ortigas, Pasig", "Quezon City", "Manila", "Cebu City"] },
  { industry: "Architecture & Urban Planning", roles: ["Licensed Architect", "Urban Planner", "Interior Designer", "CAD Drafter", "BIM Specialist", "Landscape Architect"], locations: ["Makati City", "BGC, Taguig", "Quezon City", "Cebu City", "Davao City", "Clark, Pampanga"] },
];

const ALL_INDUSTRIES = PH_JOB_DIRECTORY.map(d => d.industry);
const ALL_LOCATIONS  = [...new Set(PH_JOB_DIRECTORY.flatMap(d => d.locations))].sort();

/* ─── Single autocomplete field ─── */
interface ACProps {
  icon: React.ElementType;
  label: string;
  placeholder: string;
  value: string;
  suggestions: string[];
  onChange: (v: string) => void;
  onSelect: (v: string) => void;
  onClear: () => void;
}

function AutocompleteField({ icon: Icon, label, placeholder, value, suggestions, onChange, onSelect, onClear }: ACProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = value.toLowerCase().trim();
    if (!q) return suggestions;
    return suggestions.filter(s => s.toLowerCase().includes(q));
  }, [value, suggestions]);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function mark(text: string, query: string) {
    if (!query.trim()) return <>{text}</>;
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i === -1) return <>{text}</>;
    return <>{text.slice(0, i)}<mark className="bg-accent/25 text-accent not-italic font-semibold rounded-sm">{text.slice(i, i + query.length)}</mark>{text.slice(i + query.length)}</>;
  }

  return (
    <div ref={wrapRef} className="relative flex-1 min-w-0">
      {/* Input row */}
      <div className={cn(
        "flex items-center gap-3 px-5 h-16 border-r border-slate-200 transition-all cursor-text",
        open && "bg-slate-50/70"
      )}
        onClick={() => { setOpen(true); (wrapRef.current?.querySelector("input") as HTMLInputElement)?.focus(); }}
      >
        <Icon className="w-5 h-5 text-primary/60 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest mb-0.5">{label}</p>
          <input
            type="text"
            value={value}
            onChange={e => { onChange(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full bg-transparent text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:outline-none"
          />
        </div>
        {value && (
          <button type="button" onClick={e => { e.stopPropagation(); onClear(); setOpen(false); }}
            className="text-slate-300 hover:text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown — rendered outside the parent to avoid clipping */}
      {open && filtered.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/80 z-[999] max-h-72 overflow-y-auto"
          onMouseDown={e => e.preventDefault()}
        >
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label} — {filtered.length} options</p>
          </div>
          {filtered.map(s => (
            <button key={s} type="button"
              onClick={() => { onSelect(s); onChange(s); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-primary/5 flex items-center gap-2.5 border-b border-slate-50 last:border-0 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>{mark(s, value)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Full widget ─── */
export function JobSearchWidget() {
  const [, setLocation] = useLocation();

  const [industryText, setIndustryText]   = useState("");
  const [locationText, setLocationText]   = useState("");
  const [selIndustry, setSelIndustry]     = useState("");
  const [selLocation, setSelLocation]     = useState("");

  const industrySuggestions = useMemo(
    () => selLocation
      ? PH_JOB_DIRECTORY.filter(d => d.locations.includes(selLocation)).map(d => d.industry)
      : ALL_INDUSTRIES,
    [selLocation]
  );

  const locationSuggestions = useMemo(
    () => selIndustry
      ? (PH_JOB_DIRECTORY.find(d => d.industry === selIndustry)?.locations ?? ALL_LOCATIONS)
      : ALL_LOCATIONS,
    [selIndustry]
  );

  const matchedRoles = PH_JOB_DIRECTORY.find(d => d.industry === selIndustry)?.roles ?? [];

  function handleSearch() {
    const params = new URLSearchParams();
    if (selIndustry || industryText) params.set("industry", selIndustry || industryText);
    if (selLocation || locationText) params.set("location", selLocation || locationText);
    setLocation(`/jobs?${params.toString()}`);
  }

  return (
    <div className="w-full space-y-3">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 flex flex-col sm:flex-row overflow-visible">
        <AutocompleteField
          icon={Briefcase}
          label="Industry / Role"
          placeholder="e.g. Technology, Nurse, BPO…"
          value={industryText}
          suggestions={industrySuggestions}
          onChange={v => { setIndustryText(v); if (!v) setSelIndustry(""); }}
          onSelect={v => setSelIndustry(v)}
          onClear={() => { setIndustryText(""); setSelIndustry(""); }}
        />

        {/* vertical divider on desktop */}
        <div className="hidden sm:block w-px bg-slate-200 self-stretch" />
        <div className="sm:hidden h-px bg-slate-200 mx-5" />

        <AutocompleteField
          icon={MapPin}
          label="Location"
          placeholder="e.g. Makati, Cebu, Remote…"
          value={locationText}
          suggestions={locationSuggestions}
          onChange={v => { setLocationText(v); if (!v) setSelLocation(""); }}
          onSelect={v => setSelLocation(v)}
          onClear={() => { setLocationText(""); setSelLocation(""); }}
        />

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 px-7 py-4 font-bold text-white text-sm shrink-0 rounded-b-2xl sm:rounded-b-none sm:rounded-r-2xl transition-all hover:brightness-110 active:scale-95"
          style={{ background: "hsl(24 95% 52%)" }}
        >
          <Search className="w-5 h-5" />
          <span>Find Jobs</span>
        </button>
      </div>

      {/* Role chips when industry is selected */}
      {matchedRoles.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Roles:</span>
          {matchedRoles.slice(0, 7).map(role => (
            <button key={role} type="button"
              onClick={() => { setIndustryText(role); }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-primary text-xs font-medium hover:border-accent hover:text-accent transition-colors shadow-sm"
            >
              {role} <ChevronRight className="w-3 h-3" />
            </button>
          ))}
          {matchedRoles.length > 7 && (
            <span className="text-xs text-slate-400">+{matchedRoles.length - 7} more</span>
          )}
        </div>
      )}

      {selLocation && !selIndustry && (
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-primary">{industrySuggestions.length} industries</span> are actively hiring in {selLocation}
        </p>
      )}
    </div>
  );
}
