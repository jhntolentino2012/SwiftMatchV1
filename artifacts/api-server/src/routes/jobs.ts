import { Router, type IRouter } from "express";
import { db, jobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetJobParams } from "@workspace/api-zod";

const router: IRouter = Router();

const SEED_JOBS = [
  {
    title: "Senior Software Engineer",
    company: "TechCorp Solutions",
    location: "Makati City, Philippines",
    description: "We're looking for a seasoned software engineer to lead development of our core platform. You'll design scalable systems, mentor junior devs, and drive technical excellence.",
    requirements: ["5+ years of software development experience", "Proficiency in TypeScript/JavaScript", "Experience with React and Node.js", "Strong understanding of databases", "Excellent communication skills"],
    salaryRange: "PHP 80,000 - 120,000/month",
    industry: "Technology",
  },
  {
    title: "Digital Marketing Specialist",
    company: "BrandBoost Agency",
    location: "BGC, Taguig, Philippines",
    description: "Drive our clients' digital presence through innovative marketing strategies. You'll manage campaigns across social media, email, and paid advertising channels.",
    requirements: ["3+ years in digital marketing", "Experience with Google Ads and Meta Ads", "Strong analytical skills", "Content creation abilities", "Knowledge of SEO/SEM"],
    salaryRange: "PHP 35,000 - 55,000/month",
    industry: "Marketing",
  },
  {
    title: "Registered Nurse",
    company: "MedCare Hospital",
    location: "Quezon City, Philippines",
    description: "Join our dedicated healthcare team providing compassionate care to patients. We offer a supportive environment and opportunities for professional growth.",
    requirements: ["Active PRC nursing license", "BLS/ACLS certified", "Strong patient care skills", "Experience in clinical settings", "Excellent interpersonal skills"],
    salaryRange: "PHP 25,000 - 40,000/month",
    industry: "Healthcare",
  },
  {
    title: "Financial Analyst",
    company: "PrimeLine Capital",
    location: "Ortigas Center, Pasig, Philippines",
    description: "Analyze financial data, prepare reports, and provide insights to guide investment decisions and business strategy.",
    requirements: ["Bachelor's degree in Finance or Accounting", "CPA or CFA certification preferred", "Advanced Excel skills", "Knowledge of financial modeling", "Strong attention to detail"],
    salaryRange: "PHP 50,000 - 80,000/month",
    industry: "Finance",
  },
  {
    title: "Customer Success Manager",
    company: "CloudServe PH",
    location: "Remote / Anywhere in Philippines",
    description: "Build long-term relationships with our enterprise clients, ensuring they get maximum value from our SaaS platform. Drive retention and expansion revenue.",
    requirements: ["3+ years in customer success or account management", "Experience with SaaS products", "Strong problem-solving skills", "Excellent verbal and written communication", "Data-driven mindset"],
    salaryRange: "PHP 45,000 - 70,000/month",
    industry: "Technology",
  },
  {
    title: "Graphic Designer",
    company: "PixelCraft Studios",
    location: "Cebu City, Philippines",
    description: "Create stunning visuals for our clients across print and digital media. Bring creativity and technical skill to every project.",
    requirements: ["Portfolio demonstrating design skills", "Proficiency in Adobe Creative Suite", "Understanding of branding principles", "3+ years professional design experience", "Ability to meet deadlines"],
    salaryRange: "PHP 28,000 - 45,000/month",
    industry: "Creative Arts",
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
    const jobs = await db.select().from(jobsTable);
    res.json(jobs.map(j => ({ ...j, createdAt: j.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list jobs");
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
