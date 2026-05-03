import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { isOwnerEmail } from "@/lib/owner";
import {
  Lock, Crown, ChevronLeft, ChevronRight, User, Building2,
  FileText, Award, TrendingUp, Calendar, Download, Compass,
  ClipboardList, UserCircle, Briefcase, Target, ChevronDown,
  CheckCircle2, MinusCircle, MapPin, Upload, AlertCircle, FileUp,
  Sparkles, ShieldCheck, AlertTriangle, Lightbulb, X,
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   SCORE DEFINITIONS & MAPPING
══════════════════════════════════════════════════════ */
type ScoreItem = {
  key: string; label: string; short: string;
  score: number; max: number; color: string; taken: boolean;
};

type ApplicantData = {
  name: string; email: string; industry: string;
  role: string; level: string; date: string;
};

const BASE_URL = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const SCORE_DEFS = [
  { key: "ke",  label: "Knowledge & Expertise",    short: "K&E",    color: "#1e40af", words: ["knowledge"] },
  { key: "pw",  label: "Personality & Work Style", short: "P&W",    color: "#7c3aed", words: ["personality", "work style"] },
  { key: "cf",  label: "Cultural Fit",             short: "C.Fit",  color: "#ea580c", words: ["cultural"] },
  { key: "ct",  label: "Critical Thinking",        short: "C.Think",color: "#0891b2", words: ["critical thinking", "critical"] },
  { key: "air", label: "AI Readiness",             short: "AI.R",   color: "#16a34a", words: ["ai readiness", "ai"] },
] as const;

function mapResultsToScores(results: { assessmentTitle: string; score: number }[]): ScoreItem[] {
  return SCORE_DEFS.map(def => {
    const match = results.find(r =>
      def.words.some(w => r.assessmentTitle.toLowerCase().includes(w))
    );
    return {
      key: def.key, label: def.label, short: def.short,
      score: match?.score ?? 0, max: 100, color: def.color,
      taken: !!match,
    };
  });
}
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
   CAREER EXPANSION DATA
══════════════════════════════════════════════════════ */
type ExpansionEntry = {
  industry: string; emoji: string; baseMatch: number;
  scoreDriver: string; reason: string; keyStrength: string; roles: string[];
};

const CAREER_EXPANSION: Record<string, ExpansionEntry[]> = {
  "Technology / IT": [
    { industry: "Telecommunications",    emoji: "📡", baseMatch: 86, scoreDriver: "ke",  reason: "Your technical depth translates directly to network engineering, telco infrastructure, and digital product management.",           keyStrength: "Technical depth",             roles: ["Network Engineer", "Telco Product Manager", "Systems Architect"] },
    { industry: "Finance / Banking",     emoji: "🏦", baseMatch: 83, scoreDriver: "ct",  reason: "Strong analytical thinking opens doors in fintech development, algorithmic systems, and digital banking platforms.",               keyStrength: "Analytical rigour",           roles: ["FinTech Developer", "Data Analyst", "Banking Systems Engineer"] },
    { industry: "Media & Entertainment", emoji: "🎬", baseMatch: 79, scoreDriver: "air", reason: "AI readiness and systems thinking position you well for streaming platforms, content tech, and digital production pipelines.",     keyStrength: "Digital innovation",          roles: ["Platform Engineer", "Digital Product Manager", "Streaming Tech Lead"] },
    { industry: "Human Resources",       emoji: "👥", baseMatch: 75, scoreDriver: "pw",  reason: "High interpersonal skills make you effective as an HR Technology specialist or People Analytics lead.",                          keyStrength: "People orientation",          roles: ["HR Tech Specialist", "People Analytics Lead", "Workforce Systems Manager"] },
  ],
  "BPO / Call Center": [
    { industry: "Human Resources",       emoji: "👥", baseMatch: 88, scoreDriver: "pw",  reason: "Communication, conflict resolution, and people focus translate directly to talent management and employee relations.",             keyStrength: "Communication excellence",    roles: ["HR Generalist", "Employee Relations Specialist", "Talent Acquisition Officer"] },
    { industry: "Retail & E-commerce",   emoji: "🛒", baseMatch: 84, scoreDriver: "cf",  reason: "Customer interaction expertise and service recovery skills are core competencies in retail ops and CX management.",               keyStrength: "Customer focus",              roles: ["Customer Experience Manager", "Store Operations Supervisor", "E-commerce Support Lead"] },
    { industry: "Hospitality & Tourism", emoji: "🏨", baseMatch: 82, scoreDriver: "cf",  reason: "Service orientation, empathy, and handling difficult situations are highly valued in guest experience and hotel operations.",     keyStrength: "Service orientation",         roles: ["Guest Relations Officer", "Front Office Supervisor", "Hospitality Operations Manager"] },
    { industry: "Education & Training",  emoji: "📚", baseMatch: 78, scoreDriver: "pw",  reason: "Coaching and communication skills from BPO team leadership translate well to corporate training and instructional design.",       keyStrength: "Coaching and facilitation",   roles: ["Corporate Trainer", "L&D Specialist", "Instructional Designer"] },
  ],
  "Healthcare / Medical": [
    { industry: "Education & Training",  emoji: "📚", baseMatch: 86, scoreDriver: "pw",  reason: "Subject matter expertise and patient communication skills position you as a health sciences educator or clinical trainer.",       keyStrength: "Knowledge transfer",          roles: ["Health Sciences Educator", "Clinical Trainer", "Nursing Instructor"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 82, scoreDriver: "cf", reason: "Public health knowledge and community service commitment align with public health officer and policy analyst roles.",         keyStrength: "Public service commitment",   roles: ["Public Health Officer", "Health Policy Analyst", "DOH Programme Officer"] },
    { industry: "Human Resources",       emoji: "👥", baseMatch: 79, scoreDriver: "pw",  reason: "Healthcare professionals excel in occupational health, corporate wellness programmes, and employee assistance roles.",            keyStrength: "Wellness and wellbeing",      roles: ["Occupational Health Officer", "Corporate Wellness Manager", "HR Generalist"] },
    { industry: "Legal & Compliance",    emoji: "⚖️", baseMatch: 76, scoreDriver: "ct",  reason: "Clinical judgment and documentation skills transfer to healthcare compliance, medical-legal consulting, and regulatory affairs.", keyStrength: "Regulatory knowledge",        roles: ["Healthcare Compliance Officer", "Medical-Legal Consultant", "Regulatory Affairs Specialist"] },
  ],
  "Finance / Banking": [
    { industry: "Legal & Compliance",    emoji: "⚖️", baseMatch: 89, scoreDriver: "ct",  reason: "Financial compliance knowledge and analytical precision are directly transferable to corporate law and regulatory advisory.",       keyStrength: "Regulatory precision",        roles: ["Compliance Officer", "Legal Analyst", "Contracts Specialist"] },
    { industry: "Real Estate & Construction", emoji: "🏗️", baseMatch: 84, scoreDriver: "ke", reason: "Property valuation and mortgage analysis are natural extensions of your financial modelling and credit assessment skills.",   keyStrength: "Valuation expertise",         roles: ["Property Investment Analyst", "Mortgage Specialist", "Real Estate Finance Manager"] },
    { industry: "Technology / IT",       emoji: "💻", baseMatch: 81, scoreDriver: "air", reason: "FinTech is booming — your domain knowledge combined with AI readiness makes you a strong fit for digital banking roles.",         keyStrength: "Domain + digital skills",     roles: ["FinTech Product Manager", "Digital Banking Analyst", "Financial Systems Consultant"] },
    { industry: "Human Resources",       emoji: "👥", baseMatch: 77, scoreDriver: "pw",  reason: "Compensation design, payroll systems, and workforce cost modelling draw heavily on financial analysis skills.",                  keyStrength: "Analytical application",      roles: ["Compensation & Benefits Specialist", "Payroll Manager", "HR Finance Partner"] },
  ],
  "Marketing / Advertising": [
    { industry: "Media & Entertainment", emoji: "🎬", baseMatch: 91, scoreDriver: "pw",  reason: "Storytelling, audience analysis, and creative campaign skills are core competencies in content production and entertainment marketing.", keyStrength: "Creative storytelling",    roles: ["Content Producer", "Media Planner", "Entertainment Marketing Manager"] },
    { industry: "Retail & E-commerce",   emoji: "🛒", baseMatch: 87, scoreDriver: "ke",  reason: "Performance marketing, growth hacking, and conversion optimisation are direct applications of your digital marketing skills.",    keyStrength: "Performance marketing",       roles: ["E-commerce Growth Manager", "Performance Marketing Lead", "Category Manager"] },
    { industry: "Human Resources",       emoji: "👥", baseMatch: 79, scoreDriver: "pw",  reason: "Employer branding, recruitment marketing, and internal communications are HR functions that leverage marketing expertise.",        keyStrength: "Brand communication",         roles: ["Employer Brand Specialist", "Recruitment Marketing Manager", "Internal Comms Lead"] },
    { industry: "Education & Training",  emoji: "📚", baseMatch: 76, scoreDriver: "cf",  reason: "Curriculum design, e-learning content creation, and learning experience design draw on the same audience-centric thinking.",     keyStrength: "Audience engagement",         roles: ["E-Learning Content Developer", "Training Programme Designer", "EdTech Product Manager"] },
  ],
  "Real Estate & Construction": [
    { industry: "Finance / Banking",     emoji: "🏦", baseMatch: 87, scoreDriver: "ke",  reason: "Real estate finance, property-backed lending, and investment fund management leverage your project valuation and risk skills.",    keyStrength: "Asset valuation",             roles: ["Real Estate Investment Analyst", "Mortgage Specialist", "REIT Fund Manager"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 83, scoreDriver: "cf", reason: "Urban planning, infrastructure development, and housing regulatory bodies seek professionals with property development backgrounds.", keyStrength: "Infrastructure knowledge", roles: ["Urban Planner", "Infrastructure Programme Officer", "Housing Regulatory Officer"] },
    { industry: "Architecture & Urban Planning", emoji: "🏙️", baseMatch: 81, scoreDriver: "ke", reason: "Construction project management and technical expertise complement architecture firms seeking business-savvy professionals.", keyStrength: "Technical project management", roles: ["Project Manager", "Construction Consultant", "BIM Coordinator"] },
    { industry: "Logistics & Transportation", emoji: "🚚", baseMatch: 75, scoreDriver: "ct", reason: "Supply chain coordination, procurement, and facility management draw on similar analytical and operational skills.", keyStrength: "Operations management",        roles: ["Facilities Manager", "Procurement Manager", "Supply Chain Coordinator"] },
  ],
  "Manufacturing & Engineering": [
    { industry: "Logistics & Transportation", emoji: "🚚", baseMatch: 88, scoreDriver: "ke", reason: "Supply chain management, warehouse operations, and production planning are direct extensions of your manufacturing expertise.", keyStrength: "Process engineering",         roles: ["Supply Chain Manager", "Production Planning Manager", "Warehouse Operations Lead"] },
    { industry: "Real Estate & Construction", emoji: "🏗️", baseMatch: 84, scoreDriver: "ke", reason: "Civil, structural, and mechanical engineering skills translate well to construction project management and technical advisory.", keyStrength: "Engineering fundamentals",    roles: ["Construction Engineer", "Project Manager", "Technical Consultant"] },
    { industry: "Technology / IT",       emoji: "💻", baseMatch: 80, scoreDriver: "air", reason: "Industrial automation, IoT, and smart manufacturing create demand for engineers who bridge physical operations and digital systems.", keyStrength: "Systems integration",        roles: ["IoT Engineer", "Automation Specialist", "Industrial Data Analyst"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 75, scoreDriver: "cf", reason: "Government agencies in energy, water, and infrastructure regularly recruit experienced manufacturing and industrial engineers.",  keyStrength: "Public infrastructure",      roles: ["Infrastructure Programme Engineer", "Government Technical Officer", "Utilities Engineer"] },
  ],
  "Retail & E-commerce": [
    { industry: "Hospitality & Tourism", emoji: "🏨", baseMatch: 86, scoreDriver: "cf",  reason: "Customer experience leadership, service standards, and revenue optimisation transfer directly to hotel and tourism operations.",    keyStrength: "Customer experience",         roles: ["Guest Experience Manager", "Revenue Manager", "Hospitality Operations Supervisor"] },
    { industry: "Marketing / Advertising", emoji: "📣", baseMatch: 84, scoreDriver: "pw", reason: "Commercial instincts, consumer behaviour insights, and campaign execution are core skills for brand and digital marketing.",      keyStrength: "Commercial acumen",           roles: ["Brand Manager", "Category Marketing Manager", "Digital Commerce Specialist"] },
    { industry: "Logistics & Transportation", emoji: "🚚", baseMatch: 82, scoreDriver: "ke", reason: "Supply chain, inventory management, and last-mile delivery are areas where retail expertise creates immediate value.",          keyStrength: "Supply chain operations",     roles: ["Supply Chain Analyst", "Inventory Manager", "Logistics Operations Lead"] },
    { industry: "Food & Beverage",       emoji: "🍽️", baseMatch: 78, scoreDriver: "cf",  reason: "Multi-unit retail management, franchise operations, and category buying are highly valued in F&B chains and FMCG companies.",    keyStrength: "Multi-unit operations",       roles: ["F&B Operations Manager", "FMCG Category Manager", "Franchise Operations Lead"] },
  ],
  "Education & Training": [
    { industry: "Human Resources",       emoji: "👥", baseMatch: 90, scoreDriver: "pw",  reason: "Learning and development, organisational capability building, and talent programmes extend naturally from your facilitation expertise.", keyStrength: "Learning facilitation",     roles: ["L&D Manager", "Organisational Development Specialist", "Training Programme Manager"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 83, scoreDriver: "cf", reason: "Public education policy, curriculum reform, and government training programmes are areas where educators create systemic impact.", keyStrength: "Educational policy",         roles: ["Education Programme Officer", "Curriculum Policy Analyst", "Government Training Coordinator"] },
    { industry: "Marketing / Advertising", emoji: "📣", baseMatch: 79, scoreDriver: "pw", reason: "Content creation, audience engagement, and communication skills are directly applicable to content marketing and brand storytelling.", keyStrength: "Content and communication", roles: ["Content Strategist", "Brand Communications Manager", "EdTech Marketing Specialist"] },
    { industry: "Healthcare / Medical",  emoji: "🏥", baseMatch: 76, scoreDriver: "cf",  reason: "Health education, patient literacy programmes, and clinical staff training are areas where educational expertise drives health outcomes.", keyStrength: "Health communication",      roles: ["Health Educator", "Clinical Training Coordinator", "Patient Advocacy Officer"] },
  ],
  "Hospitality & Tourism": [
    { industry: "Food & Beverage",       emoji: "🍽️", baseMatch: 90, scoreDriver: "ke",  reason: "F&B management, vendor relationships, and menu engineering skills are core competencies for restaurant groups and FMCG companies.", keyStrength: "F&B operations mastery",     roles: ["Restaurant Group Manager", "F&B Operations Director", "FMCG Trade Relations Manager"] },
    { industry: "Retail & E-commerce",   emoji: "🛒", baseMatch: 85, scoreDriver: "cf",  reason: "Customer experience leadership and upselling expertise from hospitality translate to premium retail and luxury brand management.",  keyStrength: "Premium service delivery",    roles: ["Customer Experience Lead", "Luxury Retail Manager", "Brand Experience Specialist"] },
    { industry: "Marketing / Advertising", emoji: "📣", baseMatch: 81, scoreDriver: "pw", reason: "Tourism marketing, destination branding, and event promotion leverage your knowledge of traveller motivations and guest experience.", keyStrength: "Destination marketing",      roles: ["Tourism Marketing Manager", "Events Marketing Specialist", "Brand Experience Designer"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 77, scoreDriver: "cf", reason: "The Department of Tourism and LGUs managing visitor economies value experienced hospitality professionals.",                   keyStrength: "Tourism policy",              roles: ["Tourism Development Officer", "Cultural Heritage Programme Manager", "MICE Coordinator"] },
  ],
  "Food & Beverage": [
    { industry: "Hospitality & Tourism", emoji: "🏨", baseMatch: 89, scoreDriver: "ke",  reason: "F&B management and kitchen leadership skills are directly transferable to hotel dining, resort operations, and premium catering.",  keyStrength: "Culinary operations",         roles: ["Hotel F&B Manager", "Resort Executive Chef", "Catering Operations Lead"] },
    { industry: "Retail & E-commerce",   emoji: "🛒", baseMatch: 82, scoreDriver: "ke",  reason: "FMCG product development and grocery category management benefit directly from your product and supply chain knowledge.",           keyStrength: "Product and supply knowledge", roles: ["FMCG Product Manager", "Category Buyer", "Food Retail Operations Manager"] },
    { industry: "Agriculture & Environment", emoji: "🌱", baseMatch: 79, scoreDriver: "cf", reason: "Farm-to-table sourcing, sustainable ingredient procurement, and agri-food supply chains connect F&B to agricultural production.", keyStrength: "Supply chain and sourcing",   roles: ["Agri-food Supply Chain Manager", "Sustainable Sourcing Specialist", "Food Safety Coordinator"] },
    { industry: "Education & Training",  emoji: "📚", baseMatch: 75, scoreDriver: "pw",  reason: "Culinary arts education, food safety training, and hospitality curriculum development are growing fields for F&B professionals.",   keyStrength: "Knowledge transfer",          roles: ["Culinary Arts Instructor", "Food Safety Trainer", "Hospitality Academy Manager"] },
  ],
  "Creative Arts & Design": [
    { industry: "Marketing / Advertising", emoji: "📣", baseMatch: 92, scoreDriver: "pw", reason: "Visual communication, brand identity, and audience engagement are the foundation of effective advertising and content campaigns.",  keyStrength: "Visual communication",        roles: ["Creative Director", "Brand Designer", "Art Director"] },
    { industry: "Media & Entertainment", emoji: "🎬", baseMatch: 88, scoreDriver: "ke",  reason: "Motion design, digital storytelling, and production design translate to film, broadcast, gaming, and streaming content creation.",  keyStrength: "Digital storytelling",        roles: ["Motion Designer", "Production Designer", "Digital Content Creator"] },
    { industry: "Education & Training",  emoji: "📚", baseMatch: 80, scoreDriver: "cf",  reason: "E-learning design, visual curriculum development, and instructional media creation leverage your design skills to improve learning.", keyStrength: "Visual learning design",      roles: ["Instructional Designer", "E-Learning Media Developer", "Educational Content Creator"] },
    { industry: "Architecture & Urban Planning", emoji: "🏙️", baseMatch: 77, scoreDriver: "ke", reason: "Spatial design thinking and 3D visualisation bridge design practice with interior design and urban design projects.",        keyStrength: "Spatial design thinking",     roles: ["Interior Designer", "Spatial Experience Designer", "Urban Design Consultant"] },
  ],
  "Logistics & Transportation": [
    { industry: "Manufacturing & Engineering", emoji: "🏭", baseMatch: 87, scoreDriver: "ke", reason: "Supply chain coordination, materials management, and scheduling are tightly integrated with manufacturing and benefit from logistics expertise.", keyStrength: "Supply chain integration", roles: ["Production Planning Manager", "Materials Manager", "Operations Director"] },
    { industry: "Retail & E-commerce",   emoji: "🛒", baseMatch: 84, scoreDriver: "ke",  reason: "Last-mile delivery, fulfilment centre operations, and inventory optimisation are critical retail functions logistics professionals lead.", keyStrength: "Fulfilment expertise",       roles: ["E-commerce Logistics Manager", "Fulfilment Operations Lead", "Inventory Optimisation Specialist"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 79, scoreDriver: "cf", reason: "Infrastructure programme management, port authority operations, and government procurement benefit from logistics professionals.", keyStrength: "Infrastructure operations",  roles: ["Infrastructure Programme Manager", "Port Operations Officer", "Government Procurement Specialist"] },
    { industry: "Technology / IT",       emoji: "💻", baseMatch: 76, scoreDriver: "air", reason: "Logistics technology, route optimisation, and supply chain digitalisation create demand for tech-savvy operations professionals.",    keyStrength: "Operations technology",       roles: ["Logistics Tech Product Manager", "Supply Chain Systems Analyst", "TMS Implementation Specialist"] },
  ],
  "Telecommunications": [
    { industry: "Technology / IT",       emoji: "💻", baseMatch: 91, scoreDriver: "ke",  reason: "Network engineering, cloud infrastructure, and systems architecture skills from telco apply broadly across the technology industry.", keyStrength: "Infrastructure expertise",   roles: ["Cloud Infrastructure Engineer", "Systems Architect", "Network Security Specialist"] },
    { industry: "Media & Entertainment", emoji: "🎬", baseMatch: 83, scoreDriver: "air", reason: "Streaming infrastructure, content delivery networks, and digital platform management are natural extensions for telco professionals.", keyStrength: "Digital delivery platforms", roles: ["CDN Platform Engineer", "Streaming Operations Manager", "Digital Platform Product Manager"] },
    { industry: "Finance / Banking",     emoji: "🏦", baseMatch: 79, scoreDriver: "ct",  reason: "Digital banking infrastructure, payment gateway systems, and financial data networks draw on your architecture and security expertise.", keyStrength: "Secure infrastructure",      roles: ["Digital Banking Infrastructure Lead", "Payment Systems Engineer", "FinTech Security Architect"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 75, scoreDriver: "cf", reason: "National broadband programmes, e-government digital infrastructure, and regulatory agencies seek experienced telco professionals.", keyStrength: "Regulatory and policy expertise", roles: ["ICT Programme Officer", "Digital Infrastructure Policy Analyst", "Regulatory Affairs Specialist"] },
  ],
  "Media & Entertainment": [
    { industry: "Marketing / Advertising", emoji: "📣", baseMatch: 91, scoreDriver: "pw", reason: "Content production, audience analysis, and distribution strategy are core competencies in brand communications and digital marketing.", keyStrength: "Content and audience expertise", roles: ["Brand Content Manager", "Digital Marketing Director", "Influencer Marketing Lead"] },
    { industry: "Creative Arts & Design", emoji: "🎨", baseMatch: 86, scoreDriver: "ke",  reason: "Visual storytelling, art direction, and digital content creation connect media professionals to creative studios and design agencies.", keyStrength: "Visual storytelling",        roles: ["Creative Director", "Art Director", "Content Studio Manager"] },
    { industry: "Education & Training",  emoji: "📚", baseMatch: 80, scoreDriver: "cf",  reason: "Media literacy education, digital communications training, and journalism schools value practitioners who transfer industry knowledge.", keyStrength: "Industry knowledge transfer", roles: ["Media Studies Educator", "Communications Trainer", "Digital Journalism Instructor"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 76, scoreDriver: "cf", reason: "Government communications offices, public information bureaus, and national broadcasters seek experienced media professionals.",   keyStrength: "Public communications",       roles: ["Government Communications Officer", "Public Affairs Specialist", "National Media Liaison"] },
  ],
  "Human Resources": [
    { industry: "Education & Training",  emoji: "📚", baseMatch: 90, scoreDriver: "pw",  reason: "Learning design, facilitation, and capability building are natural extensions of your L&D and talent development expertise.",         keyStrength: "Learning and facilitation",   roles: ["Corporate Learning Manager", "Instructional Designer", "Organisational Development Consultant"] },
    { industry: "Finance / Banking",     emoji: "🏦", baseMatch: 82, scoreDriver: "ct",  reason: "Compensation analytics, workforce costing, and HR technology implementation benefit from strong analytical and data-driven approaches.", keyStrength: "HR analytics",               roles: ["Compensation & Benefits Manager", "Workforce Analytics Lead", "HR Technology Consultant"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 80, scoreDriver: "cf", reason: "Civil service HR, workforce planning for government agencies, and labour relations regulatory bodies value experienced HR professionals.", keyStrength: "Labour relations expertise", roles: ["Civil Service HR Manager", "Labour Relations Officer", "Workforce Planning Specialist"] },
    { industry: "BPO / Call Center",     emoji: "📞", baseMatch: 78, scoreDriver: "pw",  reason: "People management at scale, performance coaching, and workforce optimisation in BPO require the same strategic HR skills you have.", keyStrength: "Large-scale people management", roles: ["HR Operations Manager", "Talent Management Lead", "Workforce Planning Manager"] },
  ],
  "Government & Public Sector": [
    { industry: "Legal & Compliance",    emoji: "⚖️", baseMatch: 87, scoreDriver: "ct",  reason: "Government policy work, legislative drafting, and regulatory implementation align with corporate compliance and legal advisory roles.", keyStrength: "Policy and regulatory knowledge", roles: ["Compliance Manager", "Regulatory Affairs Specialist", "Policy Consultant"] },
    { industry: "Human Resources",       emoji: "👥", baseMatch: 83, scoreDriver: "pw",  reason: "Civil service HR management, workforce planning, and public sector OD translate well to corporate HR leadership.",                    keyStrength: "Public sector HR expertise",  roles: ["HR Manager", "Organisational Development Lead", "Talent Strategy Consultant"] },
    { industry: "Education & Training",  emoji: "📚", baseMatch: 80, scoreDriver: "cf",  reason: "Programme development, community engagement, and training design skills from government are valued in education and non-profit sectors.", keyStrength: "Programme development",      roles: ["Programme Manager", "Community Development Officer", "Training Specialist"] },
    { industry: "Finance / Banking",     emoji: "🏦", baseMatch: 76, scoreDriver: "ct",  reason: "Budget management, procurement oversight, and fiscal policy experience from government translate to financial planning and treasury roles.", keyStrength: "Budget and fiscal management", roles: ["Budget Planning Manager", "Treasury Analyst", "Financial Compliance Officer"] },
  ],
  "Agriculture & Environment": [
    { industry: "Food & Beverage",       emoji: "🍽️", baseMatch: 88, scoreDriver: "ke",  reason: "Agricultural supply chains, food safety standards, and raw material sourcing are critical F&B functions that agronomists understand deeply.", keyStrength: "Agri-food supply expertise", roles: ["Agri-food Supply Manager", "Food Safety Officer", "Sustainable Sourcing Lead"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 84, scoreDriver: "cf", reason: "Environmental compliance, conservation programme management, and agricultural extension services are core government functions.",     keyStrength: "Conservation and policy",    roles: ["Environmental Programme Officer", "Agricultural Extension Specialist", "Conservation Policy Analyst"] },
    { industry: "Real Estate & Construction", emoji: "🏗️", baseMatch: 79, scoreDriver: "ke", reason: "Environmental impact assessment, land use planning, and green building compliance draw on environmental science expertise.",          keyStrength: "Environmental assessment",   roles: ["Environmental Impact Assessor", "Land Use Planner", "Green Building Consultant"] },
    { industry: "Education & Training",  emoji: "📚", baseMatch: 75, scoreDriver: "pw",  reason: "Agricultural education, environmental awareness programmes, and sustainability training are growing areas where field expertise creates impact.", keyStrength: "Field expertise transfer",  roles: ["Agricultural Educator", "Environmental Trainer", "Sustainability Programme Manager"] },
  ],
  "Legal & Compliance": [
    { industry: "Finance / Banking",     emoji: "🏦", baseMatch: 91, scoreDriver: "ke",  reason: "Financial compliance, AML/KYC frameworks, and banking legal advisory are the highest-demand legal specialisations in the PH market.", keyStrength: "Financial regulatory expertise", roles: ["Bank Compliance Manager", "AML Specialist", "Financial Legal Counsel"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 87, scoreDriver: "ct", reason: "Legislative and regulatory work, policy drafting, and government legal advisory are natural career paths for legal professionals.", keyStrength: "Regulatory and legislative expertise", roles: ["Government Legal Officer", "Policy Analyst", "Legislative Consultant"] },
    { industry: "Human Resources",       emoji: "👥", baseMatch: 83, scoreDriver: "pw",  reason: "Labour law expertise, employment compliance, and HR legal advisory are critical HR functions where legal professionals create value.",   keyStrength: "Labour law expertise",        roles: ["HR Legal Advisor", "Employment Compliance Manager", "Labour Relations Specialist"] },
    { industry: "Real Estate & Construction", emoji: "🏗️", baseMatch: 79, scoreDriver: "ke", reason: "Property law, contract negotiation, and real estate transaction advisory are specialised legal areas with strong PH demand.",       keyStrength: "Property and contract law",   roles: ["Real Estate Lawyer", "Contract Specialist", "Property Transactions Advisor"] },
  ],
  "Architecture & Urban Planning": [
    { industry: "Real Estate & Construction", emoji: "🏗️", baseMatch: 93, scoreDriver: "ke", reason: "Design and planning expertise is directly applicable to property development, construction project management, and technical advisory.", keyStrength: "Design and construction expertise", roles: ["Project Manager", "Development Consultant", "Construction Manager"] },
    { industry: "Government & Public Sector", emoji: "🏛️", baseMatch: 87, scoreDriver: "cf", reason: "Urban planning, housing policy, and city infrastructure development are core government functions that rely on licensed architects.", keyStrength: "Urban policy expertise",      roles: ["Urban Planner", "Housing Programme Officer", "City Infrastructure Lead"] },
    { industry: "Creative Arts & Design", emoji: "🎨", baseMatch: 82, scoreDriver: "pw",  reason: "Spatial design thinking and visualisation skills bridge architecture with interior design, brand environments, and experiential design.", keyStrength: "Spatial design thinking",    roles: ["Interior Designer", "Brand Environment Designer", "Experiential Design Lead"] },
    { industry: "Education & Training",  emoji: "📚", baseMatch: 78, scoreDriver: "pw",  reason: "Architecture education and urban design studios benefit from licensed practitioners who bring real-world project experience.",            keyStrength: "Professional practice knowledge", roles: ["Architecture Instructor", "Urban Design Educator", "Built Environment Programme Coordinator"] },
  ],
};

function getExpansionSuggestions(scores: ScoreItem[], industry: string) {
  const entries = CAREER_EXPANSION[industry] ?? CAREER_EXPANSION["Technology / IT"];
  const scoreMap: Record<string, number> = {};
  scores.forEach(s => { scoreMap[s.key] = s.score; });
  return entries
    .map(e => {
      const driverScore = scoreMap[e.scoreDriver] ?? 70;
      const adj = driverScore >= 80 ? 6 : driverScore >= 65 ? 0 : -6;
      return { ...e, match: Math.min(99, Math.max(60, e.baseMatch + adj)) };
    })
    .sort((a, b) => b.match - a.match);
}

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
   CV MATCH ANALYSIS COMPONENT
══════════════════════════════════════════════════════ */
type CvStrength = { skill: string; cvEvidence: string; assessmentCategory: string };
type CvGap      = { area: string; cvClaim: string; suggestion: string };
type CvAnalysis = {
  overallAlignment: number;
  summary: string;
  confirmedStrengths: CvStrength[];
  gapAreas: CvGap[];
  recommendations: string[];
  cvProfile: { industry?: string; role?: string; level?: string; yearsExperience?: string; topSkills?: string[] };
  jobsMatched?: number;
};

function CvMatchAnalysis() {
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [status, setStatus]     = useState<"loading" | "cv_missing" | "no_scores" | "done" | "error">("loading");
  const [analysis, setAnalysis] = useState<CvAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const runAnalysis = async () => {
    setStatus("loading");
    setAnalysis(null);
    setErrorMsg(null);
    const token = localStorage.getItem("sm_auth_token");
    try {
      const res = await fetch(`${BASE_URL}/api/resume/match-analysis`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.status === 422 && data.errorCode === "cv_missing") { setStatus("cv_missing"); return; }
      if (res.status === 422 && data.errorCode === "no_scores")  { setStatus("no_scores");  return; }
      if (!res.ok) { setErrorMsg(data.error || "Analysis failed."); setStatus("error"); return; }
      setAnalysis(data as CvAnalysis);
      setStatus("done");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  useEffect(() => { runAnalysis(); }, []);

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);
    const token = localStorage.getItem("sm_auth_token");
    try {
      const res = await fetch(`${BASE_URL}/api/resume/store-cv`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || "Upload failed."); setStatus("error"); return; }
      await runAnalysis();
    } catch {
      setErrorMsg("Upload failed. Please try again.");
      setStatus("error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const alignColor = (n: number) =>
    n >= 75 ? "text-emerald-700" : n >= 55 ? "text-amber-700" : "text-red-700";
  const alignBg = (n: number) =>
    n >= 75 ? "bg-emerald-500" : n >= 55 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-0.5">
          <Sparkles className="w-4 h-4 text-accent" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">AI-Powered</p>
        </div>
        <p className="text-sm font-bold text-primary">Match Analysis</p>
      </div>

      <div className="p-5 space-y-5">

        {/* Loading */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-primary">Analysing your profile…</p>
              <p className="text-xs text-slate-400 mt-1">Comparing CV against assessment scores and job requirements.</p>
            </div>
          </div>
        )}

        {/* No CV stored — upload prompt */}
        {status === "cv_missing" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              <FileUp className="w-4 h-4 mt-0.5 shrink-0" />
              <p>No CV on file yet. Upload your CV once and all future analyses will run automatically.</p>
            </div>
            <div
              className="border-2 border-dashed border-slate-200 hover:border-primary/30 hover:bg-slate-50/60 rounded-xl p-6 flex flex-col items-center gap-3 text-center cursor-pointer transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                {uploading
                  ? <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  : <FileUp className="w-6 h-6 text-slate-400" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{uploading ? "Uploading…" : "Click to upload your CV"}</p>
                <p className="text-xs text-slate-400 mt-0.5">PDF or DOCX · max 10 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleCvUpload}
                disabled={uploading}
              />
            </div>
          </div>
        )}

        {/* No scores yet */}
        {status === "no_scores" && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>No assessment results found. Complete at least one assessment to unlock match analysis.</p>
          </div>
        )}

        {/* General error */}
        {status === "error" && errorMsg && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="flex-1">{errorMsg}</p>
            </div>
            <button
              onClick={runAnalysis}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-primary/30 hover:text-primary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {status === "done" && analysis && (
          <div className="space-y-5">

            {/* Job context badge */}
            {(analysis.jobsMatched ?? 0) > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-lg">
                <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-xs text-primary font-medium">
                  Benchmarked against {analysis.jobsMatched} active recruiter job posting{analysis.jobsMatched !== 1 ? "s" : ""} in your industry
                </p>
              </div>
            )}

            {/* Overall alignment gauge */}
            <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="shrink-0 text-center">
                <div className={cn("text-4xl font-display font-bold tabular-nums", alignColor(analysis.overallAlignment))}>
                  {analysis.overallAlignment}%
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Match Score</div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", alignBg(analysis.overallAlignment))}
                    style={{ width: `${analysis.overallAlignment}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{analysis.summary}</p>
              </div>
            </div>

            {/* CV Profile snapshot */}
            {analysis.cvProfile && Object.values(analysis.cvProfile).some(Boolean) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {analysis.cvProfile.industry && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Industry</p>
                    <p className="text-xs font-semibold text-blue-800 mt-0.5">{analysis.cvProfile.industry}</p>
                  </div>
                )}
                {analysis.cvProfile.role && (
                  <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wide">Role</p>
                    <p className="text-xs font-semibold text-violet-800 mt-0.5">{analysis.cvProfile.role}</p>
                  </div>
                )}
                {analysis.cvProfile.level && (
                  <div className="bg-cyan-50 border border-cyan-100 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">Level</p>
                    <p className="text-xs font-semibold text-cyan-800 mt-0.5">{analysis.cvProfile.level}</p>
                  </div>
                )}
                {analysis.cvProfile.yearsExperience && (
                  <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">Experience</p>
                    <p className="text-xs font-semibold text-orange-800 mt-0.5">
                      {/^\d+$/.test(String(analysis.cvProfile.yearsExperience).trim())
                        ? `${analysis.cvProfile.yearsExperience} years`
                        : analysis.cvProfile.yearsExperience}
                    </p>
                  </div>
                )}
                {analysis.cvProfile.topSkills && analysis.cvProfile.topSkills.length > 0 && (
                  <div className="col-span-2 sm:col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Top Skills from CV</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.cvProfile.topSkills.map(s => (
                        <span key={s} className="text-[11px] px-2 py-0.5 bg-primary/8 text-primary rounded-full font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirmed Strengths */}
            {analysis.confirmedStrengths.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-bold text-slate-700">Confirmed Strengths</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                    CV + Assessment agree
                  </span>
                </div>
                <div className="space-y-2.5">
                  {analysis.confirmedStrengths.map((s, i) => (
                    <div key={i} className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-bold text-emerald-800">{s.skill}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                          {s.assessmentCategory}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 italic">"{s.cvEvidence}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gap Areas */}
            {analysis.gapAreas.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <p className="text-sm font-bold text-slate-700">Areas to Address</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                    Development opportunities
                  </span>
                </div>
                <div className="space-y-2.5">
                  {analysis.gapAreas.map((g, i) => (
                    <div key={i} className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                      <p className="text-sm font-bold text-amber-800">{g.area}</p>
                      {g.cvClaim && (
                        <p className="text-xs text-amber-700 italic">CV states: "{g.cvClaim}"</p>
                      )}
                      <p className="text-xs text-amber-800 leading-relaxed">{g.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  <p className="text-sm font-bold text-slate-700">Recommended Actions</p>
                </div>
                <div className="space-y-2">
                  {analysis.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-xs text-orange-900 leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={runAnalysis}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Re-analyse
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-primary/30 hover:text-primary transition-colors"
              >
                <FileUp className="w-3.5 h-3.5" /> Update CV
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleCvUpload}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   APPLICANT REPORT
══════════════════════════════════════════════════════ */
function ApplicantReport({
  locked, applicant, scores, hasProfile, hasResults,
}: {
  locked: boolean;
  applicant?: ApplicantData | null;
  scores?: ScoreItem[];
  hasProfile: boolean;
  hasResults: boolean;
}) {
  const app = applicant ?? SAMPLE_APPLICANT;
  const displayScores: ScoreItem[] = scores ?? SAMPLE_SCORES.map(s => ({ ...s, taken: true }));
  const takenScores = displayScores.filter(s => s.taken && s.score > 0);
  const overall = takenScores.length > 0
    ? Math.round(takenScores.reduce((sum, s) => sum + s.score, 0) / takenScores.length)
    : OVERALL;
  const isReal = hasProfile && hasResults;

  return (
    <div className="space-y-5">

      {/* ── No profile CTA ── */}
      {!hasProfile && (
        <div className="bg-white border border-dashed border-primary/30 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <UserCircle className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-display font-bold text-primary mb-1">No profile registered yet</h3>
            <p className="text-sm text-slate-500">
              The sample report below shows what your personalised results will look like.
              Create your applicant profile, complete the assessments, and your real scores will replace it automatically.
            </p>
          </div>
          <Link
            href="/apply"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Create Profile <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Profile exists but no assessments taken yet ── */}
      {hasProfile && !hasResults && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-amber-900 mb-0.5">Profile registered — assessments pending</h3>
            <p className="text-sm text-amber-800">
              Complete your assessments to generate your personalised score report. The sample below is a preview.
            </p>
          </div>
          <Link
            href="/assessment"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent/90 transition-colors"
          >
            Take Assessment <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Report Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-sm tracking-wide uppercase">SwiftMatch Assessment Report</span>
            {!isReal && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Sample</span>
            )}
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
              {isReal && (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-bold">
                    <Award className="w-3.5 h-3.5" /> {RANK}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold">
                    {PERCENTILE}
                  </span>
                </div>
              )}
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
              <span className="text-lg font-display font-bold text-primary">
                {takenScores.length > 0 ? `${overall}%` : "—"}
              </span>
            </div>
            <div className="h-3 bg-white border border-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all"
                style={{ width: `${takenScores.length > 0 ? overall : OVERALL}%` }}
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
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={displayScores.map(s => ({ subject: s.short, score: s.score, fullMark: 100 }))}>
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
              {displayScores.map(cat => (
                <div key={cat.key} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{cat.label}</p>
                    {cat.taken ? (
                      <div className="mt-1.5"><MiniBar score={cat.score} color={cat.color} /></div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5 italic">Not taken yet</p>
                    )}
                  </div>
                  {cat.taken
                    ? <ScoreBadge score={cat.score} size="sm" />
                    : <span className="text-xs text-slate-400 font-medium">—</span>
                  }
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Overall</span>
              {takenScores.length > 0
                ? <ScoreBadge score={overall} size="md" />
                : <span className="text-sm text-slate-400 font-medium">—</span>
              }
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
                data={displayScores.map(s => ({
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
                  {displayScores.map(s => (
                    <th key={s.key} className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{s.short}</th>
                  ))}
                  <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Overall</th>
                  {isReal && <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Rank</th>}
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
                  {displayScores.map(s => (
                    <td key={s.key} className="text-center px-3 py-3.5">
                      {s.taken ? <ScoreBadge score={s.score} size="sm" /> : <span className="text-xs text-slate-400">—</span>}
                    </td>
                  ))}
                  <td className="text-center px-3 py-3.5">
                    {takenScores.length > 0 ? <ScoreBadge score={overall} size="sm" /> : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  {isReal && (
                    <td className="text-center px-3 py-3.5">
                      <span className="text-xs font-bold text-primary">{RANK}</span>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </LockOverlay>

      {/* ── Career Expansion ── */}
      {(() => {
        const suggestions = getExpansionSuggestions(displayScores, app.industry);
        return (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-0.5">
                <Compass className="w-4 h-4 text-accent" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Career Expansion</p>
              </div>
              <p className="text-sm font-bold text-primary">Other Industries You Could Thrive In</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Based on your assessment profile — your strongest scores and transferable skills point to strong crossover in these industries.
              </p>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              {suggestions.map(s => (
                <div
                  key={s.industry}
                  className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-primary/30 hover:bg-primary/[0.02] transition-all"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl leading-none">{s.emoji}</span>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-tight">{s.industry}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{s.keyStrength}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "shrink-0 text-xs font-bold px-2.5 py-1 rounded-full",
                      s.match >= 88 ? "bg-emerald-100 text-emerald-700" :
                      s.match >= 78 ? "bg-blue-100 text-blue-700" :
                                      "bg-amber-100 text-amber-700"
                    )}>
                      {s.match}% match
                    </span>
                  </div>

                  {/* Reason */}
                  <p className="text-xs text-slate-600 leading-relaxed">{s.reason}</p>

                  {/* Score driver pill */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Driven by</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                      s.scoreDriver === "ke"  ? "bg-blue-100 text-blue-700" :
                      s.scoreDriver === "pw"  ? "bg-violet-100 text-violet-700" :
                      s.scoreDriver === "cf"  ? "bg-orange-100 text-orange-700" :
                      s.scoreDriver === "ct"  ? "bg-cyan-100 text-cyan-700" :
                                                "bg-green-100 text-green-700"
                    )}>
                      {s.scoreDriver === "ke" ? "Knowledge & Expertise" :
                       s.scoreDriver === "pw" ? "Personality & Work Style" :
                       s.scoreDriver === "cf" ? "Cultural Fit" :
                       s.scoreDriver === "ct" ? "Critical Thinking" : "AI Readiness"}
                    </span>
                  </div>

                  {/* Roles to explore */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Roles to explore</p>
                    <div className="flex flex-wrap gap-1.5">
                      {s.roles.map(r => (
                        <span key={r} className="text-[11px] px-2.5 py-0.5 bg-primary/8 text-primary rounded-full font-medium">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── CV Match Analysis (only shown for real applicants with results) ── */}
      {isReal && <CvMatchAnalysis />}

    </div>
  );
}

/* ══════════════════════════════════════════════════════
   JOB MATCH TYPES & ALGORITHM
══════════════════════════════════════════════════════ */
interface Job {
  id: number; title: string; company: string; location: string;
  industry: string; description: string; requirements: string[];
  companyDescription: string; salaryRange: string;
}

interface MatchBreakdown {
  total: number; industry: number; role: number; level: number; assessment: number;
}

function computeJobMatch(c: CandidateRow, job: Job): MatchBreakdown {
  /* ── 1. Industry alignment (25%) ── */
  const cInd = c.industry.toLowerCase();
  const jInd = (job.industry ?? "").toLowerCase();
  let industryScore = 0;
  if (cInd === jInd) {
    industryScore = 100;
  } else if (cInd.includes(jInd) || jInd.includes(cInd)) {
    industryScore = 75;
  } else {
    const clusters: string[][] = [
      ["tech","it","software","digital","data","ai","cloud"],
      ["finance","banking","fintech","accounting","investment","capital"],
      ["health","medical","nursing","clinical","hospital","pharma"],
      ["marketing","advertising","creative","brand","media","arts"],
      ["retail","ecommerce","consumer","sales","fmcg"],
      ["education","training","academ"],
      ["construction","engineering","manufacturing","industrial"],
    ];
    const clusterOf = (s: string) => clusters.findIndex(kws => kws.some(k => s.includes(k)));
    if (clusterOf(cInd) !== -1 && clusterOf(cInd) === clusterOf(jInd)) industryScore = 50;
  }

  /* ── 2. Role / keyword match (20%) ── */
  const cRole = c.role.toLowerCase();
  const reqBlob = (job.requirements ?? []).join(" ").toLowerCase();
  const jobBlob = `${job.title} ${reqBlob}`.toLowerCase();
  const cTokens = cRole.split(/[\s,\/\-–|()]+/).filter(t => t.length > 3);
  const jTokenSet = new Set(jobBlob.split(/\W+/).filter(t => t.length > 3));
  const forward = cTokens.length > 0
    ? cTokens.filter(t => jTokenSet.has(t)).length / cTokens.length
    : 0;
  const jTitleTokens = job.title.toLowerCase().split(/\W+/).filter(t => t.length > 3);
  const reverse = jTitleTokens.length > 0
    ? jTitleTokens.filter(t => cRole.includes(t)).length / jTitleTokens.length
    : 0;
  const roleScore = Math.min(100, Math.round(Math.max(forward, reverse) * 130));

  /* ── 3. Career-level fit (10%) ── */
  const levelTier = (s: string): number => {
    const l = s.toLowerCase();
    if (l.includes("entry") || l.includes("fresh") || l.includes("junior") || l.includes("graduate")) return 1;
    if (l.includes("mid") || l.includes("associate") || l.includes("intermediate")) return 2;
    if (l.includes("senior") || l.includes("experienced") || l.includes("specialist")) return 3;
    if (l.includes("lead") || l.includes("manager") || l.includes("principal")) return 4;
    if (l.includes("director") || l.includes("executive") || l.includes("vp") || l.includes("head")) return 5;
    return 2;
  };
  const cTier = levelTier(c.level);
  const yearsMatch = reqBlob.match(/(\d+)\+?\s*years?/);
  const reqYears = yearsMatch ? parseInt(yearsMatch[1]) : null;
  let levelScore = 60;
  if (reqYears !== null) {
    const reqTier = reqYears <= 1 ? 1 : reqYears <= 3 ? 2 : reqYears <= 6 ? 3 : reqYears <= 10 ? 4 : 5;
    const diff = Math.abs(cTier - reqTier);
    levelScore = diff === 0 ? 100 : diff === 1 ? 72 : diff === 2 ? 44 : 15;
  }

  /* ── 4. Assessment score, industry-weighted (45%) ── */
  const iL = jInd;
  let w: number[]; // [ke, pw, cf, ct, air]
  if (iL.includes("tech") || iL.includes("software") || iL.includes("it") || iL.includes("data") || iL.includes("ai")) {
    w = [0.38, 0.06, 0.06, 0.30, 0.20];
  } else if (iL.includes("health") || iL.includes("medical") || iL.includes("nurs") || iL.includes("clinic")) {
    w = [0.44, 0.26, 0.20, 0.10, 0.00];
  } else if (iL.includes("financ") || iL.includes("bank") || iL.includes("account") || iL.includes("invest")) {
    w = [0.34, 0.06, 0.10, 0.40, 0.10];
  } else if (iL.includes("market") || iL.includes("creative") || iL.includes("art") || iL.includes("brand")) {
    w = [0.18, 0.28, 0.26, 0.18, 0.10];
  } else if (iL.includes("educat") || iL.includes("train")) {
    w = [0.30, 0.28, 0.22, 0.15, 0.05];
  } else {
    w = [0.20, 0.20, 0.20, 0.20, 0.20];
  }
  const takenWeightSum = c.scores.reduce((s, sc, i) => s + (sc.taken ? w[i] : 0), 0);
  const assessmentScore = takenWeightSum > 0
    ? Math.round(c.scores.reduce((s, sc, i) => s + (sc.taken ? sc.score * w[i] : 0), 0) / takenWeightSum)
    : 0;

  const total = Math.round(
    industryScore * 0.25 +
    roleScore     * 0.20 +
    levelScore    * 0.10 +
    assessmentScore * 0.45
  );

  return { total, industry: industryScore, role: roleScore, level: levelScore, assessment: assessmentScore };
}

/* ══════════════════════════════════════════════════════
   EMPLOYER REPORT
══════════════════════════════════════════════════════ */
interface CandidateRow {
  id: number;
  name: string; email: string; industry: string; role: string; level: string; date: string;
  scores: ScoreItem[];
  overall: number;
}

function EmployerReport({ locked, isPremium }: { locked: boolean; isPremium: boolean }) {
  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [loadingPool, setLoadingPool] = useState(true);
  const [selected, setSelected]       = useState<CandidateRow | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [poolMode, setPoolMode]           = useState<"pool" | "match">("pool");
  const [jobs, setJobs]                   = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs]     = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("sm_auth_token");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${BASE_URL}/api/applicants`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(async (applicants: any[]) => {
        const rows: CandidateRow[] = await Promise.all(
          applicants.map(async (app) => {
            const results: { assessmentTitle: string; score: number }[] =
              await fetch(`${BASE_URL}/api/assessments/applicant/${app.id}/results`, { headers })
                .then(r => r.ok ? r.json() : []).catch(() => []);
            const scores = mapResultsToScores(results);
            const taken  = scores.filter(s => s.taken && s.score > 0);
            const overall = taken.length > 0
              ? Math.round(taken.reduce((sum, s) => sum + s.score, 0) / taken.length)
              : 0;
            const fullName = [app.firstName, app.lastName].filter(Boolean).join(" ");
            return {
              id: app.id,
              name: fullName || app.email,
              email: app.email,
              industry: app.targetIndustry ?? "—",
              role: Array.isArray(app.targetRole) ? (app.targetRole.length > 0 ? app.targetRole.join(", ") : "—") : (app.targetRole ?? "—"),
              level: app.careerLevel ?? "—",
              date: new Date(app.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
              scores,
              overall,
            };
          })
        );
        rows.sort((a, b) => b.overall - a.overall);
        setCandidates(rows);
        setLoadingPool(false);
      })
      .catch(() => setLoadingPool(false));
  }, []);

  /* ── Fetch jobs when switching to match mode ── */
  useEffect(() => {
    if (poolMode !== "match" || jobs.length > 0) return;
    setLoadingJobs(true);
    const token = localStorage.getItem("sm_auth_token");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${BASE_URL}/api/jobs`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then((data: any) => {
        const list: Job[] = Array.isArray(data) ? data : (data.jobs ?? []);
        setJobs(list);
        if (list.length > 0) setSelectedJobId(list[0].id);
        setLoadingJobs(false);
      })
      .catch(() => setLoadingJobs(false));
  }, [poolMode]);

  const scored   = candidates.filter(c => c.overall > 0);
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((s, c) => s + c.overall, 0) / scored.length)
    : 0;

  const selectedJob = jobs.find(j => j.id === selectedJobId) ?? null;

  const matchedCandidates: (CandidateRow & { match: MatchBreakdown })[] = selectedJob
    ? candidates
        .map(c => ({ ...c, match: computeJobMatch(c, selectedJob) }))
        .sort((a, b) => b.match.total - a.match.total)
    : [];

  const COLORS = ["#1d4ed8","#7c3aed","#ea580c","#0891b2","#16a34a"];

  /* ── Drill-down: selected applicant's full report ── */
  if (selected) {
    const hasResults = selected.scores.some(s => s.taken);
    return (
      <div className="space-y-5">
        {/* Back bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Candidate Pool
          </button>
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">Viewing report for <strong className="text-slate-600">{selected.name}</strong></span>
        </div>

        <ApplicantReport
          locked={!isPremium}
          applicant={{ name: selected.name, email: selected.email, industry: selected.industry, role: selected.role, level: selected.level, date: selected.date }}
          scores={selected.scores}
          hasProfile={true}
          hasResults={hasResults}
        />
      </div>
    );
  }

  /* ── Pool view ── */
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
            {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        <div className="px-6 py-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">{loadingPool ? "…" : candidates.length}</p>
            <p className="text-xs text-slate-500">Total Applicants</p>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden sm:block" />
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">{loadingPool ? "…" : (avgScore > 0 ? `${avgScore}%` : "—")}</p>
            <p className="text-xs text-slate-500">Avg Score</p>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden sm:block" />
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">{loadingPool ? "…" : scored.length}</p>
            <p className="text-xs text-slate-500">Assessed</p>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden sm:block" />
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-primary">{loadingPool ? "…" : (candidates.length - scored.length)}</p>
            <p className="text-xs text-slate-500">Pending Assessment</p>
          </div>

          {/* View mode toggle */}
          <div className="ml-auto flex gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setPoolMode("pool")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                poolMode === "pool" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-primary"
              )}
            >
              <ClipboardList className="w-3.5 h-3.5" /> Pool Rankings
            </button>
            <button
              onClick={() => setPoolMode("match")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                poolMode === "match" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-primary"
              )}
            >
              <Target className="w-3.5 h-3.5" /> Job Match
            </button>
          </div>
        </div>
      </div>

      {loadingPool ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Loading candidate pool…
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-10 flex flex-col items-center gap-3 text-center">
          <UserCircle className="w-10 h-10 text-slate-300" />
          <p className="font-semibold text-slate-500">No applicants yet</p>
          <p className="text-xs text-slate-400">Applicants who complete their profile will appear here.</p>
        </div>
      ) : poolMode === "pool" ? (
        <LockOverlay locked={locked}>
          {/* Candidate Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 pt-4 pb-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Candidate Pool</p>
              <p className="text-sm font-bold text-primary mt-0.5">Ranked by Overall Assessment Score · Click any row to view full report</p>
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
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide w-32">Profile</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide w-28"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map((c, idx) => {
                    const rank = idx + 1;
                    const scoreVals = c.scores.map(s => s.score);
                    return (
                      <tr
                        key={c.id}
                        className={cn(
                          "hover:bg-primary/[0.03] transition-colors cursor-pointer",
                          rank === 1 && "bg-blue-50/40"
                        )}
                        onClick={() => { if (!locked) setSelected(c); }}
                      >
                        <td className="text-center px-4 py-3.5">
                          <span className={cn(
                            "text-sm font-display font-bold",
                            rank === 1 ? "text-primary" : rank <= 3 ? "text-slate-600" : "text-slate-400"
                          )}>#{rank}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              rank === 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                            )}>
                              {c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm leading-tight">{c.name}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{c.role !== "—" ? c.role : c.email}</p>
                            </div>
                          </div>
                        </td>
                        {c.scores.map((s, i) => (
                          <td key={i} className="text-center px-3 py-3.5">
                            {s.taken ? <ScoreBadge score={s.score} size="sm" /> : <span className="text-xs text-slate-300">—</span>}
                          </td>
                        ))}
                        <td className="text-center px-3 py-3.5">
                          {c.overall > 0 ? <ScoreBadge score={c.overall} size="md" /> : <span className="text-xs text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3.5 w-32">
                          <div className="space-y-0.5">
                            {scoreVals.map((score, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: COLORS[i] }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            onClick={e => { e.stopPropagation(); if (!locked) setSelected(c); }}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                              locked
                                ? "text-slate-300 border border-slate-100 cursor-not-allowed"
                                : "text-primary border border-primary/30 hover:bg-primary/5"
                            )}
                          >
                            <User className="w-3 h-3" /> View Report
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
              <p className="text-xs text-slate-400">K&E = Knowledge & Expertise · P&W = Personality & Work Style · C.Fit = Cultural Fit · C.Think = Critical Thinking · AI.R = AI Readiness</p>
            </div>
          </div>

          {/* Radar comparison (top candidate vs pool average) */}
          {scored.length >= 1 && (() => {
            const top = candidates[0];
            const avgScores = SCORE_DEFS.map((def, i) => {
              const vals = scored.map(c => c.scores[i]?.score ?? 0).filter(v => v > 0);
              return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
            });
            return (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 pt-4 pb-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category Analysis</p>
                  <p className="text-sm font-bold text-primary mt-0.5">Pool Average vs Top Candidate — Radar Comparison</p>
                </div>
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart cx="50%" cy="50%" outerRadius="72%"
                      data={SCORE_DEFS.map((def, i) => ({
                        subject: def.short,
                        "Top Candidate": top.scores[i]?.score ?? 0,
                        "Pool Average": avgScores[i],
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
            );
          })()}
        </LockOverlay>
      ) : (
        /* ══════════════════════════════════════════════════════
           JOB MATCH ANALYSIS VIEW
        ══════════════════════════════════════════════════════ */
        <LockOverlay locked={locked}>
          <div className="space-y-4">
            {/* Job selector */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Job Match Analysis</p>
                  <p className="text-sm font-bold text-primary mt-0.5">Candidates ranked by compatibility with a specific job posting</p>
                </div>
                {loadingJobs ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Loading jobs…
                  </div>
                ) : jobs.length === 0 ? (
                  <p className="text-xs text-slate-400">No job postings found.</p>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedJobId ?? ""}
                      onChange={e => setSelectedJobId(Number(e.target.value))}
                      className="appearance-none pl-9 pr-8 py-2 text-sm font-semibold text-primary bg-primary/5 border border-primary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                    >
                      {jobs.map(j => (
                        <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                      ))}
                    </select>
                    <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60 pointer-events-none" />
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/60 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Job detail card */}
              {selectedJob && (
                <div className="px-5 py-4 flex flex-wrap gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-slate-800 text-base leading-tight">{selectedJob.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{selectedJob.company}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/8 text-primary text-[11px] font-semibold rounded-md">
                            🏢 {selectedJob.industry}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md">
                            <MapPin className="w-3 h-3" /> {selectedJob.location}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md">
                            💰 {selectedJob.salaryRange}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed line-clamp-2">{selectedJob.description}</p>
                  </div>
                  {selectedJob.requirements.length > 0 && (
                    <div className="w-full sm:w-64 shrink-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Key Requirements</p>
                      <ul className="space-y-1">
                        {selectedJob.requirements.slice(0, 5).map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                        {selectedJob.requirements.length > 5 && (
                          <li className="text-[11px] text-slate-400">+{selectedJob.requirements.length - 5} more…</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Scoring legend */}
              {selectedJob && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide w-full mb-0.5">Match score factors</p>
                  {[
                    { label: "Industry alignment", pct: "25%" },
                    { label: "Role compatibility", pct: "20%" },
                    { label: "Career level fit", pct: "10%" },
                    { label: "Assessment scores (industry-weighted)", pct: "45%" },
                  ].map(f => (
                    <span key={f.label} className="text-[11px] text-slate-500">
                      <span className="font-semibold text-primary">{f.pct}</span> {f.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Match table */}
            {selectedJob && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide w-12">Rank</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Applicant</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Match %</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Industry</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Role</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Level</th>
                        <th className="text-center px-3 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Scores</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide w-28"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matchedCandidates.map((c, idx) => {
                        const rank = idx + 1;
                        const m = c.match;
                        const matchColor = m.total >= 75 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                          : m.total >= 50 ? "text-amber-600 bg-amber-50 border-amber-200"
                          : "text-slate-500 bg-slate-50 border-slate-200";
                        const barColor = m.total >= 75 ? "#059669" : m.total >= 50 ? "#d97706" : "#94a3b8";
                        const factorBadge = (val: number) => val >= 75 ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600"><CheckCircle2 className="w-3 h-3" />{val}%</span>
                        ) : val >= 40 ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-500"><MinusCircle className="w-3 h-3" />{val}%</span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400"><MinusCircle className="w-3 h-3" />{val}%</span>
                        );
                        return (
                          <tr
                            key={c.id}
                            className={cn(
                              "hover:bg-primary/[0.03] transition-colors cursor-pointer",
                              rank === 1 && "bg-blue-50/40"
                            )}
                            onClick={() => { if (!locked) setSelected(c); }}
                          >
                            <td className="text-center px-4 py-3.5">
                              <span className={cn(
                                "text-sm font-display font-bold",
                                rank === 1 ? "text-primary" : rank <= 3 ? "text-slate-600" : "text-slate-400"
                              )}>#{rank}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                                  rank === 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                                )}>
                                  {c.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm leading-tight">{c.name}</p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{c.industry !== "—" ? c.industry : c.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="text-center px-3 py-3.5">
                              <div className="flex flex-col items-center gap-1">
                                <span className={cn("text-sm font-display font-bold px-2.5 py-0.5 rounded-lg border text-sm", matchColor)}>
                                  {m.total}%
                                </span>
                                <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all" style={{ width: `${m.total}%`, backgroundColor: barColor }} />
                                </div>
                              </div>
                            </td>
                            <td className="text-center px-3 py-3.5">{factorBadge(m.industry)}</td>
                            <td className="text-center px-3 py-3.5">{factorBadge(m.role)}</td>
                            <td className="text-center px-3 py-3.5">{factorBadge(m.level)}</td>
                            <td className="text-center px-3 py-3.5">
                              {c.overall > 0 ? <ScoreBadge score={m.assessment} size="sm" /> : <span className="text-xs text-slate-300">—</span>}
                            </td>
                            <td className="px-4 py-3.5">
                              <button
                                onClick={e => { e.stopPropagation(); if (!locked) setSelected(c); }}
                                className={cn(
                                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                                  locked
                                    ? "text-slate-300 border border-slate-100 cursor-not-allowed"
                                    : "text-primary border border-primary/30 hover:bg-primary/5"
                                )}
                              >
                                <User className="w-3 h-3" /> View Report
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 items-center">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Strong match ≥ 75%</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Good match ≥ 50%</span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Partial match &lt; 50%</span>
                </div>
              </div>
            )}
          </div>
        </LockOverlay>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
type ApplicationRow = {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  industry: string;
  status: string;
  keScore: number | null;
  customScore: number | null;
  customCorrectCount: number | null;
  customTotalCount: number | null;
  createdAt: string;
};

function MyJobApplications() {
  const [apps, setApps] = useState<ApplicationRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sm_auth_token");
    if (!token) { setLoading(false); return; }
    fetch(`${BASE_URL}/api/jobs/applications/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : []))
      .then((data: ApplicationRow[]) => setApps(Array.isArray(data) ? data : []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !apps || apps.length === 0) return null;

  return (
    <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg font-bold text-primary">My Job Applications</h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Your scores per job, including any recruiter-specific custom assessments.
      </p>
      <div className="space-y-3">
        {apps.map(a => (
          <div key={a.id} className="border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{a.jobTitle}</div>
              <div className="text-xs text-slate-500 truncate">{a.company} • {a.industry}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.keScore !== null && (
                <div className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                  K&E {a.keScore}%
                </div>
              )}
              {a.customScore !== null ? (
                <div className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold flex items-center gap-1.5">
                  <ClipboardList className="w-3 h-3" />
                  Custom {a.customScore}%
                  {a.customCorrectCount !== null && a.customTotalCount !== null && (
                    <span className="text-accent/70 font-normal">
                      ({a.customCorrectCount}/{a.customTotalCount})
                    </span>
                  )}
                </div>
              ) : (
                <Link href={`/custom-assessment?jobId=${a.jobId}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200">
                  Take custom assessment
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ResultsPage() {
  const [audience, setAudience] = useState<Audience>("applicant");
  const { user } = useAuth();
  const hasSubscription = localStorage.getItem("sm_subscription") === "active";
  const isPremium = hasSubscription || isOwnerEmail(user?.email);

  // Real data state
  const [profileData, setProfileData] = useState<ApplicantData | null>(null);
  const [profileScores, setProfileScores] = useState<ScoreItem[] | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const applicantId = localStorage.getItem("sm_applicant_id");
    if (!applicantId) {
      setHasProfile(false);
      setDataLoading(false);
      return;
    }

    const token = localStorage.getItem("sm_auth_token");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`${BASE_URL}/api/applicants/${applicantId}`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${BASE_URL}/api/assessments/applicant/${applicantId}/results`, { headers }).then(r => r.ok ? r.json() : []),
    ]).then(([applicant, results]) => {
      if (!applicant) {
        setHasProfile(false);
        setDataLoading(false);
        return;
      }
      setHasProfile(true);

      const fullName = [applicant.firstName, applicant.middleName, applicant.lastName, applicant.suffix]
        .filter(Boolean).join(" ");
      const dateStr = new Date(applicant.createdAt).toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric",
      });

      setProfileData({
        name: fullName || applicant.email,
        email: applicant.email,
        industry: applicant.targetIndustry ?? "Technology / IT",
        role: Array.isArray(applicant.targetRole) ? (applicant.targetRole.length > 0 ? applicant.targetRole.join(", ") : "Professional") : (applicant.targetRole ?? "Professional"),
        level: "Registered Applicant",
        date: dateStr,
      });

      if (Array.isArray(results) && results.length > 0) {
        setHasResults(true);
        setProfileScores(mapResultsToScores(results));
      } else {
        setHasResults(false);
        setProfileScores(null);
      }
      setDataLoading(false);
    }).catch(() => {
      setHasProfile(false);
      setDataLoading(false);
    });
  }, []);

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

        {dataLoading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 text-sm gap-3">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Loading your report…
          </div>
        ) : audience === "applicant"
          ? <>
              <ApplicantReport
                locked={!isPremium}
                applicant={profileData}
                scores={profileScores ?? undefined}
                hasProfile={hasProfile}
                hasResults={hasResults}
              />
              <MyJobApplications />
            </>
          : <EmployerReport locked={!isPremium} isPremium={isPremium} />
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
