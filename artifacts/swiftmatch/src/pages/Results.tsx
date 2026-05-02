import { useState } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { cn } from "@/lib/utils";
import {
  Lock, Crown, ChevronRight, User, Building2,
  FileText, Award, TrendingUp, Calendar, Download, Compass,
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

function getExpansionSuggestions(scores: typeof SAMPLE_SCORES, industry: string) {
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

      {/* ── Career Expansion ── */}
      {(() => {
        const suggestions = getExpansionSuggestions(SAMPLE_SCORES, app.industry);
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
