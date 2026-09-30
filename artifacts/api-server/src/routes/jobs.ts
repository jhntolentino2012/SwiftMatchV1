import { Router, type IRouter } from "express";
import { db, jobsTable, jobApplicationsTable, applicantsTable } from "@workspace/db";
import type { CustomQuestion } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { GetJobParams } from "@workspace/api-zod";
import { requireVerifiedUser as requireAuth, requireReportSubscription, requireCandidatePool } from "../middlewares/report-access";
import { isOwnerEmail } from "../lib/owner";

const router: IRouter = Router();

/** Strip recruiter answer keys from a job object before sending to public/applicant clients. */
function stripJobAnswerKeys<T extends { customQuestions?: CustomQuestion[] | null }>(job: T): T {
  if (!job.customQuestions || job.customQuestions.length === 0) return job;
  return {
    ...job,
    customQuestions: job.customQuestions.map(q => {
      const { correctAnswers: _ca, ...rest } = q as CustomQuestion;
      return rest as unknown as CustomQuestion;
    }),
  };
}

function sanitizeCustomQuestions(raw: unknown[]): CustomQuestion[] {
  const out: CustomQuestion[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const q = item as Record<string, unknown>;
    const text = typeof q.text === "string" ? q.text.trim() : "";
    const type = q.type === "multiple_choice" || q.type === "text" ? q.type : null;
    if (!text || !type) continue;
    const correctAnswers = Array.isArray(q.correctAnswers)
      ? (q.correctAnswers as unknown[]).filter((s): s is string => typeof s === "string" && s.trim() !== "").map(s => s.trim())
      : [];
    if (correctAnswers.length === 0) continue;
    const options = type === "multiple_choice" && Array.isArray(q.options)
      ? (q.options as unknown[]).filter((s): s is string => typeof s === "string" && s.trim() !== "").map(s => s.trim())
      : undefined;
    if (type === "multiple_choice" && (!options || options.length < 2)) continue;
    const id = typeof q.id === "string" && q.id ? q.id : `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const points = typeof q.points === "number" && q.points > 0 ? q.points : 1;
    const cq: CustomQuestion = { id, text, type, correctAnswers, points };
    if (options) cq.options = options;
    out.push(cq);
  }
  return out;
}

const SEED_JOBS = [
  {
    title: "Senior Software Engineer",
    company: "TechCorp Solutions",
    location: "Makati City, Philippines",
    description: "We're looking for a seasoned software engineer to lead development of our core platform. You'll design scalable systems, mentor junior devs, and drive technical excellence across the full stack. The ideal candidate thrives in an agile environment, writes clean maintainable code, and is passionate about building products that scale to millions of users.",
    requirements: ["5+ years of software development experience", "Proficiency in TypeScript/JavaScript", "Experience with React and Node.js", "Strong understanding of databases", "Excellent communication skills"],
    salaryRange: "PHP 80,000 - 120,000/month",
    industry: "Technology",
    companyDescription: "TechCorp Solutions is a leading Philippine software development company founded in 2012. We build enterprise-grade platforms for clients across banking, logistics, and retail. With a team of 200+ engineers spread across Makati, Cebu, and fully remote setups, we pride ourselves on a culture of continuous learning, open collaboration, and shipping products that matter. We offer competitive compensation, HMO from day one, and a professional development budget for every employee.",
    isDemo: true,
  },
  {
    title: "Digital Marketing Specialist",
    company: "BrandBoost Agency",
    location: "BGC, Taguig, Philippines",
    description: "Drive our clients' digital presence through innovative marketing strategies. You'll manage end-to-end campaigns across social media, email, and paid advertising channels, report on performance metrics, and continuously optimise for ROI. This is a high-ownership role where your ideas directly shape brand narratives for some of the Philippines' most recognisable companies.",
    requirements: ["3+ years in digital marketing", "Experience with Google Ads and Meta Ads", "Strong analytical skills", "Content creation abilities", "Knowledge of SEO/SEM"],
    salaryRange: "PHP 35,000 - 55,000/month",
    industry: "Marketing",
    companyDescription: "BrandBoost Agency is a full-service digital marketing agency headquartered in BGC, Taguig. Since 2016 we have helped over 80 Filipino and multinational brands grow their online presence, from nimble startups to Fortune 500 subsidiaries. Our team of 60 creatives, strategists, and data analysts works in an open-office studio designed to spark collaboration. We celebrate wins loudly, learn from failures openly, and give every team member real creative ownership.",
    isDemo: true,
  },
  {
    title: "Registered Nurse",
    company: "MedCare Hospital",
    location: "Quezon City, Philippines",
    description: "Join our dedicated healthcare team providing compassionate, patient-centred care. You will be responsible for administering medications, monitoring patient progress, coordinating with physicians, and educating patients and families on health management. We offer structured career growth paths and mentorship from senior clinical staff.",
    requirements: ["Active PRC nursing license", "BLS/ACLS certified", "Strong patient care skills", "Experience in clinical settings", "Excellent interpersonal skills"],
    salaryRange: "PHP 25,000 - 40,000/month",
    industry: "Healthcare",
    companyDescription: "MedCare Hospital is a 350-bed tertiary care hospital in Quezon City serving patients since 1998. Accredited by the Philippine Health Insurance Corporation (PhilHealth) and the Joint Commission International (JCI), we are committed to clinical excellence and continuous staff development. Our nursing workforce of 500+ professionals is supported by competitive salaries, night-differential pay, annual salary reviews, and a fully funded HMO plan covering the employee and two dependents.",
    isDemo: true,
  },
  {
    title: "Financial Analyst",
    company: "PrimeLine Capital",
    location: "Ortigas Center, Pasig, Philippines",
    description: "Analyse financial data, prepare management reports, and provide actionable insights that guide investment decisions and business strategy. You will build and maintain financial models, support budgeting and forecasting cycles, and present findings to senior leadership. The role offers high visibility with direct exposure to C-suite stakeholders.",
    requirements: ["Bachelor's degree in Finance or Accounting", "CPA or CFA certification preferred", "Advanced Excel skills", "Knowledge of financial modeling", "Strong attention to detail"],
    salaryRange: "PHP 50,000 - 80,000/month",
    industry: "Finance",
    companyDescription: "PrimeLine Capital is a Philippine investment and financial advisory firm established in 2008. We manage a portfolio of equity, fixed-income, and alternative investments for institutional and high-net-worth clients. Our Ortigas-based team of 45 analysts and portfolio managers operates with the discipline of a global investment bank and the agility of a local firm. We invest heavily in the professional development of our people — CFA exam fees, study leaves, and international conference attendance are standard benefits.",
    isDemo: true,
  },
  {
    title: "Customer Success Manager",
    company: "CloudServe PH",
    location: "Remote / Anywhere in Philippines",
    description: "Build and nurture long-term relationships with our enterprise clients, ensuring they extract maximum value from our SaaS platform. You will own the post-sales lifecycle — onboarding, quarterly business reviews, renewal negotiations, and expansion conversations — while serving as the internal voice of the customer to influence our product roadmap.",
    requirements: ["3+ years in customer success or account management", "Experience with SaaS products", "Strong problem-solving skills", "Excellent verbal and written communication", "Data-driven mindset"],
    salaryRange: "PHP 45,000 - 70,000/month",
    industry: "Technology",
    companyDescription: "CloudServe PH is a homegrown Philippine SaaS company providing cloud-based HR and payroll solutions to over 1,200 businesses nationwide. Founded in 2019, we have grown from a team of 10 to 150 employees — all fully remote. We believe great work can happen anywhere, which is why we offer flexible hours, a monthly work-from-home stipend, co-working space reimbursements, and team offsites twice a year. Our mission is to make world-class HR technology accessible to every Filipino employer.",
    isDemo: true,
  },
  {
    title: "Graphic Designer",
    company: "PixelCraft Studios",
    location: "Cebu City, Philippines",
    description: "Create stunning, on-brand visuals for our clients across print and digital media. You will collaborate with copywriters and account managers to deliver assets ranging from social media graphics and digital ads to packaging and brand identity systems. The ideal candidate is detail-obsessed, receptive to client feedback, and can juggle multiple projects without missing a deadline.",
    requirements: ["Portfolio demonstrating design skills", "Proficiency in Adobe Creative Suite", "Understanding of branding principles", "3+ years professional design experience", "Ability to meet deadlines"],
    salaryRange: "PHP 28,000 - 45,000/month",
    industry: "Creative Arts",
    companyDescription: "PixelCraft Studios is a boutique creative agency based in Cebu City, known for producing award-winning brand identities and campaigns for clients across the Visayas and beyond. Since 2014 our 25-person team of designers, illustrators, and art directors has worked with startups, NGOs, and established consumer brands. We run a relaxed, creativity-first studio where inspiration walls, regular design critiques, and after-hours skill-building sessions are part of everyday life. We also offer a generous project bonus structure on top of your base salary.",
    isDemo: true,
  },
  {
    title: "Operations Manager",
    company: "Nexus Contact Solutions",
    location: "Eastwood City, Quezon City, Philippines",
    description: "Lead day-to-day operations of a 300-seat BPO contact centre handling inbound and outbound campaigns for US and AU clients. You will own SLA delivery, workforce planning, team leader development, and client relationship management. The ideal candidate brings a track record of turning around underperforming accounts, driving CSAT improvements, and building high-accountability floor cultures. This is a high-visibility role with a direct line to the VP of Operations.",
    requirements: [
      "5+ years BPO operations experience, at least 2 years as Operations Manager",
      "Proven SLA and KPI management (AHT, CSAT, FCR, shrinkage)",
      "Strong workforce planning and capacity modelling skills",
      "Experience managing Team Leaders and coaching supervisors",
      "Excellent stakeholder communication — client-facing experience required",
      "Proficiency in WFM tools (NICE, Verint, or equivalent)",
      "Bachelor's degree in Business Administration, Management, or related field"
    ],
    salaryRange: "PHP 70,000 - 100,000/month",
    industry: "BPO / Call Center",
    companyDescription: "Nexus Contact Solutions is a Philippine-based BPO with over 12 years of experience delivering customer experience, technical support, and back-office services to clients across North America, Australia, and the UK. With 2,000 seats across Quezon City and Cebu, we operate 24/7 and pride ourselves on a culture of operational excellence and career growth. We promote from within, invest in leadership development, and offer a competitive package including HMO for the employee and two dependents, night-differential pay, and a performance bonus scheme.",
    isDemo: true,
  },
  {
    title: "Team Leader / Supervisor",
    company: "Apex BPO Services",
    location: "Ortigas Center, Pasig, Philippines",
    description: "Supervise a team of 15–20 customer service agents handling a financial services account. You will monitor real-time performance, conduct coaching sessions, manage escalations, and ensure your team consistently meets quality and productivity targets. You will also contribute to floor-wide process improvement initiatives and represent your team in client calibration calls.",
    requirements: [
      "2+ years as a Team Leader in a BPO setting",
      "Strong coaching and performance management skills",
      "Solid understanding of call centre metrics (QA, AHT, CSAT, adherence)",
      "Experience with financial services or banking accounts preferred",
      "Excellent written and verbal English communication",
      "Amenable to shifting schedules including graveyard"
    ],
    salaryRange: "PHP 35,000 - 55,000/month",
    industry: "BPO / Call Center",
    companyDescription: "Apex BPO Services has operated in the Philippines since 2010, providing voice and non-voice customer support solutions to leading banks and fintech companies worldwide. Our Ortigas site houses 800 agents working across two floors, supported by a dedicated training academy and a structured leadership pipeline. We believe in growing our own leaders — over 60% of our current managers started as frontline agents. Benefits include HMO, life insurance, paid leaves above statutory minimums, and a profit-sharing programme.",
    isDemo: true,
  },
  // ── Mock companies (non-demo, always visible) ────────────────────────────
  {
    title: "E-Commerce Product Manager",
    company: "LazTech Philippines",
    location: "BGC, Taguig, Philippines",
    description: "Own the product roadmap for our marketplace seller tools, driving feature discovery, prioritisation, and delivery in close partnership with engineering, design, and business teams. You will conduct user research with our 50,000+ active sellers, translate insights into clear product specs, and track success through rigorous experimentation and data analysis. This is a high-impact role at the centre of the Philippines' fastest-growing e-commerce platform.",
    requirements: [
      "4+ years of product management experience, ideally in e-commerce or marketplace platforms",
      "Strong data analysis skills — comfortable with SQL and BI dashboards",
      "Experience running A/B tests and interpreting experiment results",
      "Excellent written and verbal communication; stakeholder management experience",
      "Bachelor's degree in Business, Engineering, Computer Science, or related field"
    ],
    salaryRange: "PHP 90,000 - 130,000/month",
    industry: "E-Commerce / Retail",
    companyDescription: "LazTech Philippines is the country's leading homegrown e-commerce technology company, connecting over 2 million buyers with 50,000 sellers across Luzon, Visayas, and Mindanao. Founded in 2015, we have grown from a 10-person startup to a 600-strong team spanning product, engineering, operations, and logistics. We believe technology should make commerce easier for every Filipino — from sari-sari store owners to enterprise brands. Our BGC headquarters features flexible workspaces, free daily meals, and a competitive total rewards package including equity participation for all permanent employees.",
    isDemo: false,
  },
  {
    title: "Relationship Manager – Business Banking",
    company: "Rizal Banking Group",
    location: "Makati City, Philippines",
    description: "Manage and grow a portfolio of SME and mid-market clients by identifying financial needs, structuring appropriate credit and deposit solutions, and delivering outstanding service that deepens long-term relationships. You will originate new business through referrals and networking, prepare credit proposals, and coordinate with internal teams to ensure seamless client onboarding and servicing. This is a revenue-generating role with an attractive variable incentive scheme.",
    requirements: [
      "3+ years of relationship management or corporate banking experience",
      "Strong credit analysis and financial statement reading skills",
      "Existing network of business clients preferred",
      "Bachelor's degree in Finance, Accounting, Business Administration, or related field",
      "Excellent communication and negotiation skills"
    ],
    salaryRange: "PHP 55,000 - 85,000/month",
    industry: "Banking / Finance",
    companyDescription: "Rizal Banking Group is a Philippine universal bank with 200+ branches nationwide, serving over 1.5 million individual and corporate clients since 1979. We are consistently ranked among the country's top 10 banks by total assets and have received multiple awards for digital innovation and corporate governance. Our culture of integrity, client focus, and continuous improvement has helped us navigate every economic cycle for more than four decades. We offer a comprehensive benefits package including HMO, group life insurance, housing and car loan privileges, and a robust performance bonus programme.",
    isDemo: false,
  },
  {
    title: "Network Engineer",
    company: "GlobeEdge Telecom",
    location: "Quezon City, Philippines",
    description: "Design, deploy, and optimise fixed and mobile network infrastructure across our Metro Manila and provincial footprint. You will troubleshoot complex transmission and IP network incidents, lead capacity planning exercises, and collaborate with vendors to evaluate new technologies. The ideal candidate is energised by solving hard infrastructure problems and thrives in an always-on, mission-critical environment.",
    requirements: [
      "3+ years of experience in telecoms network engineering (IP/MPLS, transmission, or mobile core)",
      "CCNA/CCNP or equivalent vendor certification required",
      "Hands-on experience with Cisco, Huawei, or Nokia network equipment",
      "Solid understanding of BGP, OSPF, and MPLS protocols",
      "Willing to respond to on-call escalations during off-hours"
    ],
    salaryRange: "PHP 60,000 - 95,000/month",
    industry: "Telecommunications",
    companyDescription: "GlobeEdge Telecom is one of the Philippines' largest telecommunications companies, delivering mobile, broadband, and enterprise connectivity services to 40 million subscribers. With a 30-year operating history and ₱180 billion in annual revenues, we invest over ₱20 billion per year in network modernisation — including a nationwide 5G rollout currently underway. Our workforce of 8,000 engineers and support staff is our greatest asset. We provide best-in-class benefits including company phone and plan, educational assistance, and a generous performance incentive programme tied to network quality metrics.",
    isDemo: false,
  },
  {
    title: "Brand Manager",
    company: "FoodFirst Philippines",
    location: "Mandaluyong City, Philippines",
    description: "Lead the strategy and execution of one of our flagship consumer food brands, overseeing above-the-line and below-the-line marketing activities, new product development pipelines, and trade promotions. You will manage the full P&L for your assigned brand, brief and evaluate creative agencies, conduct consumer research, and present quarterly business reviews to the regional leadership team. This is a genuine end-to-end brand ownership role with significant budget authority.",
    requirements: [
      "5+ years of brand management experience in FMCG",
      "Proven track record of launching or repositioning consumer brands",
      "Strong financial acumen — comfortable with P&L ownership and ROI modelling",
      "Experience managing agencies and production budgets",
      "Bachelor's degree in Marketing, Business, or related field; MBA preferred"
    ],
    salaryRange: "PHP 85,000 - 120,000/month",
    industry: "FMCG / Consumer Goods",
    companyDescription: "FoodFirst Philippines is a leading manufacturer and distributor of packaged food and beverage products with over 60 brands sold in 80,000 retail touchpoints nationwide. Part of a Southeast Asian conglomerate with $3B in group revenues, our Philippine operation employs 3,500 people across manufacturing, sales, and marketing. We are driven by a mission to nourish Filipino families with great-tasting, affordable, and nutritious products. Our marketing team is known for launching some of the Philippines' most memorable advertising campaigns and we provide world-class training through our global talent development programmes.",
    isDemo: false,
  },
  {
    title: "Property Sales Executive",
    company: "Emerald Properties",
    location: "Alabang, Muntinlupa / Field-based",
    description: "Drive residential and commercial property sales for our premium township developments in Muntinlupa, Laguna, and Cavite. You will qualify and nurture leads from digital and referral channels, conduct site tours, prepare proposals, negotiate terms, and close transactions. Top performers enjoy a lucrative commission structure with no cap — our best Sales Executives earn over PHP 300,000 per month through commissions alone.",
    requirements: [
      "1+ year of real estate sales experience; fresh PRC Real Estate Brokers License holders welcome",
      "Strong interpersonal and presentation skills",
      "Highly self-motivated with a hunter mentality",
      "Own vehicle and willingness to conduct field work",
      "Proficiency in digital tools including CRM systems and social media prospecting"
    ],
    salaryRange: "PHP 25,000 base + uncapped commission",
    industry: "Real Estate",
    companyDescription: "Emerald Properties is one of the Philippines' most trusted property developers, with 25 years of experience delivering over 150 residential and mixed-use projects across Metro Manila, CALABARZON, and Central Luzon. Our portfolio spans affordable to premium segments — from compact condominiums for first-time buyers to gated communities and office parks. We are known for our on-time delivery record, green-certified building standards, and industry-leading after-sales service. Our sales force of 1,200 professionals across 15 area offices is supported by dedicated marketing budgets, CRM technology, and one of the most competitive commission structures in the industry.",
    isDemo: false,
  },
  {
    title: "Business Analyst – Digital Transformation",
    company: "DataBridge Consulting",
    location: "BGC, Taguig / Hybrid",
    description: "Work alongside enterprise clients in banking, retail, and logistics to analyse current-state processes, define future-state requirements, and translate business needs into clear specifications for technology delivery teams. You will facilitate workshops, produce business cases, create process maps, and support user acceptance testing. You will be part of an elite consulting team that is redefining how Philippine enterprises adopt cloud, AI, and data platforms.",
    requirements: [
      "3+ years as a Business Analyst in technology consulting or a corporate IT/transformation function",
      "CBAP or equivalent certification is a plus",
      "Strong facilitation, documentation, and stakeholder management skills",
      "Experience with process modelling tools (Visio, Lucidchart, BPMN)",
      "Background in banking, logistics, or retail transformation projects preferred"
    ],
    salaryRange: "PHP 65,000 - 100,000/month",
    industry: "IT Consulting",
    companyDescription: "DataBridge Consulting is a Philippine-based technology and management consulting firm specialising in digital transformation for large enterprises and government agencies. Founded in 2011, our 400-strong team of analysts, architects, and project managers has delivered over 300 engagements across financial services, public sector, and logistics. We are a certified partner of leading cloud providers including AWS, Microsoft Azure, and Google Cloud. Our people-first culture offers flexible hybrid work, a clear career ladder from Analyst to Partner, project rotation opportunities across industries, and one of the most generous CPD allowances in the local consulting market.",
    isDemo: false,
  },
  {
    title: "Ground Operations Officer",
    company: "SkyBridge Aviation Services",
    location: "NAIA Terminal 1, Pasay City, Philippines",
    description: "Coordinate safe, on-time aircraft turnarounds by supervising ramp handling, baggage loading, fuelling, catering, and pre-departure checks across your assigned flights. You will liaise with flight crew, airline station managers, and ground handling subcontractors to resolve operational issues in real time. The role demands calm decision-making under pressure, meticulous attention to safety protocols, and a collaborative team spirit across 24/7 rotating shifts.",
    requirements: [
      "Background in aviation, airport operations, or logistics",
      "CAAP Ground Handling certification or willingness to obtain within 90 days",
      "Ability to work rotating shifts including graveyard, weekends, and holidays",
      "Strong verbal communication and radio protocol skills",
      "Physically fit with valid NAIA airport security clearance (or ability to secure one)"
    ],
    salaryRange: "PHP 28,000 - 42,000/month",
    industry: "Aviation / Transport",
    companyDescription: "SkyBridge Aviation Services is the Philippines' largest independent ground handling company, supporting over 120 daily aircraft movements at NAIA, Mactan-Cebu, Clark, and Davao airports. With 1,800 certified ground handlers and ramp agents deployed across the country, we serve 18 airline clients including full-service carriers and budget airlines. Safety is non-negotiable at SkyBridge — we maintain a ISAGO-certified quality management system and invest ₱50 million annually in training and equipment. Benefits include shift differential pay, uniform and meal allowances, group life and accident insurance, and an internal promotion programme that fast-tracks high performers into supervisory roles.",
    isDemo: false,
  },
  {
    title: "Human Resources Business Partner",
    company: "NovaCare Health Systems",
    location: "Pasig City, Philippines",
    description: "Partner with business unit leaders across two hospital campuses to deliver end-to-end HR support covering talent acquisition, performance management, employee relations, compensation benchmarking, and organisational development. You will translate business priorities into people strategies, coach line managers through complex HR issues, and lead HR projects such as engagement survey action planning and succession pipeline development.",
    requirements: [
      "5+ years of HR experience with at least 2 years as an HRBP or HR Generalist in a complex organisation",
      "Healthcare industry experience is a strong advantage",
      "Deep knowledge of Philippine Labor Code and DOLE regulations",
      "Strong stakeholder management and influencing skills",
      "Bachelor's degree in Psychology, Human Resources, or related field; CHRP/SHRM certification preferred"
    ],
    salaryRange: "PHP 65,000 - 90,000/month",
    industry: "Healthcare",
    companyDescription: "NovaCare Health Systems operates a network of three tertiary hospitals and seven ambulatory clinics across Metro Manila, employing over 5,000 healthcare and administrative professionals. Accredited by the DOH, PhilHealth, and the Joint Commission International, we are committed to delivering evidence-based, compassionate care to every patient. Our HR team is a genuine strategic partner — we have won consecutive Great Place to Work certifications and invest heavily in workforce wellbeing, including free annual executive check-ups, mental health support programmes, and a childcare subsidy for working parents.",
    isDemo: false,
  },
];

async function ensureJobsSeeded() {
  const existing = await db.select().from(jobsTable);
  if (existing.length === 0) {
    for (const job of SEED_JOBS) {
      await db.insert(jobsTable).values(job);
    }
    return;
  }
  // Patch: insert any seed jobs not yet in the table (by title)
  const existingTitles = new Set(existing.map(j => j.title));
  for (const job of SEED_JOBS) {
    if (!existingTitles.has(job.title)) {
      await db.insert(jobsTable).values(job);
    }
  }
}

router.post("/", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const industry = typeof body.industry === "string" ? body.industry.trim() : "";
  if (!title || !company || !location || !description || !industry) {
    res.status(400).json({ error: "title, company, location, description, and industry are required." });
    return;
  }
  const salaryRange = typeof body.salaryRange === "string" && body.salaryRange.trim()
    ? body.salaryRange.trim()
    : "Competitive — to be discussed";
  const companyDescription = typeof body.companyDescription === "string" ? body.companyDescription.trim() : "";
  const workSetup = typeof body.workSetup === "string" ? body.workSetup : "";
  const employmentType = typeof body.employmentType === "string" ? body.employmentType : "";
  const rawReqs = Array.isArray(body.requirements) ? body.requirements : [];
  const requirements = (rawReqs as unknown[]).filter((r): r is string => typeof r === "string" && r.trim() !== "").map(r => r.trim());
  const fullDescription = [
    description,
    workSetup ? `\n\nWork Setup: ${workSetup}` : "",
    employmentType ? `\nEmployment Type: ${employmentType}` : "",
  ].join("");
  try {
    const customQuestions = Array.isArray(body.customQuestions)
      ? sanitizeCustomQuestions(body.customQuestions)
      : [];
    const [job] = await db.insert(jobsTable).values({
      title, company, location, description: fullDescription,
      requirements, salaryRange, industry, companyDescription, customQuestions, isDemo: false,
    }).returning();
    req.log.info({ jobId: job.id }, "New employer job created");
    res.status(201).json({ ...job, createdAt: job.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create job");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    await ensureJobsSeeded();
    // If any real employer jobs exist, hide all demo jobs.
    // Otherwise show demo jobs as placeholder content until the platform launches.
    const realJobs = await db.select().from(jobsTable).where(eq(jobsTable.isDemo, false)).orderBy(desc(jobsTable.createdAt));
    const jobs = realJobs.length > 0
      ? realJobs
      : await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt));
    res.json(jobs.map(j => stripJobAnswerKeys({ ...j, createdAt: j.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list jobs");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── DELETE /jobs/demo  (admin only) ──────────────────
 * Wipes all sample/placeholder job listings.
 * Auth: header  x-admin-token: <SM_ADMIN_TOKEN>
 *
 * The auto-hide logic in GET /jobs already removes demos from public view
 * once any real employer posts a job, so this endpoint is only needed if
 * you want to permanently remove the placeholders from the database.
 */
router.delete("/demo", async (req, res) => {
  const adminToken = process.env["SM_ADMIN_TOKEN"];
  if (!adminToken) {
    res.status(503).json({ error: "Admin token not configured. Set SM_ADMIN_TOKEN in your environment secrets." });
    return;
  }
  const provided = req.headers["x-admin-token"];
  if (provided !== adminToken) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }
  try {
    const deleted = await db.delete(jobsTable).where(eq(jobsTable.isDemo, true)).returning({ id: jobsTable.id });
    req.log.info({ count: deleted.length }, "Demo jobs deleted by admin");
    res.json({ deleted: deleted.length });
  } catch (err) {
    req.log.error({ err }, "Failed to delete demo jobs");
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ── GET /jobs/demo/count  (admin only) ───────────────
 * Returns how many demo (sample) listings remain. Useful for the admin
 * dashboard or to confirm cleanup before/after calling DELETE /jobs/demo.
 */
router.get("/demo/count", async (req, res) => {
  const adminToken = process.env["SM_ADMIN_TOKEN"];
  if (!adminToken) {
    res.status(503).json({ error: "Admin token not configured. Set SM_ADMIN_TOKEN in your environment secrets." });
    return;
  }
  const provided = req.headers["x-admin-token"];
  if (provided !== adminToken) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }
  try {
    const demos = await db.select({ id: jobsTable.id }).from(jobsTable).where(eq(jobsTable.isDemo, true));
    const reals = await db.select({ id: jobsTable.id }).from(jobsTable).where(eq(jobsTable.isDemo, false));
    res.json({ demoCount: demos.length, realCount: reals.length });
  } catch (err) {
    req.log.error({ err }, "Failed to count demo jobs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  try {
    const [existing] = await db.select({ id: jobsTable.id, isDemo: jobsTable.isDemo })
      .from(jobsTable).where(eq(jobsTable.id, id));
    if (!existing) { res.status(404).json({ error: "Job not found" }); return; }
    if (existing.isDemo) { res.status(403).json({ error: "Demo jobs cannot be edited." }); return; }

    const body = req.body as Record<string, unknown>;
    const updates: Partial<typeof jobsTable.$inferInsert> = {};

    if (typeof body.title === "string" && body.title.trim()) updates.title = body.title.trim();
    if (typeof body.company === "string" && body.company.trim()) updates.company = body.company.trim();
    if (typeof body.location === "string") updates.location = body.location.trim();
    if (typeof body.description === "string") updates.description = body.description.trim();
    if (typeof body.salaryRange === "string") updates.salaryRange = body.salaryRange.trim();
    if (typeof body.industry === "string" && body.industry.trim()) updates.industry = body.industry.trim();
    if (typeof body.companyDescription === "string") updates.companyDescription = body.companyDescription.trim();
    if (Array.isArray(body.requirements)) {
      updates.requirements = (body.requirements as unknown[])
        .filter((r): r is string => typeof r === "string" && r.trim() !== "")
        .map(r => r.trim());
    }
    if (Array.isArray(body.customQuestions)) {
      updates.customQuestions = sanitizeCustomQuestions(body.customQuestions);
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update." });
      return;
    }

    const [updated] = await db.update(jobsTable).set(updates).where(eq(jobsTable.id, id)).returning();
    req.log.info({ jobId: id }, "Job updated by employer");
    res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update job");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }
  const callerEmail: string = ((req as any).user?.email ?? "").toLowerCase();
  const isAdmin = isOwnerEmail(callerEmail);
  try {
    const [existing] = await db.select({ id: jobsTable.id, isDemo: jobsTable.isDemo })
      .from(jobsTable).where(eq(jobsTable.id, id));
    if (!existing) { res.status(404).json({ error: "Job not found" }); return; }
    if (existing.isDemo && !isAdmin) {
      res.status(403).json({ error: "Demo jobs cannot be deleted." });
      return;
    }

    await db.delete(jobsTable).where(eq(jobsTable.id, id));
    req.log.info({ jobId: id, isAdmin }, "Job deleted");
    res.json({ deleted: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete job");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /jobs/:id/apply  (applicant JWT required) ───────────────────────────
router.post("/:id/apply", requireAuth, async (req, res) => {
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId) || jobId < 1) { res.status(400).json({ error: "Invalid ID" }); return; }
  const callerEmail: string = ((req as any).user?.email ?? "").toLowerCase();
  try {
    const [applicant] = await db.select({ id: applicantsTable.id })
      .from(applicantsTable).where(eq(applicantsTable.email, callerEmail)).limit(1);
    if (!applicant) {
      res.status(404).json({ error: "No applicant profile found. Please complete your profile first." });
      return;
    }
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }

    const [existing] = await db.select({ id: jobApplicationsTable.id })
      .from(jobApplicationsTable)
      .where(and(eq(jobApplicationsTable.applicantId, applicant.id), eq(jobApplicationsTable.jobId, jobId)))
      .limit(1);
    if (existing) {
      res.status(409).json({ message: "Already applied", applicationId: existing.id });
      return;
    }
    const [application] = await db.insert(jobApplicationsTable).values({
      applicantId: applicant.id,
      jobId,
      jobTitle: job.title,
      company: job.company,
      industry: job.industry,
    }).returning();
    req.log.info({ applicantId: applicant.id, jobId }, "Job application created");
    res.status(201).json({ ...application, createdAt: application.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create job application");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /jobs/applications/me  (applicant JWT — own applications with scores) ─
router.get("/applications/me", requireAuth, requireReportSubscription, async (req, res) => {
  const callerEmail: string = ((req as any).user?.email ?? "").toLowerCase();
  try {
    const [applicant] = await db.select({ id: applicantsTable.id })
      .from(applicantsTable).where(eq(applicantsTable.email, callerEmail)).limit(1);
    if (!applicant) { res.json([]); return; }
    const apps = await db
      .select({
        id: jobApplicationsTable.id,
        jobId: jobApplicationsTable.jobId,
        jobTitle: jobApplicationsTable.jobTitle,
        company: jobApplicationsTable.company,
        industry: jobApplicationsTable.industry,
        status: jobApplicationsTable.status,
        keScore: jobApplicationsTable.keScore,
        customScore: jobApplicationsTable.customScore,
        customCorrectCount: jobApplicationsTable.customCorrectCount,
        customTotalCount: jobApplicationsTable.customTotalCount,
        createdAt: jobApplicationsTable.createdAt,
      })
      .from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.applicantId, applicant.id))
      .orderBy(desc(jobApplicationsTable.createdAt));
    res.json(apps.map(a => ({ ...a, createdAt: a.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list applicant's applications");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /jobs/:id/applications  (employer subscription or owner) ────────────
router.get("/:id/applications", requireAuth, requireCandidatePool, async (req, res) => {
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId) || jobId < 1) { res.status(400).json({ error: "Invalid ID" }); return; }
  try {
    const applications = await db
      .select({
        id: jobApplicationsTable.id,
        applicantId: jobApplicationsTable.applicantId,
        jobTitle: jobApplicationsTable.jobTitle,
        company: jobApplicationsTable.company,
        industry: jobApplicationsTable.industry,
        status: jobApplicationsTable.status,
        keScore: jobApplicationsTable.keScore,
        customScore: jobApplicationsTable.customScore,
        customCorrectCount: jobApplicationsTable.customCorrectCount,
        customTotalCount: jobApplicationsTable.customTotalCount,
        createdAt: jobApplicationsTable.createdAt,
        firstName: applicantsTable.firstName,
        lastName: applicantsTable.lastName,
        email: applicantsTable.email,
      })
      .from(jobApplicationsTable)
      .leftJoin(applicantsTable, eq(jobApplicationsTable.applicantId, applicantsTable.id))
      .where(eq(jobApplicationsTable.jobId, jobId));
    res.json(applications.map(a => ({ ...a, createdAt: a.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list job applications");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /jobs/:id/custom-assessment  (applicant view — correctAnswers stripped) ──
router.get("/:id/custom-assessment", async (req, res) => {
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId) || jobId < 1) { res.status(400).json({ error: "Invalid ID" }); return; }
  try {
    const [job] = await db.select({
      id: jobsTable.id, title: jobsTable.title, company: jobsTable.company,
      customQuestions: jobsTable.customQuestions,
    }).from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    const sanitized = (job.customQuestions ?? []).map(q => ({
      id: q.id, text: q.text, type: q.type, options: q.options ?? [], points: q.points ?? 1,
    }));
    res.json({ jobId: job.id, jobTitle: job.title, company: job.company, questions: sanitized });
  } catch (err) {
    req.log.error({ err }, "Failed to load custom assessment");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /jobs/:id/custom-assessment/submit  (applicant JWT, auto-grades) ────
router.post("/:id/custom-assessment/submit", requireAuth, async (req, res) => {
  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId) || jobId < 1) { res.status(400).json({ error: "Invalid ID" }); return; }
  const callerEmail: string = ((req as any).user?.email ?? "").toLowerCase();
  try {
    const [applicant] = await db.select({ id: applicantsTable.id })
      .from(applicantsTable).where(eq(applicantsTable.email, callerEmail)).limit(1);
    // Note: applicant profile is optional — submission still grades and returns the score,
    // but only persists to job_applications if an applicant profile exists.

    const [job] = await db.select({
      customQuestions: jobsTable.customQuestions,
      title: jobsTable.title,
      company: jobsTable.company,
      industry: jobsTable.industry,
    }).from(jobsTable).where(eq(jobsTable.id, jobId)).limit(1);
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }

    const questions = job.customQuestions ?? [];
    if (questions.length === 0) {
      res.status(400).json({ error: "This job has no custom assessment." });
      return;
    }

    const submittedAnswers = (req.body?.answers ?? {}) as Record<string, string>;
    const graded = questions.map(q => {
      const raw = String(submittedAnswers[q.id] ?? "").trim();
      const accepted = (q.correctAnswers ?? []).map(s => String(s).trim().toLowerCase()).filter(Boolean);
      const given = raw.toLowerCase();
      const correct = !!given && accepted.includes(given);
      return { questionId: q.id, answer: raw, correct };
    });
    const correctCount = graded.filter(g => g.correct).length;
    const totalCount = questions.length;
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    if (applicant) {
      await db.insert(jobApplicationsTable).values({
        applicantId: applicant.id,
        jobId,
        jobTitle: job.title,
        company: job.company,
        industry: job.industry,
        status: "assessed",
        customScore: score,
        customCorrectCount: correctCount,
        customTotalCount: totalCount,
        customAnswers: graded,
      }).onConflictDoUpdate({
        target: [jobApplicationsTable.applicantId, jobApplicationsTable.jobId],
        set: {
          status: "assessed",
          customScore: score,
          customCorrectCount: correctCount,
          customTotalCount: totalCount,
          customAnswers: graded,
        },
      });
    }

    res.json({
      score, correctCount, totalCount,
      breakdown: graded.map(g => {
        const q = questions.find(qq => qq.id === g.questionId);
        return {
          questionId: g.questionId,
          questionText: q?.text ?? "",
          type: q?.type ?? "text",
          yourAnswer: g.answer,
          correctAnswers: q?.correctAnswers ?? [],
          correct: g.correct,
        };
      }),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to submit custom assessment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const params = GetJobParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(stripJobAnswerKeys({ ...job, createdAt: job.createdAt.toISOString() }));
  } catch (err) {
    req.log.error({ err }, "Failed to get job");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
