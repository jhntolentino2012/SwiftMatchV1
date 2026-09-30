import { Router, type IRouter } from "express";
import { requireVerifiedUser, applicantAccess } from "../middlewares/report-access.js";
import { isOwnerEmail } from "../lib/owner.js";
import { db, assessmentsTable, assessmentResultsTable, applicantsTable, jobApplicationsTable } from "@workspace/db";
import { eq, asc, and, desc } from "drizzle-orm";
import { pickQuiz, gradeQuizAnswers, INDUSTRY_QUESTIONS, INDUSTRY_ROLES } from "../lib/industry-questions.js";
import {
  isValidCFIndustry,
  pickCulturalFitQuestions,
  gradeCulturalFit,
  extractCFUsedIds,
  encodeCFData,
  CF_QUESTIONS_PER_ATTEMPT,
  CF_QUESTIONS_PER_INDUSTRY,
} from "../lib/cultural-fit-questions.js";
import {
  isValidCTIndustry,
  pickCriticalThinkingQuestions,
  gradeCriticalThinking,
  extractCTUsedIds,
  encodeCTData,
  CT_QUESTIONS_PER_ATTEMPT,
  CT_QUESTIONS_PER_INDUSTRY,
} from "../lib/critical-thinking-questions.js";
import {
  isValidAIIndustry,
  pickAIReadinessQuestions,
  gradeAIReadiness,
  extractAIUsedIds,
  encodeAIData,
  AI_QUESTIONS_PER_ATTEMPT,
  AI_QUESTIONS_PER_INDUSTRY,
} from "../lib/ai-readiness-questions.js";
import {
  GetAssessmentParams,
  SubmitAssessmentParams,
  SubmitAssessmentBody,
  GetApplicantAssessmentResultsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function isApplicantCooldownBypassed(applicantId: number): Promise<boolean> {
  const [row] = await db
    .select({ email: applicantsTable.email })
    .from(applicantsTable)
    .where(eq(applicantsTable.id, applicantId))
    .limit(1);
  if (!row) return false;
  return isOwnerEmail(row.email);
}

// ── Retake cooldown helpers ──
async function getLatestResult(applicantId: number, assessmentId: number) {
  const [latest] = await db
    .select()
    .from(assessmentResultsTable)
    .where(and(
      eq(assessmentResultsTable.applicantId, applicantId),
      eq(assessmentResultsTable.assessmentId, assessmentId),
    ))
    .orderBy(desc(assessmentResultsTable.completedAt))
    .limit(1);
  return latest ?? null;
}

function addOneMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d;
}

function isTooSoon(completedAt: Date): boolean {
  return new Date() < addOneMonth(completedAt);
}

const SEED_ASSESSMENTS = [
  {
    title: "Knowledge & Expertise",
    category: "knowledge",
    description: "Test your industry knowledge and professional expertise to showcase your qualifications.",
    questions: [
      { id: 1, text: "How many years of professional experience do you have in your primary field?", type: "multiple_choice", options: ["Less than 1 year", "1-2 years", "3-5 years", "6-10 years", "More than 10 years"] },
      { id: 2, text: "Which of the following best describes your highest level of education?", type: "multiple_choice", options: ["High School Diploma", "Vocational/Technical Certificate", "College Undergrad", "Bachelor's Degree", "Master's Degree", "Doctorate or Higher"] },
      { id: 3, text: "How would you rate your proficiency in your top skill?", type: "multiple_choice", options: ["Beginner", "Intermediate", "Advanced", "Expert"] },
      { id: 4, text: "Describe a major project or achievement in your career that demonstrates your expertise.", type: "text", options: null },
      { id: 5, text: "How do you stay updated with industry trends and developments?", type: "multiple_choice", options: ["Online courses & certifications", "Industry publications & journals", "Professional networking events", "Mentorship & peer learning", "All of the above"] },
    ],
  },
  {
    title: "Personality & Work Style",
    category: "personality",
    description: "Discover your work personality and how you collaborate, communicate, and lead in professional settings.",
    questions: [
      { id: 1, text: "When facing a difficult problem at work, you typically:", type: "multiple_choice", options: ["Research extensively before acting", "Brainstorm solutions with the team", "Take immediate action and adjust", "Consult a mentor or supervisor"] },
      { id: 2, text: "How do you prefer to receive feedback?", type: "multiple_choice", options: ["Directly and immediately", "In scheduled one-on-ones", "Through written communication", "Via group discussions"] },
      { id: 3, text: "Which describes your working style best?", type: "multiple_choice", options: ["Independent and self-driven", "Highly collaborative", "Structured and process-oriented", "Creative and spontaneous"] },
      { id: 4, text: "How do you handle multiple deadlines simultaneously?", type: "multiple_choice", options: ["Prioritize and tackle one at a time", "Create a detailed schedule", "Delegate where possible", "Work extended hours to complete all"] },
      { id: 5, text: "Describe a time you resolved a conflict with a colleague or supervisor.", type: "text", options: null },
    ],
  },
  {
    title: "Cultural Fit",
    category: "cultural_fit",
    description: "Discover how your values, communication style, and work ethics align with company culture.",
    questions: [
      { id: 1, text: "Which workplace environment brings out your best performance?", type: "multiple_choice", options: ["Fast-paced and dynamic", "Structured with clear processes", "Collaborative and team-driven", "Independent with minimal supervision"] },
      { id: 2, text: "How do you handle disagreements with a team member?", type: "multiple_choice", options: ["Address it privately and respectfully", "Escalate to a manager immediately", "Avoid the conflict until it resolves", "Discuss openly in a group setting"] },
      { id: 3, text: "What company value matters most to you?", type: "multiple_choice", options: ["Innovation and creativity", "Integrity and transparency", "Collaboration and teamwork", "Work-life balance and well-being"] },
      { id: 4, text: "How do you typically respond to changes in company direction or priorities?", type: "multiple_choice", options: ["Embrace change and adapt quickly", "Need time to understand before adjusting", "Prefer stability and clear long-term plans", "Proactively help others navigate the change"] },
      { id: 5, text: "Describe what a positive team culture looks like to you.", type: "text", options: null },
    ],
  },
  {
    title: "Critical Thinking Ability",
    category: "critical_thinking",
    description: "Assess your capacity for logical analysis, structured reasoning, and informed decision-making.",
    questions: [
      { id: 1, text: "When presented with conflicting data, you would:", type: "multiple_choice", options: ["Go with the majority view", "Identify the most reliable source and investigate further", "Defer to your manager's judgment", "Present both perspectives and ask for a decision"] },
      { id: 2, text: "A proposed solution has a short-term benefit but a long-term risk. You would:", type: "multiple_choice", options: ["Accept the short-term win immediately", "Reject it outright due to the risk", "Analyse the trade-off and recommend a modified approach", "Wait for others to decide first"] },
      { id: 3, text: "How do you typically approach a problem you have not faced before?", type: "multiple_choice", options: ["Apply the solution that worked last time", "Break the problem into smaller parts and research each", "Ask a colleague who has faced it before", "Experiment with multiple solutions simultaneously"] },
      { id: 4, text: "You notice a flaw in a plan that has already been approved. You would:", type: "multiple_choice", options: ["Say nothing to avoid conflict", "Quietly fix it without informing anyone", "Raise the concern with clear evidence and suggest an alternative", "Wait and see if the flaw causes a real problem first"] },
      { id: 5, text: "Describe a time you used data or evidence to challenge an assumption or change a decision.", type: "text", options: null },
    ],
  },
  {
    title: "AI Readiness",
    category: "ai_readiness",
    description: "Evaluate your comfort level, adaptability, and practical experience working with AI-powered tools.",
    questions: [
      { id: 1, text: "How often do you use AI tools (e.g. ChatGPT, Copilot, Gemini) in your current or previous work?", type: "multiple_choice", options: ["Daily — it is core to my workflow", "A few times a week", "Occasionally for specific tasks", "Rarely or never"] },
      { id: 2, text: "How do you view AI in the context of your role?", type: "multiple_choice", options: ["A threat to my job security", "A powerful tool that enhances my output", "Useful but not relevant to my field", "Something I am still learning about"] },
      { id: 3, text: "If your employer required you to learn a new AI tool within 30 days, you would:", type: "multiple_choice", options: ["Embrace it and dive in immediately", "Complete only the required training", "Express concerns and request more time", "Ask if the tool is really necessary"] },
      { id: 4, text: "Which best describes your experience with AI-assisted workflows?", type: "multiple_choice", options: ["I design and implement AI workflows", "I regularly use AI to automate or augment tasks", "I have experimented with AI on personal projects", "I have no hands-on AI experience yet"] },
      { id: 5, text: "Describe how you have used or plan to use AI to improve your productivity or the quality of your work.", type: "text", options: null },
    ],
  },
];

const SEED_SIGNATURE = SEED_ASSESSMENTS.map(s => `${s.category}:${s.title}`).sort().join("|");

async function ensureAssessmentsSeededed() {
  const existing = await db.select().from(assessmentsTable);
  const actualSig = existing.map((r: any) => `${r.category}:${r.title}`).sort().join("|");
  if (actualSig !== SEED_SIGNATURE) {
    await db.delete(assessmentsTable);
    for (const seed of SEED_ASSESSMENTS) {
      await db.insert(assessmentsTable).values(seed);
    }
  }
}

router.get("/", async (req, res) => {
  try {
    await ensureAssessmentsSeededed();
    const assessments = await db.select().from(assessmentsTable);
    res.json(assessments.map(a => ({
      ...a,
      questions: Array.isArray(a.questions) ? a.questions : [],
      createdAt: a.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list assessments");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Knowledge & Expertise — industry-adaptive quiz (must be before /:id)
router.get("/ke-quiz", (req, res) => {
  const industry = String(req.query.industry ?? "");
  const role = req.query.role ? String(req.query.role) : undefined;
  const excludeParam = String(req.query.exclude ?? "");
  const excludeIds = excludeParam ? excludeParam.split(",").filter(Boolean) : [];

  const validIndustry = Object.keys(INDUSTRY_QUESTIONS).includes(industry);
  if (!validIndustry) {
    res.status(400).json({ error: "Invalid or missing industry" });
    return;
  }

  // Validate role if provided
  const validRole = role && (INDUSTRY_ROLES[industry] ?? []).includes(role) ? role : undefined;

  const questions = pickQuiz(industry, excludeIds, validRole);
  res.json(questions);
});

// Save K&E quiz result — grades server-side from the answers map.
router.post("/ke-quiz/submit", requireVerifiedUser, applicantAccess(req => req.body?.applicantId, "write"), async (req, res) => {
  const { applicantId, industry, jobId, answers } = req.body;
  if (!applicantId || !industry || !answers || typeof answers !== "object") {
    res.status(400).json({ error: "Missing required fields (applicantId, industry, answers)" });
    return;
  }
  if (!Object.keys(INDUSTRY_QUESTIONS).includes(industry)) {
    res.status(400).json({ error: "Invalid industry" });
    return;
  }
  try {
    const bypassed = await isApplicantCooldownBypassed(applicantId);
    if (!bypassed) {
      const latest = await getLatestResult(applicantId, 1);
      if (latest && isTooSoon(latest.completedAt)) {
        res.status(429).json({ error: "Retake cooldown active", retakeAvailableAt: addOneMonth(latest.completedAt).toISOString() });
        return;
      }
    }

    // Authoritative server-side grading — ignores any client-supplied score.
    const grading = gradeQuizAnswers(industry, answers as Record<string, string>);
    const score = grading.score;
    const passed = score >= 60;
    const feedback = passed
      ? `Strong performance in ${industry}! You answered ${grading.correctCount} of ${grading.totalGradable} questions correctly.`
      : `Keep studying ${industry} concepts — you answered ${grading.correctCount} of ${grading.totalGradable} questions correctly. Review the topics and retry for a better score.`;

    const resolvedJobId = typeof jobId === "number" && jobId > 0 ? jobId : null;
    const [result] = await db.insert(assessmentResultsTable).values({
      applicantId,
      assessmentId: 1,
      assessmentTitle: `Knowledge & Expertise — ${industry}`,
      score,
      passed,
      feedback,
      jobId: resolvedJobId,
    }).returning();

    if (resolvedJobId) {
      await db.update(jobApplicationsTable)
        .set({ keScore: score, status: "assessed" })
        .where(and(
          eq(jobApplicationsTable.applicantId, applicantId),
          eq(jobApplicationsTable.jobId, resolvedJobId),
        ));
      req.log.info({ applicantId, jobId: resolvedJobId, score }, "Job application KE score updated");
    }

    res.json({
      ...result,
      completedAt: result.completedAt.toISOString(),
      grading: {
        score,
        correctCount: grading.correctCount,
        totalGradable: grading.totalGradable,
        rawScore: grading.rawScore,
        maxScore: grading.maxScore,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save ke-quiz result");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Personality quiz result
router.post("/personality/submit", requireVerifiedUser, applicantAccess(req => req.body?.applicantId, "write"), async (req, res) => {
  const { applicantId, positionLabel, tier, framework: clientFramework, result, rationale } = req.body;
  if (!applicantId || !result) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const bypassed = await isApplicantCooldownBypassed(applicantId);
    if (!bypassed) {
      const latest = await getLatestResult(applicantId, 2);
      if (latest && isTooSoon(latest.completedAt)) {
        res.status(429).json({ error: "Retake cooldown active", retakeAvailableAt: addOneMonth(latest.completedAt).toISOString() });
        return;
      }
    }
    // Prefer the framework decided by the client's industry/role/tier router.
    // Fall back to tier-only mapping for backward compatibility.
    const frameworkLabel = clientFramework === "MBTI"
      ? "Myers-Briggs (MBTI)"
      : clientFramework === "DOPE"
        ? "DOPE Bird Test"
        : (tier === "leadership" ? "Myers-Briggs (MBTI)" : "DOPE Bird Test");
    const feedbackParts = [
      `Personality type: ${result}.`,
      `Position level: ${positionLabel ?? "Not specified"}.`,
    ];
    if (rationale && typeof rationale === "string") feedbackParts.push(`Routing: ${rationale}`);
    const [saved] = await db.insert(assessmentResultsTable).values({
      applicantId,
      assessmentId: 2,
      assessmentTitle: `Personality & Work Style — ${frameworkLabel}`,
      score: 100,
      passed: true,
      feedback: feedbackParts.join(" "),
    }).returning();
    res.json({ ...saved, completedAt: saved.completedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to save personality result");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Cultural Fit ── industry-scoped, per-applicant no-repeat, max 8 per attempt
const CF_ASSESSMENT_ID = 3;

async function getApplicantCFExcludeIds(applicantId: number, industry: string): Promise<string[]> {
  const prior = await db
    .select()
    .from(assessmentResultsTable)
    .where(and(
      eq(assessmentResultsTable.applicantId, applicantId),
      eq(assessmentResultsTable.assessmentId, CF_ASSESSMENT_ID),
    ));
  const ids = new Set<string>();
  for (const r of prior) {
    if (industry && r.assessmentTitle && !r.assessmentTitle.includes(industry)) continue;
    for (const id of extractCFUsedIds(r.feedback)) ids.add(id);
  }
  return Array.from(ids);
}

router.get("/cultural-fit/quiz", requireVerifiedUser, applicantAccess(req => req.query.applicantId, "write"), async (req, res) => {
  const applicantId = Number(req.query.applicantId);
  const industry = String(req.query.industry ?? "");
  if (!applicantId || !industry) {
    res.status(400).json({ error: "Missing applicantId or industry" });
    return;
  }
  if (!isValidCFIndustry(industry)) {
    res.status(400).json({ error: "Invalid industry" });
    return;
  }
  try {
    const excludeIds = await getApplicantCFExcludeIds(applicantId, industry);
    const pick = pickCulturalFitQuestions(industry, excludeIds, CF_QUESTIONS_PER_ATTEMPT, applicantId);
    res.json({
      industry,
      questions: pick.questions,
      remainingPool: pick.remainingPool,
      totalPool: pick.totalPool,
      exhausted: pick.exhausted,
      perAttempt: CF_QUESTIONS_PER_ATTEMPT,
      totalPerIndustry: CF_QUESTIONS_PER_INDUSTRY,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to pick cultural-fit questions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cultural-fit/submit", requireVerifiedUser, applicantAccess(req => req.body?.applicantId, "write"), async (req, res) => {
  const { applicantId, industry, jobId, questionIds, answers } = req.body ?? {};
  if (
    !applicantId ||
    !industry ||
     !Array.isArray(questionIds) || !questionIds.every(id => typeof id === "string") ||
    !answers ||
     typeof answers !== "object" || Array.isArray(answers)
  ) {
    res.status(400).json({ error: "Missing required fields (applicantId, industry, questionIds, answers)" });
    return;
  }
  if (!isValidCFIndustry(industry)) {
    res.status(400).json({ error: "Invalid industry" });
    return;
  }
  try {
    const grading = gradeCulturalFit(
      industry,
      questionIds as string[],
      answers as Record<string, number>,
    );
    const passed = grading.score >= 60;
    const headline = passed
      ? `Strong cultural alignment — ${grading.correctCount}/${grading.total} responses matched the most aligned answer.`
      : `Some areas to reflect on — ${grading.correctCount}/${grading.total} responses matched the most aligned answer.`;
    const cfData = encodeCFData({
      used: questionIds as string[],
      details: grading.details,
      industry,
    });
    const feedback = `${headline} ${cfData}`;
    const resolvedJobId = typeof jobId === "number" && jobId > 0 ? jobId : null;
    const [saved] = await db.insert(assessmentResultsTable).values({
      applicantId,
      assessmentId: CF_ASSESSMENT_ID,
      assessmentTitle: `Cultural Fit — ${industry}`,
      score: grading.score,
      passed,
      feedback,
      jobId: resolvedJobId,
    }).returning();

    // After insert, recompute remaining pool for the client
    const excludeIds = await getApplicantCFExcludeIds(applicantId, industry);
    const remainingPool = Math.max(0, CF_QUESTIONS_PER_INDUSTRY - excludeIds.length);

    res.json({
      ...saved,
      completedAt: saved.completedAt.toISOString(),
      grading: {
        score: grading.score,
        correctCount: grading.correctCount,
        total: grading.total,
        details: grading.details,
      },
      remainingPool,
      totalPerIndustry: CF_QUESTIONS_PER_INDUSTRY,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save cultural-fit result");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Critical Thinking ── industry-scoped, per-applicant no-repeat, min 10 per attempt
const CT_ASSESSMENT_ID = 4;

async function getApplicantCTExcludeIds(applicantId: number, industry: string): Promise<string[]> {
  const prior = await db
    .select()
    .from(assessmentResultsTable)
    .where(and(
      eq(assessmentResultsTable.applicantId, applicantId),
      eq(assessmentResultsTable.assessmentId, CT_ASSESSMENT_ID),
    ));
  const ids = new Set<string>();
  for (const r of prior) {
    if (industry && r.assessmentTitle && !r.assessmentTitle.includes(industry)) continue;
    for (const id of extractCTUsedIds(r.feedback)) ids.add(id);
  }
  return Array.from(ids);
}

router.get("/critical-thinking/quiz", requireVerifiedUser, applicantAccess(req => req.query.applicantId, "write"), async (req, res) => {
  const applicantId = Number(req.query.applicantId);
  const industry = String(req.query.industry ?? "");
  if (!applicantId || !industry) {
    res.status(400).json({ error: "Missing applicantId or industry" });
    return;
  }
  if (!isValidCTIndustry(industry)) {
    res.status(400).json({ error: "Invalid industry" });
    return;
  }
  try {
    const excludeIds = await getApplicantCTExcludeIds(applicantId, industry);
    const pick = pickCriticalThinkingQuestions(industry, excludeIds, CT_QUESTIONS_PER_ATTEMPT, applicantId);
    res.json({
      industry,
      questions: pick.questions,
      remainingPool: pick.remainingPool,
      totalPool: pick.totalPool,
      exhausted: pick.exhausted,
      perAttempt: CT_QUESTIONS_PER_ATTEMPT,
      totalPerIndustry: CT_QUESTIONS_PER_INDUSTRY,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to pick critical-thinking questions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/critical-thinking/submit", requireVerifiedUser, applicantAccess(req => req.body?.applicantId, "write"), async (req, res) => {
  const { applicantId, industry, jobId, questionIds, answers } = req.body ?? {};
  if (
    !applicantId ||
    !industry ||
     !Array.isArray(questionIds) || !questionIds.every(id => typeof id === "string") ||
    !answers ||
     typeof answers !== "object" || Array.isArray(answers)
  ) {
    res.status(400).json({ error: "Missing required fields (applicantId, industry, questionIds, answers)" });
    return;
  }
  if (!isValidCTIndustry(industry)) {
    res.status(400).json({ error: "Invalid industry" });
    return;
  }
  try {
    const grading = gradeCriticalThinking(
      industry,
      questionIds as string[],
      answers as Record<string, number>,
    );
    const passed = grading.score >= 60;
    const headline = passed
      ? `Strong critical thinking — ${grading.correctCount}/${grading.total} correct.`
      : `Keep practising — ${grading.correctCount}/${grading.total} correct.`;
    const ctData = encodeCTData({
      used: questionIds as string[],
      details: grading.details,
      industry,
    });
    const feedback = `${headline} ${ctData}`;
    const resolvedJobId = typeof jobId === "number" && jobId > 0 ? jobId : null;
    const [saved] = await db.insert(assessmentResultsTable).values({
      applicantId,
      assessmentId: CT_ASSESSMENT_ID,
      assessmentTitle: `Critical Thinking — ${industry}`,
      score: grading.score,
      passed,
      feedback,
      jobId: resolvedJobId,
    }).returning();

    const excludeIds = await getApplicantCTExcludeIds(applicantId, industry);
    const remainingPool = Math.max(0, CT_QUESTIONS_PER_INDUSTRY - excludeIds.length);

    res.json({
      ...saved,
      completedAt: saved.completedAt.toISOString(),
      grading: {
        score: grading.score,
        correctCount: grading.correctCount,
        total: grading.total,
        details: grading.details,
      },
      remainingPool,
      totalPerIndustry: CT_QUESTIONS_PER_INDUSTRY,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save critical-thinking result");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── AI Readiness ── industry-scoped, per-applicant no-repeat, 8 per attempt
const AI_ASSESSMENT_ID = 5;

async function getApplicantAIExcludeIds(applicantId: number, industry: string): Promise<string[]> {
  const prior = await db
    .select()
    .from(assessmentResultsTable)
    .where(and(
      eq(assessmentResultsTable.applicantId, applicantId),
      eq(assessmentResultsTable.assessmentId, AI_ASSESSMENT_ID),
    ));
  const ids = new Set<string>();
  for (const r of prior) {
    if (industry && r.assessmentTitle && !r.assessmentTitle.includes(industry)) continue;
    for (const id of extractAIUsedIds(r.feedback)) ids.add(id);
  }
  return Array.from(ids);
}

router.get("/ai-readiness/quiz", requireVerifiedUser, applicantAccess(req => req.query.applicantId, "write"), async (req, res) => {
  const applicantId = Number(req.query.applicantId);
  const industry = String(req.query.industry ?? "");
  if (!applicantId || !industry) {
    res.status(400).json({ error: "Missing applicantId or industry" });
    return;
  }
  if (!isValidAIIndustry(industry)) {
    res.status(400).json({ error: "Invalid industry" });
    return;
  }
  try {
    const excludeIds = await getApplicantAIExcludeIds(applicantId, industry);
    const pick = pickAIReadinessQuestions(industry, excludeIds, AI_QUESTIONS_PER_ATTEMPT, applicantId);
    res.json({
      industry,
      questions: pick.questions,
      remainingPool: pick.remainingPool,
      totalPool: pick.totalPool,
      exhausted: pick.exhausted,
      perAttempt: AI_QUESTIONS_PER_ATTEMPT,
      totalPerIndustry: AI_QUESTIONS_PER_INDUSTRY,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to pick ai-readiness questions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/ai-readiness/submit", requireVerifiedUser, applicantAccess(req => req.body?.applicantId, "write"), async (req, res) => {
  const { applicantId, industry, jobId, questionIds, answers } = req.body ?? {};
  if (
    !applicantId ||
    !industry ||
     !Array.isArray(questionIds) || !questionIds.every(id => typeof id === "string") ||
    !answers ||
     typeof answers !== "object" || Array.isArray(answers)
  ) {
    res.status(400).json({ error: "Missing required fields (applicantId, industry, questionIds, answers)" });
    return;
  }
  if (!isValidAIIndustry(industry)) {
    res.status(400).json({ error: "Invalid industry" });
    return;
  }
  try {
    const grading = gradeAIReadiness(
      industry,
      questionIds as string[],
      answers as Record<string, number>,
    );
    const passed = grading.score >= 60;
    const headline = passed
      ? `Strong AI readiness — ${grading.correctCount}/${grading.total} most-aligned answers.`
      : `Room to grow — ${grading.correctCount}/${grading.total} most-aligned answers.`;
    const aiData = encodeAIData({
      used: questionIds as string[],
      details: grading.details,
      industry,
    });
    const feedback = `${headline} ${aiData}`;
    const resolvedJobId = typeof jobId === "number" && jobId > 0 ? jobId : null;
    const [saved] = await db.insert(assessmentResultsTable).values({
      applicantId,
      assessmentId: AI_ASSESSMENT_ID,
      assessmentTitle: `AI Readiness — ${industry}`,
      score: grading.score,
      passed,
      feedback,
      jobId: resolvedJobId,
    }).returning();

    const excludeIds = await getApplicantAIExcludeIds(applicantId, industry);
    const remainingPool = Math.max(0, AI_QUESTIONS_PER_INDUSTRY - excludeIds.length);

    res.json({
      ...saved,
      completedAt: saved.completedAt.toISOString(),
      grading: {
        score: grading.score,
        correctCount: grading.correctCount,
        total: grading.total,
        details: grading.details,
      },
      remainingPool,
      totalPerIndustry: AI_QUESTIONS_PER_INDUSTRY,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to save ai-readiness result");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const params = GetAssessmentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const [assessment] = await db.select().from(assessmentsTable).where(eq(assessmentsTable.id, params.data.id));
    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }
    res.json({ ...assessment, questions: Array.isArray(assessment.questions) ? assessment.questions : [],
      createdAt: assessment.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get assessment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/submit", requireVerifiedUser, applicantAccess(req => req.body?.applicantId, "write"), async (req, res) => {
  const params = SubmitAssessmentParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = SubmitAssessmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [assessment] = await db.select().from(assessmentsTable).where(eq(assessmentsTable.id, params.data.id));
    if (!assessment) {
      res.status(404).json({ error: "Assessment not found" });
      return;
    }

    const bypassed = await isApplicantCooldownBypassed(parsed.data.applicantId);
    if (!bypassed) {
      const latest = await getLatestResult(parsed.data.applicantId, params.data.id);
      if (latest && isTooSoon(latest.completedAt)) {
        res.status(429).json({ error: "Retake cooldown active", retakeAvailableAt: addOneMonth(latest.completedAt).toISOString() });
        return;
      }
    }

    const questions = Array.isArray(assessment.questions) ? assessment.questions : [];
    const answeredCount = parsed.data.answers.length;
    const totalQuestions = questions.length;

    const score = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
    const passed = score >= 60;

    const feedbackMessages = [
      passed
        ? "Excellent! Your responses demonstrate strong alignment with what employers are looking for."
        : "Thank you for completing the assessment. We recommend reviewing the relevant areas and trying again.",
      passed
        ? "Your profile has been updated with this assessment result."
        : "Check out our recommended courses to help strengthen your skills in this area.",
    ];

    const [result] = await db.insert(assessmentResultsTable).values({
      applicantId: parsed.data.applicantId,
      assessmentId: params.data.id,
      assessmentTitle: assessment.title,
      score,
      passed,
      feedback: feedbackMessages.join(" "),
    }).returning();

    res.json({
      ...result,
      completedAt: result.completedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to submit assessment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/applicant/:id/results", requireVerifiedUser, applicantAccess(req => req.params.id, "report"), async (req, res) => {
  const params = GetApplicantAssessmentResultsParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const results = await db
      .select()
      .from(assessmentResultsTable)
      .where(eq(assessmentResultsTable.applicantId, params.data.id))
      .orderBy(asc(assessmentResultsTable.completedAt));
    res.json(results.map(r => ({ ...r, completedAt: r.completedAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get assessment results");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
