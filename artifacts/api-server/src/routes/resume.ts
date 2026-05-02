import { Router, type IRouter } from "express";
import multer from "multer";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import { eq, desc } from "drizzle-orm";
import { db, usersTable, applicantsTable, assessmentResultsTable, assessmentsTable } from "@workspace/db";

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

    req.log.info("Resume parsed successfully");
    res.json({ success: true, data: result });

  } catch (err: any) {
    req.log.error({ err }, "Resume parse error");
    res.status(500).json({ error: err.message || "Failed to process resume. Please try again." });
  }
});

/* ══════════════════════════════════════════════════════
   POST /resume/match-analysis
   Parses the uploaded CV, fetches the authenticated
   applicant's real assessment scores, then asks OpenAI
   to produce a structured CV-vs-assessment alignment report.
══════════════════════════════════════════════════════ */
router.post("/match-analysis", upload.single("resume"), async (req, res) => {
  /* 1 ── Auth */
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  let payload: any;
  try {
    payload = jwt.verify(authHeader.slice(7), jwtSecret());
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "No file uploaded." });
    return;
  }

  try {
    /* 2 ── Resolve user → applicant */
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found." }); return; }

    const [applicant] = await db.select().from(applicantsTable)
      .where(eq(applicantsTable.email, user.email)).limit(1);
    if (!applicant) { res.status(404).json({ error: "Applicant profile not found. Please complete your profile first." }); return; }

    /* 3 ── Fetch assessment results (latest per assessment) */
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
      res.status(400).json({ error: "No assessment results found. Please complete at least one assessment before running CV match analysis." });
      return;
    }

    /* 4 ── Extract CV text */
    const rawText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype);
    if (!rawText || rawText.trim().length < 80) {
      res.status(400).json({ error: "Could not extract enough text from the file. Please try a different format." });
      return;
    }

    /* 5 ── Build context strings */
    const profileSummary = [
      applicant.targetIndustry ? `Target Industry: ${applicant.targetIndustry}` : null,
      applicant.targetRole     ? `Target Role: ${applicant.targetRole}`         : null,
      applicant.careerLevel    ? `Career Level: ${applicant.careerLevel}`       : null,
      applicant.skills.length  ? `Listed Skills: ${applicant.skills.join(", ")}` : null,
    ].filter(Boolean).join("\n");

    const scoresText = Object.entries(latestScores)
      .map(([title, score]) => `  - ${title}: ${score}%`).join("\n");

    const MATCH_PROMPT = `You are an expert HR analyst and career coach for the Philippine job market.

You will be given:
1. An applicant's CV/resume text
2. Their SwiftMatch assessment scores (objective test results across 5 competency dimensions)
3. Their profile preferences

Your task: analyze how well the CV's claims and work history align with the assessment results, identify confirmed strengths, gaps or inconsistencies, and produce specific, actionable recommendations.

Return ONLY valid JSON in this exact schema — no markdown, no extra text:
{
  "overallAlignment": <integer 0–100, weighted alignment between CV narrative and assessment performance>,
  "summary": "<2-3 sentence narrative summary of the alignment analysis>",
  "confirmedStrengths": [
    { "skill": "<skill or competency>", "cvEvidence": "<1 line from CV supporting this>", "assessmentCategory": "<which assessment confirmed it>" }
  ],
  "gapAreas": [
    { "area": "<skill or competency>", "cvClaim": "<what the CV claims>", "suggestion": "<specific advice to close the gap>" }
  ],
  "recommendations": ["<specific action>", "<specific action>", "<specific action>"],
  "cvProfile": {
    "industry": "<detected industry from CV>",
    "role": "<detected target role>",
    "level": "<detected seniority: Entry / Mid / Senior / Lead / Executive>",
    "yearsExperience": "<e.g. 5 years>",
    "topSkills": ["<skill>", "<skill>", "<skill>", "<skill>", "<skill>"]
  }
}

Rules:
- confirmedStrengths: list 2-4 items where CV claims AND assessment scores agree
- gapAreas: list 1-3 items where CV claims exceed assessment performance, OR where assessment scores are strong but CV undersells them
- recommendations: exactly 3 specific, actionable items
- overallAlignment: be realistic — a typical well-prepared candidate scores 55–80%
- Focus on Philippine market context

APPLICANT PROFILE:
${profileSummary || "Not specified"}

ASSESSMENT SCORES:
${scoresText}

CV TEXT (first 6000 chars):
${rawText.slice(0, 6000)}
`;

    /* 6 ── Call OpenAI */
    req.log.info({ applicantId: applicant.id, filename: req.file.originalname }, "Running CV match analysis");

    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: MATCH_PROMPT }],
      response_format: { type: "json_object" },
      max_completion_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) { res.status(500).json({ error: "AI analysis failed. Please try again." }); return; }

    let parsed: any;
    try { parsed = JSON.parse(content); }
    catch { res.status(500).json({ error: "Failed to parse AI response. Please try again." }); return; }

    /* 7 ── Sanitize and return */
    res.json({
      overallAlignment: typeof parsed.overallAlignment === "number" ? Math.min(100, Math.max(0, Math.round(parsed.overallAlignment))) : 60,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      confirmedStrengths: Array.isArray(parsed.confirmedStrengths) ? parsed.confirmedStrengths.slice(0, 4) : [],
      gapAreas: Array.isArray(parsed.gapAreas) ? parsed.gapAreas.slice(0, 3) : [],
      recommendations: Array.isArray(parsed.recommendations) ? (parsed.recommendations as string[]).slice(0, 3) : [],
      cvProfile: parsed.cvProfile ?? {},
    });

  } catch (err: any) {
    req.log.error({ err }, "CV match analysis error");
    res.status(500).json({ error: err.message || "Analysis failed. Please try again." });
  }
});

export default router;
