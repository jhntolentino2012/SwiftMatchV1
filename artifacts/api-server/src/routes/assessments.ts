import { Router, type IRouter } from "express";
import { db, assessmentsTable, assessmentResultsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { pickQuiz, INDUSTRY_QUESTIONS } from "../lib/industry-questions.js";
import {
  GetAssessmentParams,
  SubmitAssessmentParams,
  SubmitAssessmentBody,
  GetApplicantAssessmentResultsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

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
  const excludeParam = String(req.query.exclude ?? "");
  const excludeIds = excludeParam ? excludeParam.split(",").filter(Boolean) : [];

  const validIndustry = Object.keys(INDUSTRY_QUESTIONS).includes(industry);
  if (!validIndustry) {
    res.status(400).json({ error: "Invalid or missing industry" });
    return;
  }

  const questions = pickQuiz(industry, excludeIds);
  res.json(questions);
});

// Save K&E quiz result
router.post("/ke-quiz/submit", async (req, res) => {
  const { applicantId, industry, score } = req.body;
  if (!applicantId || !industry || score === undefined) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const passed = score >= 60;
    const feedback = passed
      ? `Strong performance in ${industry}! Your domain knowledge is well above the baseline.`
      : `Keep studying ${industry} concepts — review key topics and retry for a better score.`;

    const [result] = await db.insert(assessmentResultsTable).values({
      applicantId,
      assessmentId: 1,
      assessmentTitle: `Knowledge & Expertise — ${industry}`,
      score,
      passed,
      feedback,
    }).returning();

    res.json({ ...result, completedAt: result.completedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to save ke-quiz result");
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
    res.json({ ...assessment, createdAt: assessment.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get assessment");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/submit", async (req, res) => {
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

    const questions = assessment.questions as Array<{ id: number; type: string }>;
    const answeredCount = parsed.data.answers.length;
    const totalQuestions = questions.length;
    const mcAnswers = parsed.data.answers.filter(a => {
      const q = questions.find(q => q.id === a.questionId);
      return q?.type === "multiple_choice";
    });

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

router.get("/applicant/:id/results", async (req, res) => {
  const params = GetApplicantAssessmentResultsParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const results = await db
      .select()
      .from(assessmentResultsTable)
      .where(eq(assessmentResultsTable.applicantId, params.data.id));
    res.json(results.map(r => ({ ...r, completedAt: r.completedAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get assessment results");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
