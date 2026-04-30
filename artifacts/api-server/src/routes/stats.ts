import { Router, type IRouter } from "express";
import { db, applicantsTable, jobsTable } from "@workspace/db";
import { count, countDistinct } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const [[applicantsResult], [companiesResult]] = await Promise.all([
      db.select({ count: count() }).from(applicantsTable),
      db.select({ count: countDistinct(jobsTable.company) }).from(jobsTable),
    ]);

    res.json({
      applicantsCount: applicantsResult?.count ?? 0,
      companiesCount: companiesResult?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
