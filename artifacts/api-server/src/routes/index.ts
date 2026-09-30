import { Router, type NextFunction, type Request, type Response } from "express";
import healthRouter from "./health.js";
import applicantsRouter from "./applicants.js";
import assessmentsRouter from "./assessments.js";
import jobsRouter from "./jobs.js";
import coursesRouter from "./courses.js";
import skillsRouter from "./skills.js";
import resumeRouter from "./resume.js";
import statsRouter from "./stats.js";
import authRouter from "./auth.js";
import profileRouter from "./profile.js";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/applicants", applicantsRouter);
router.use("/assessments", assessmentsRouter);
router.use("/applicants", (req: Request, res: Response, next: NextFunction) => {
  const requestWithUrl = req as Request & { url?: string };
  const assessmentResultsMatch = requestWithUrl.url?.match(/^\/(\d+)\/assessment-results(?:\?|$)/);
  if (assessmentResultsMatch) {
    const id = assessmentResultsMatch[1];
    requestWithUrl.url = `/applicant/${id}/results`;
    assessmentsRouter(req, res, next);
    return;
  }
  const continueRouting = next as unknown as () => void;
  continueRouting();
});
router.use("/jobs", jobsRouter);
router.use("/courses", coursesRouter);
router.use("/skills", skillsRouter);
router.use("/resume", resumeRouter);
router.use("/stats", statsRouter);

export default router;
