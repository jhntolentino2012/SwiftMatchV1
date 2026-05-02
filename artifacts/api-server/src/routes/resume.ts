import { Router, type IRouter } from "express";
import multer from "multer";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import { eq, desc, and, ne } from "drizzle-orm";
import { db, usersTable, applicantsTable, assessmentResultsTable, assessmentsTable, jobsTable } from "@workspace/db";

function jwtSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET not set");
  return s;
}

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, Word (.doc/.docx), and text files are supported."));
    }
  }
});

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy",
});

async function extractTextFromBuffer(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }

  if (mimetype === "application/pdf") {
    try {
      // pdf-parse v2.x uses a class-based API with { data: Buffer }
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text;
    } catch (err: any) {
      throw new Error(`Failed to parse PDF: ${err?.message ?? String(err)}`);
    }
  }

  if (
    mimetype === "application/msword" ||
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (err) {
      throw new Error("Failed to parse Word document.");
    }
  }

  throw new Error("Unsupported file type.");
}

const PARSE_PROMPT = `You are a resume parser. Extract structured information from the following resume/CV text and return a JSON object.

Return ONLY valid JSON, no markdown, no explanation. Use null for missing fields.

JSON schema to follow:
{
  "firstName": "string or null",
  "lastName": "string or null",
  "middleName": "string or null",
  "suffix": "string or null",
  "nickname": "string or null",
  "pronoun": "string or null — one of: He/Him, She/Her, They/Them, Prefer not to say — or null if not mentioned",
  "email": "string or null",
  "phoneAreaCode": "string — international dialing code like +63 or +1 — infer from phone number format or context, default to +1",
  "phoneNumber": "string — local phone number without country code",
  "permanentAddress": "string or null — full address",
  "currentAddress": "string or null — if different from permanent address",
  "facebookUrl": "string or null",
  "linkedinUrl": "string or null",
  "skills": ["array of up to 5 most prominent skills as plain strings"],
  "expectedSalary": "string or null — numeric amount only e.g. '50000'",
  "salaryNegotiable": true,
  "availabilityDate": "string or null — in YYYY-MM-DD format if found, otherwise null",
  "employmentHistory": [
    {
      "companyName": "string",
      "position": "string",
      "yearsStayed": "string — e.g. '2 years' or '2019-2021'",
      "reasonForLeaving": "string — infer from context or use 'Career Growth' as default"
    }
  ],
  "certificates": [
    {
      "name": "string",
      "issuingOrg": "string",
      "year": "string"
    }
  ],
  "references": []
}

Important rules:
- Extract real data only. Do not invent information.
- For skills, pick only the top 5 most relevant professional skills.
- For employmentHistory, list jobs in reverse chronological order.
- For certificates, include courses, trainings, licenses, and certifications. Limit to 3 max.
- Keep reasonForLeaving realistic (Career Growth, Better Opportunity, Contract Ended, Relocation, Personal Reasons, Company Closure, Layoff/Redundancy, Better Compensation, Work-Life Balance, Other).
- If a field cannot be determined from the text, use null.

RESUME TEXT:
`;

router.post("/parse", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded." });
    return;
  }

  try {
    req.log.info({ filename: req.file.originalname, size: req.file.size }, "Parsing resume");

    // Step 1: Extract raw text
    const rawText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype);

    if (!rawText || rawText.trim().length < 50) {
      res.status(400).json({ error: "Could not extract enough text from the file. Please try a different format." });
      return;
    }

    // Step 2: Use GPT to parse structured data
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "user",
          content: PARSE_PROMPT + rawText.slice(0, 8000), // cap at 8k chars
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "AI parsing failed. Please try again." });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      res.status(500).json({ error: "Failed to parse AI response. Please try again." });
      return;
    }

    // Step 3: Sanitize and return
    const result = {
      firstName: parsed.firstName ?? null,
      lastName: parsed.lastName ?? null,
      middleName: parsed.middleName ?? null,
      suffix: parsed.suffix ?? null,
      nickname: parsed.nickname ?? null,
      pronoun: parsed.pronoun ?? null,
      email: parsed.email ?? null,
      phoneAreaCode: parsed.phoneAreaCode ?? "+1",
      phoneNumber: parsed.phoneNumber ?? null,
      permanentAddress: parsed.permanentAddress ?? null,
      currentAddress: parsed.currentAddress ?? null,
      facebookUrl: parsed.facebookUrl ?? null,
      linkedinUrl: parsed.linkedinUrl ?? null,
      skills: Array.isArray(parsed.skills) ? (parsed.skills as string[]).slice(0, 5) : [],
      expectedSalary: parsed.expectedSalary ?? null,
      salaryNegotiable: parsed.salaryNegotiable !== false,
      availabilityDate: parsed.availabilityDate ?? null,
      employmentHistory: Array.isArray(parsed.employmentHistory) ? parsed.employmentHistory : [],
      certificates: Array.isArray(parsed.certificates) ? (parsed.certificates as unknown[]).slice(0, 3) : [],
      references: [],
    };

    // Step 4: If authenticated, store CV text against the applicant record
    const authHeader = req.headers["authorization"];
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const payload: any = jwt.verify(authHeader.slice(7), jwtSecret());
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
        if (user) {
          await db.update(applicantsTable)
            .set({ cvText: rawText.slice(0, 12000) })
            .where(eq(applicantsTable.email, user.email));
          req.log.info({ userId: payload.userId }, "Stored CV text for applicant");
        }
      } catch {
        // Non-fatal — don't block the parse response
      }
    }

    req.log.info("Resume parsed successfully");
    res.json({ success: true, data: result });

  } catch (err: any) {
    req.log.error({ err }, "Resume parse error");
    res.status(500).json({ error: err.message || "Failed to process resume. Please try again." });
  }
});

/* ══════════════════════════════════════════════════════
   POST /resume/store-cv
   Stores raw CV text against the authenticated applicant
   without parsing it. Used by the Match Analysis page when
   no CV has been uploaded yet.
══════════════════════════════════════════════════════ */
router.post("/store-cv", upload.single("resume"), async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Authentication required." }); return; }
  let payload: any;
  try { payload = jwt.verify(authHeader.slice(7), jwtSecret()); }
  catch { res.status(401).json({ error: "Invalid or expired token." }); return; }

  if (!req.file) { res.status(400).json({ error: "No file uploaded." }); return; }

  try {
    const rawText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype);
    if (!rawText || rawText.trim().length < 80) {
      res.status(400).json({ error: "Could not extract enough text from the file. Please try a different format." });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found." }); return; }

    const updated = await db.update(applicantsTable)
      .set({ cvText: rawText.slice(0, 12000) })
      .where(eq(applicantsTable.email, user.email))
      .returning({ id: applicantsTable.id });

    if (!updated.length) { res.status(404).json({ error: "Applicant profile not found." }); return; }

    req.log.info({ applicantId: updated[0].id }, "CV text stored via store-cv");
    res.json({ success: true });
  } catch (err: any) {
    req.log.error({ err }, "store-cv error");
    res.status(500).json({ error: err.message || "Failed to store CV." });
  }
});

/* ══════════════════════════════════════════════════════
   GET /resume/match-analysis
   Automatically runs a CV-vs-assessment match analysis
   using the CV text already stored on the applicant record,
   their real assessment scores, and recruiter job requirements
   for their target industry.  No file upload needed.
══════════════════════════════════════════════════════ */
router.get("/match-analysis", async (req, res) => {
  /* 1 ── Auth */
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Authentication required." }); return; }
  let payload: any;
  try { payload = jwt.verify(authHeader.slice(7), jwtSecret()); }
  catch { res.status(401).json({ error: "Invalid or expired token." }); return; }

  try {
    /* 2 ── Resolve user → applicant */
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found." }); return; }

    const [applicant] = await db.select().from(applicantsTable)
      .where(eq(applicantsTable.email, user.email)).limit(1);
    if (!applicant) { res.status(404).json({ error: "Applicant profile not found. Please complete your profile first." }); return; }

    /* 3 ── Check stored CV text */
    if (!applicant.cvText || applicant.cvText.trim().length < 80) {
      res.status(422).json({ errorCode: "cv_missing", error: "No CV on file. Please upload your CV to enable match analysis." });
      return;
    }

    /* 4 ── Fetch assessment results (latest per assessment) */
    const rawResults = await db
      .select({ title: assessmentsTable.title, score: assessmentResultsTable.score })
      .from(assessmentResultsTable)
      .innerJoin(assessmentsTable, eq(assessmentResultsTable.assessmentId, assessmentsTable.id))
      .where(eq(assessmentResultsTable.applicantId, applicant.id))
      .orderBy(desc(assessmentResultsTable.completedAt));

    const latestScores: Record<string, number> = {};
    for (const r of rawResults) {
      if (!(r.title in latestScores)) latestScores[r.title] = r.score;
    }

    if (Object.keys(latestScores).length === 0) {
      res.status(422).json({ errorCode: "no_scores", error: "No assessment results found. Please complete at least one assessment first." });
      return;
    }

    /* 5 ── Fetch matching recruiter job requirements (fall back to demo jobs if no real ones) */
    let matchingJobs: { title: string; company: string; requirements: string[] | null; description: string }[] = [];
    if (applicant.targetIndustry) {
      const realJobs = await db.select({
        title: jobsTable.title,
        company: jobsTable.company,
        requirements: jobsTable.requirements,
        description: jobsTable.description,
      })
      .from(jobsTable)
      .where(and(eq(jobsTable.industry, applicant.targetIndustry), ne(jobsTable.isDemo, true)))
      .orderBy(desc(jobsTable.createdAt))
      .limit(3);

      if (realJobs.length > 0) {
        matchingJobs = realJobs;
      } else {
        matchingJobs = await db.select({
          title: jobsTable.title,
          company: jobsTable.company,
          requirements: jobsTable.requirements,
          description: jobsTable.description,
        })
        .from(jobsTable)
        .where(eq(jobsTable.industry, applicant.targetIndustry))
        .orderBy(desc(jobsTable.createdAt))
        .limit(3);
      }
    }

    /* 6 ── Build context strings */
    const profileSummary = [
      applicant.targetIndustry ? `Target Industry: ${applicant.targetIndustry}` : null,
      applicant.targetRole     ? `Target Role: ${applicant.targetRole}`         : null,
      applicant.careerLevel    ? `Career Level: ${applicant.careerLevel}`       : null,
      applicant.skills.length  ? `Listed Skills: ${applicant.skills.join(", ")}` : null,
    ].filter(Boolean).join("\n");

    const scoresText = Object.entries(latestScores)
      .map(([title, score]) => `  - ${title}: ${score}%`).join("\n");

    const jobsContext = matchingJobs.length > 0
      ? matchingJobs.map((j, i) =>
          `Job ${i + 1}: ${j.title} at ${j.company}\n  Requirements: ${(j.requirements ?? []).join("; ") || j.description.slice(0, 300)}`
        ).join("\n\n")
      : "No active job postings on file for this industry.";

    const MATCH_PROMPT = `You are a Philippine HR analyst. Analyse the applicant data below and return ONLY a JSON object — no markdown, no extra text.

PROFILE:
${profileSummary || "Not specified"}

ASSESSMENT SCORES:
${scoresText}

JOB REQUIREMENTS:
${jobsContext.slice(0, 500)}

CV TEXT:
${applicant.cvText.slice(0, 2000)}

Return this JSON structure (fill in real values):
{
  "overallAlignment": 68,
  "summary": "Two sentence summary here.",
  "confirmedStrengths": [
    { "skill": "Skill name", "cvEvidence": "Quote from CV", "assessmentCategory": "Assessment name" }
  ],
  "gapAreas": [
    { "area": "Gap name", "cvClaim": "What CV says", "suggestion": "How to improve" }
  ],
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "cvProfile": {
    "industry": "Industry name",
    "role": "Role title",
    "level": "Entry/Mid/Senior/Lead/Executive",
    "yearsExperience": "N years",
    "topSkills": ["Skill1", "Skill2", "Skill3"]
  }
}

Rules: 2-3 confirmedStrengths, 1-2 gapAreas, exactly 3 recommendations. overallAlignment between 50-85 for a typical candidate.`;

    /* 7 ── Call OpenAI */
    req.log.info({ applicantId: applicant.id, jobCount: matchingJobs.length }, "Running auto CV match analysis");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: MATCH_PROMPT }],
      max_completion_tokens: 900,
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) { res.status(500).json({ error: "AI analysis failed. Please try again." }); return; }

    // Strip markdown code fences if present (e.g. ```json ... ```)
    const content = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

    let parsed: any;
    try { parsed = JSON.parse(content); }
    catch (parseErr) {
      req.log.error({ rawContent, parseErr }, "Failed to parse AI JSON response");
      res.status(500).json({ error: "Failed to parse AI response. Please try again." }); return;
    }

    /* 8 ── Sanitize and return */
    res.json({
      overallAlignment: typeof parsed.overallAlignment === "number" ? Math.min(100, Math.max(0, Math.round(parsed.overallAlignment))) : 60,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      confirmedStrengths: Array.isArray(parsed.confirmedStrengths) ? parsed.confirmedStrengths.slice(0, 4) : [],
      gapAreas: Array.isArray(parsed.gapAreas) ? parsed.gapAreas.slice(0, 3) : [],
      recommendations: Array.isArray(parsed.recommendations) ? (parsed.recommendations as string[]).slice(0, 3) : [],
      cvProfile: parsed.cvProfile ?? {},
      jobsMatched: matchingJobs.length,
    });

  } catch (err: any) {
    req.log.error({ err }, "CV match analysis error");
    res.status(500).json({ error: err.message || "Analysis failed. Please try again." });
  }
});

export default router;
