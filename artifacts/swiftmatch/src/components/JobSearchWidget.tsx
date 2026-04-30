import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Briefcase, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Comprehensive PH Industry → Locations dataset ─── */
export const PH_JOB_DIRECTORY: { industry: string; roles: string[]; locations: string[] }[] = [
  {
    industry: "Technology / IT",
    roles: ["Software Engineer", "Full Stack Developer", "Data Engineer", "DevOps Engineer", "QA Engineer", "Product Manager", "Systems Analyst", "IT Support Specialist", "Cybersecurity Analyst", "AI/ML Engineer"],
    locations: ["Makati City", "BGC, Taguig", "Ortigas, Pasig", "Quezon City", "Cebu City", "IT Park, Cebu", "Clark, Pampanga", "Mandaluyong", "Remote / Anywhere in Philippines"],
  },
  {
    industry: "BPO / Call Center",
    roles: ["Customer Service Representative", "Technical Support Agent", "Team Leader", "Operations Manager", "Quality Analyst", "Trainer", "Workforce Analyst", "Chat Support Specialist"],
    locations: ["Makati City", "BGC, Taguig", "Quezon City", "Ortigas, Pasig", "Mandaluyong", "Alabang, Muntinlupa", "Cebu City", "Davao City", "Clark, Pampanga", "Iloilo City"],
  },
  {
    industry: "Healthcare / Medical",
    roles: ["Registered Nurse", "Medical Technologist", "Physical Therapist", "Pharmacist", "Radiologist", "General Physician", "Hospital Administrator", "Dental Assistant", "Medical Coder"],
    locations: ["Quezon City", "Makati City", "Manila", "Pasig City", "Cebu City", "Davao City", "Cagayan de Oro", "Iloilo City"],
  },
  {
    industry: "Finance / Banking",
    roles: ["Financial Analyst", "Credit Analyst", "Accountant", "Auditor", "Investment Analyst", "Treasury Officer", "Risk Manager", "Branch Manager", "Relationship Manager", "CPA"],
    locations: ["Makati City", "BGC, Taguig", "Ortigas, Pasig", "Quezon City", "Manila", "Cebu City"],
  },
  {
    industry: "Marketing / Advertising",
    roles: ["Digital Marketing Specialist", "Social Media Manager", "SEO Specialist", "Brand Manager", "Content Strategist", "Media Planner", "Copywriter", "Marketing Analyst", "CRM Specialist"],
    locations: ["Makati City", "BGC, Taguig", "Quezon City", "Mandaluyong", "Cebu City", "Remote / Anywhere in Philippines"],
  },
  {
    industry: "Real Estate & Construction",
    roles: ["Real Estate Agent", "Property Manager", "Civil Engineer", "Structural Engineer", "Architect", "Site Supervisor", "Quantity Surveyor", "Project Engineer"],
    locations: ["Makati City", "BGC, Taguig", "Quezon City", "Paranaque", "Cavite", "Laguna", "Cebu City", "Davao City", "Clark, Pampanga"],
  },
  {
    industry: "Manufacturing & Engineering",
    roles: ["Production Supervisor", "Quality Control Engineer", "Mechanical Engineer", "Electrical Engineer", "Industrial Engineer", "Safety Officer", "Maintenance Technician", "Supply Chain Analyst"],
    locations: ["Laguna", "Cavite", "Clark, Pampanga", "Calamba, Laguna", "Batangas", "Cagayan de Oro", "Davao City", "Cebu City"],
  },
  {
    industry: "Retail & E-commerce",
    roles: ["Store Manager", "Retail Associate", "E-commerce Manager", "Inventory Analyst", "Category Manager", "Visual Merchandiser", "Customer Experience Lead", "Logistics Coordinator"],
    locations: ["Makati City", "Mandaluyong", "Quezon City", "BGC, Taguig", "Pasay", "Cebu City", "Davao City", "Remote / Anywhere in Philippines"],
  },
  {
    industry: "Education & Training",
    roles: ["Teacher", "Academic Coordinator", "Training Specialist", "Curriculum Developer", "School Principal", "Guidance Counselor", "E-learning Developer", "ESL Tutor"],
    locations: ["Quezon City", "Mandaluyong", "Manila", "Makati City", "Cebu City", "Davao City", "Iloilo City", "Cagayan de Oro", "Remote / Anywhere in Philippines"],
  },
  {
    industry: "Hospitality & Tourism",
    roles: ["Hotel Manager", "Front Desk Officer", "Event Coordinator", "Food & Beverage Manager", "Tour Guide", "Resort Operations Staff", "Revenue Manager", "Concierge"],
    locations: ["Pasay", "Parañaque", "Cebu City", "Davao City", "Boracay, Aklan", "Palawan", "BGC, Taguig", "Makati City"],
  },
  {
    industry: "Food & Beverage",
    roles: ["Executive Chef", "Restaurant Manager", "Barista", "Kitchen Supervisor", "Food Safety Officer", "Purchasing Officer", "Pastry Chef", "Operations Manager"],
    locations: ["Makati City", "Quezon City", "BGC, Taguig", "Cebu City", "Davao City", "Ortigas, Pasig", "Mandaluyong"],
  },
  {
    industry: "Creative Arts & Design",
    roles: ["Graphic Designer", "UI/UX Designer", "Motion Designer", "Illustrator", "Video Editor", "Creative Director", "Art Director", "3D Artist", "Photographer"],
    locations: ["Makati City", "BGC, Taguig", "Quezon City", "Cebu City", "Remote / Anywhere in Philippines"],
  },
  {
    industry: "Logistics & Transportation",
    roles: ["Logistics Coordinator", "Supply Chain Manager", "Warehouse Supervisor", "Freight Forwarder", "Fleet Manager", "Customs Specialist", "Procurement Officer"],
    locations: ["Pasay", "Parañaque", "Manila", "Cebu City", "Davao City", "Clark, Pampanga", "Laguna", "Batangas"],
  },
  {
    industry: "Telecommunications",
    roles: ["Network Engineer", "RF Engineer", "Telecom Project Manager", "Technical Account Manager", "Field Service Technician", "OSS/BSS Analyst", "Sales Engineer"],
    locations: ["Makati City", "BGC, Taguig", "Quezon City", "Ortigas, Pasig", "Cebu City", "Davao City"],
  },
  {
    industry: "Media & Entertainment",
    roles: ["Broadcast Journalist", "Content Creator", "Video Producer", "Social Media Content Writer", "Radio DJ", "Film Production Assistant", "News Anchor", "Scriptwriter"],
    locations: ["Quezon City", "Makati City", "Mandaluyong", "Manila", "Cebu City"],
  },
  {
    industry: "Human Resources",
    roles: ["HR Manager", "Recruiter", "Talent Acquisition Specialist", "Compensation & Benefits Analyst", "HRIS Specialist", "HR Business Partner", "Learning & Development Manager"],
    locations: ["Makati City", "BGC, Taguig", "Ortigas, Pasig", "Quezon City", "Cebu City", "Remote / Anywhere in Philippines"],
  },
  {
    industry: "Government & Public Sector",
    roles: ["Public Health Officer", "Social Worker", "Government Accountant", "Policy Analyst", "Local Government Unit Staff", "Public Information Officer"],
    locations: ["Manila", "Quezon City", "Pasig City", "Cebu City", "Davao City", "Iloilo City", "Cagayan de Oro"],
  },
  {
    industry: "Agriculture & Environment",
    roles: ["Agronomist", "Farm Manager", "Agricultural Engineer", "Environmental Scientist", "Food Technologist", "Veterinarian", "Aquaculture Specialist"],
    locations: ["Davao City", "Laguna", "Clark, Pampanga", "Cagayan de Oro", "Bukidnon", "Iloilo City", "Batangas"],
  },
  {
    industry: "Legal & Compliance",
    roles: ["Corporate Lawyer", "Compliance Officer", "Legal Assistant", "Paralegal", "Data Privacy Officer", "Contract Specialist", "Risk and Compliance Analyst"],
    locations: ["Makati City", "BGC, Taguig", "Ortigas, Pasig", "Quezon City", "Manila", "Cebu City"],
  },
  {
    industry: "Architecture & Urban Planning",
    roles: ["Licensed Architect", "Urban Planner", "Interior Designer", "CAD Drafter", "BIM Specialist", "Landscape Architect", "Facilities Manager"],
    locations: ["Makati City", "BGC, Taguig", "Quezon City", "Cebu City", "Davao City", "Clark, Pampanga"],
  },
];

const ALL_INDUSTRIES = PH_JOB_DIRECTORY.map(d => d.industry);
const ALL_LOCATIONS  = [...new Set(PH_JOB_DIRECTORY.flatMap(d => d.locations))].sort();

function getLocationsForIndustry(industry: string) {
  const entry = PH_JOB_DIRECTORY.find(d => d.industry === industry);
  return entry ? entry.locations : ALL_LOCATIONS;
}

function getIndustriesForLocation(location: string) {
  return PH_JOB_DIRECTORY.filter(d => d.locations.includes(location)).map(d => d.industry);
}

/* ─── Autocomplete input ─── */
function AutocompleteInput({
  id,
  icon: Icon,
  placeholder,
  value,
  onChange,
  suggestions,
  onSelect,
  highlight,
}: {
  id: string;
  icon: any;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  suggestions: string[];
  onSelect: (v: string) => void;
  highlight?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = value.toLowerCase().trim();
    return q.length === 0
      ? suggestions
      : suggestions.filter(s => s.toLowerCase().includes(q));
  }, [value, suggestions]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function highlightMatch(text: string, query: string) {
    if (!query.trim()) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <mark className="bg-accent/20 text-accent font-semibold rounded">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <div className={cn(
        "flex items-center gap-3 px-4 py-4 bg-white rounded-xl border-2 transition-all",
        open ? "border-primary shadow-md shadow-primary/10" : "border-slate-200 hover:border-slate-300"
      )}>
        <Icon className="w-5 h-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="block text-xs font-bold text-primary/70 uppercase tracking-wide mb-0.5">
            {placeholder.split(" ")[0]}
          </label>
          <input
            id={id}
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
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className="text-slate-300 hover:text-slate-500 text-xs shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
          {filtered.map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={() => { onSelect(s); onChange(s); setOpen(false); }}
              className="w-full px-4 py-3 text-left text-sm hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50 last:border-0 transition-colors"
            >
              <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="flex-1">{highlightMatch(s, value)}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-400">No matches found</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main widget ─── */
export function JobSearchWidget() {
  const [, setLocation] = useLocation();
  const [industry, setIndustry]       = useState("");
  const [location, setLocationVal]    = useState("");
  const [selIndustry, setSelIndustry] = useState("");
  const [selLocation, setSelLocation] = useState("");

  const industrySuggestions = useMemo(() =>
    selLocation ? getIndustriesForLocation(selLocation) : ALL_INDUSTRIES,
  [selLocation]);

  const locationSuggestions = useMemo(() =>
    selIndustry ? getLocationsForIndustry(selIndustry) : ALL_LOCATIONS,
  [selIndustry]);

  const matchedEntry = PH_JOB_DIRECTORY.find(d => d.industry === selIndustry);
  const matchedRoles = matchedEntry?.roles || [];

  function handleSearch() {
    const params = new URLSearchParams();
    if (selIndustry) params.set("industry", selIndustry);
    if (selLocation) params.set("location", selLocation);
    setLocation(`/apply?${params.toString()}`);
  }

  return (
    <div className="w-full space-y-3">
      {/* Search bar row */}
      <div className="flex flex-col sm:flex-row gap-0 bg-white rounded-2xl border-2 border-slate-200 shadow-lg shadow-primary/5 overflow-hidden">
        <AutocompleteInput
          id="industry-search"
          icon={Briefcase}
          placeholder="Industry or role…"
          value={industry}
          onChange={v => { setIndustry(v); if (!v) setSelIndustry(""); }}
          suggestions={industrySuggestions}
          onSelect={v => setSelIndustry(v)}
        />

        {/* Divider */}
        <div className="hidden sm:block w-px bg-slate-200 self-stretch" />
        <div className="block sm:hidden h-px bg-slate-200" />

        <AutocompleteInput
          id="location-search"
          icon={MapPin}
          placeholder="Location in Philippines…"
          value={location}
          onChange={v => { setLocationVal(v); if (!v) setSelLocation(""); }}
          suggestions={locationSuggestions}
          onSelect={v => setSelLocation(v)}
        />

        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm text-white shrink-0 transition-all hover:brightness-110 active:scale-95"
          style={{ background: "hsl(24 95% 52%)" }}
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Find Jobs</span>
        </button>
      </div>

      {/* Matched role chips */}
      {matchedRoles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500 font-medium self-center mr-1">Roles in {selIndustry}:</span>
          {matchedRoles.slice(0, 6).map(role => (
            <button
              key={role}
              type="button"
              onClick={() => { setIndustry(role); }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/6 text-primary text-xs font-medium hover:bg-primary/12 transition-colors border border-primary/10"
            >
              {role}
              <ChevronRight className="w-3 h-3" />
            </button>
          ))}
          {matchedRoles.length > 6 && (
            <span className="text-xs text-slate-400 self-center">+{matchedRoles.length - 6} more</span>
          )}
        </div>
      )}

      {/* Location context tag */}
      {selLocation && !selIndustry && (
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-primary">{getIndustriesForLocation(selLocation).length} industries</span> are hiring in {selLocation}
        </p>
      )}
    </div>
  );
}
