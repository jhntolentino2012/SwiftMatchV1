import { Router } from "express";
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
router.use("/applicants", (req, res, next) => {
  if (req.path.match(/^\/\d+\/assessment-results$/)) {
    const id = req.path.split("/")[1];
    req.url = `/applicant/${id}/results`;
    assessmentsRouter(req, res, next);
    return;
  }
  next();
});
router.use("/jobs", jobsRouter);
router.use("/courses", coursesRouter);
router.use("/skills", skillsRouter);
router.use("/resume", resumeRouter);
router.use("/stats", statsRouter);

export default router;
