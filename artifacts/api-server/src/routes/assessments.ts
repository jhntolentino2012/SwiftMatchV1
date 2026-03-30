import { Router, type IRouter } from "express";
import { db, assessmentsTable, assessmentResultsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetAssessmentParams,
  SubmitAssessmentParams,
  SubmitAssessmentBody,
  GetApplicantAssessmentResultsParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SEED_ASSESSMENTS = [
  {
    title: "Knowledge & Expertise Assessment",
    category: "knowledge",
    description: "Test your industry knowledge and professional expertise to showcase your qualifications.",
    questions: [
      { id: 1, text: "How many years of professional experience do you have in your primary field?", type: "multiple_choice", options: ["Less than 1 year", "1-2 years", "3-5 years", "6-10 years", "More than 10 years"] },
      { id: 2, text: "Which of the following best describes your highest level of education?", type: "multiple_choice", options: ["High School Diploma", "Vocational/Technical Certificate", "Bachelor's Degree", "Master's Degree", "Doctorate or Higher"] },
      { id: 3, text: "How would you rate your proficiency in your top skill?", type: "multiple_choice", options: ["Beginner", "Intermediate", "Advanced", "Expert"] },
      { id: 4, text: "Describe a major project or achievement in your career that demonstrates your expertise.", type: "text", options: null },
      { id: 5, text: "How do you stay updated with industry trends and developments?", type: "multiple_choice", options: ["Online courses & certifications", "Industry publications & journals", "Professional networking events", "Mentorship & peer learning", "All of the above"] },
    ],
  },
  {
    title: "Personality & Work Style Assessment",
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
    title: "Work Commitment Assessment",
    category: "commitment",
    description: "Evaluate your dedication, reliability, and long-term commitment to your professional role.",
    questions: [
      { id: 1, text: "What is your preferred work arrangement?", type: "multiple_choice", options: ["Full-time onsite", "Full-time remote", "Hybrid (mix of both)", "Part-time", "Freelance/Contract"] },
      { id: 2, text: "Are you willing to work overtime or on weekends when required?", type: "multiple_choice", options: ["Yes, regularly", "Yes, occasionally", "Only with advance notice", "No, I prefer strict work hours"] },
      { id: 3, text: "What is your expected length of commitment to a new role?", type: "multiple_choice", options: ["Less than 1 year", "1-2 years", "3-5 years", "Long-term (5+ years)", "Depends on the role"] },
      { id: 4, text: "How soon can you start if selected?", type: "multiple_choice", options: ["Immediately", "Within 2 weeks", "1 month", "More than 1 month"] },
      { id: 5, text: "What motivates you most in a job?", type: "multiple_choice", options: ["Salary and benefits", "Career growth opportunities", "Work-life balance", "Company culture and values", "Making a meaningful impact"] },
    ],
  },
  {
    title: "Situational Judgement Assessment",
    category: "situational",
    description: "Test how you respond to real-world workplace scenarios to evaluate your decision-making and professionalism.",
    questions: [
      { id: 1, text: "Your manager assigns you a task with an unrealistic deadline. You would:", type: "multiple_choice", options: ["Attempt to complete it no matter what", "Immediately communicate concerns and negotiate", "Complete what's possible and report the rest", "Ask a colleague to help without telling the manager"] },
      { id: 2, text: "A coworker consistently takes credit for your ideas in team meetings. You would:", type: "multiple_choice", options: ["Confront them publicly in the next meeting", "Speak to them privately about the issue", "Report the behavior to HR or management", "Start documenting your ideas and sharing them proactively"] },
      { id: 3, text: "You discover a colleague is violating company policy. You would:", type: "multiple_choice", options: ["Ignore it as it is not your responsibility", "Confront the colleague directly", "Report it anonymously through proper channels", "Discuss it with other colleagues first"] },
      { id: 4, text: "You are given a task outside your area of expertise. You would:", type: "multiple_choice", options: ["Decline and explain your limitations", "Accept and figure it out as you go", "Accept and proactively seek guidance or training", "Complete it to the best of your ability then review with a mentor"] },
      { id: 5, text: "Your team is behind schedule on a critical project. You would:", type: "multiple_choice", options: ["Work overtime until it's complete", "Immediately reassess priorities and communicate the delay", "Ask for additional resources", "Propose a revised timeline to stakeholders"] },
    ],
  },
];

async function ensureAssessmentsSeededed() {
  const existing = await db.select().from(assessmentsTable);
  if (existing.length === 0) {
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
