import { Router, type IRouter } from "express";
import { db, jobsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { GetJobParams } from "@workspace/api-zod";

const router: IRouter = Router();

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
];

async function ensureJobsSeeded() {
  const existing = await db.select().from(jobsTable);
  if (existing.length === 0) {
    for (const job of SEED_JOBS) {
      await db.insert(jobsTable).values(job);
    }
  }
}

router.get("/", async (req, res) => {
  try {
    await ensureJobsSeeded();
    // If any real employer jobs exist, hide all demo jobs.
    // Otherwise show demo jobs as placeholder content until the platform launches.
    const realJobs = await db.select().from(jobsTable).where(eq(jobsTable.isDemo, false)).orderBy(desc(jobsTable.createdAt));
    const jobs = realJobs.length > 0
      ? realJobs
      : await db.select().from(jobsTable).orderBy(desc(jobsTable.createdAt));
    res.json(jobs.map(j => ({ ...j, createdAt: j.createdAt.toISOString() })));
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
    res.json({ ...job, createdAt: job.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get job");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
