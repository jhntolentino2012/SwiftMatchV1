import { Router, type IRouter } from "express";
import healthRouter from "./health";
import applicantsRouter from "./applicants";
import assessmentsRouter from "./assessments";
import jobsRouter from "./jobs";
import coursesRouter from "./courses";
import skillsRouter from "./skills";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/applicants", applicantsRouter);
router.use("/assessments", assessmentsRouter);
router.use("/applicants", (req, res, next) => {
  if (req.path.match(/^\/\d+\/assessment-results$/)) {
    const id = req.path.split("/")[1];
    req.url = `/applicant/${id}/results`;
    return assessmentsRouter(req, res, next);
  }
  next();
});
router.use("/jobs", jobsRouter);
router.use("/courses", coursesRouter);
router.use("/skills", skillsRouter);

export default router;
