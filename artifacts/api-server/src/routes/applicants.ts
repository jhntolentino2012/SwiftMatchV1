import { Router, type IRouter } from "express";
import { db, applicantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireVerifiedUser, verifiedUser, requireCandidatePool, applicantAccess, denyReport } from "../middlewares/report-access";
import {
  CreateApplicantBody,
  UpdateApplicantBody,
  GetApplicantParams,
  UpdateApplicantParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatApplicant(a: typeof applicantsTable.$inferSelect) {
  return {
    ...a,
    skills: Array.isArray(a.skills) ? a.skills : [],
    employmentHistory: Array.isArray(a.employmentHistory) ? a.employmentHistory : [],
    certificates: Array.isArray(a.certificates) ? a.certificates : [],
    references: Array.isArray(a.references) ? a.references : [],
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

router.get("/", requireVerifiedUser, requireCandidatePool, async (req, res) => {
  try {
    const applicants = await db.select().from(applicantsTable).orderBy(applicantsTable.createdAt);
    res.json(applicants.map(formatApplicant));
  } catch (err) {
    req.log.error({ err }, "Failed to list applicants");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireVerifiedUser, async (req, res) => {
  const parsed = CreateApplicantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    if (parsed.data.email.toLowerCase() !== verifiedUser(res).email.toLowerCase()) {
      denyReport(res, "REPORT_ACCESS_DENIED"); return;
    }
    const [existing] = await db.select({ id: applicantsTable.id }).from(applicantsTable)
      .where(eq(applicantsTable.email, verifiedUser(res).email)).limit(1);
    if (existing) { res.status(409).json({ error: "Applicant profile already exists." }); return; }
    const [applicant] = await db
      .insert(applicantsTable)
      .values({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        middleName: parsed.data.middleName ?? null,
        suffix: parsed.data.suffix ?? null,
        pronoun: parsed.data.pronoun ?? null,
        nickname: parsed.data.nickname ?? null,
        permanentAddress: parsed.data.permanentAddress,
        currentAddress: parsed.data.currentAddress,
        phoneAreaCode: parsed.data.phoneAreaCode,
        phoneNumber: parsed.data.phoneNumber,
        homePhone: parsed.data.homePhone ?? null,
        email: verifiedUser(res).email,
        skills: parsed.data.skills as string[],
        employmentHistory: parsed.data.employmentHistory,
        certificates: parsed.data.certificates,
        references: parsed.data.references,
        facebookUrl: parsed.data.facebookUrl ?? null,
        linkedinUrl: parsed.data.linkedinUrl ?? null,
        targetIndustry: (parsed.data as any).targetIndustry ?? null,
        targetRole: (parsed.data as any).targetRole ?? null,
        expectedSalary: parsed.data.expectedSalary ?? null,
        salaryNegotiable: parsed.data.salaryNegotiable,
        availabilityDate: parsed.data.availabilityDate,
        status: parsed.data.status,
      })
      .returning();

    res.status(201).json(formatApplicant(applicant));
  } catch (err) {
    req.log.error({ err }, "Failed to create applicant");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireVerifiedUser, applicantAccess(req => req.params.id, "profile"), async (req, res) => {
  const params = GetApplicantParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  try {
    const [applicant] = await db.select().from(applicantsTable).where(eq(applicantsTable.id, params.data.id));
    if (!applicant) {
      res.status(404).json({ error: "Applicant not found" });
      return;
    }
    res.json(formatApplicant(applicant));
  } catch (err) {
    req.log.error({ err }, "Failed to get applicant");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireVerifiedUser, applicantAccess(req => req.params.id, "write"), async (req, res) => {
  const params = UpdateApplicantParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const parsed = UpdateApplicantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const existing = await db.select().from(applicantsTable).where(eq(applicantsTable.id, params.data.id));
    if (!existing[0]) {
      res.status(404).json({ error: "Applicant not found" });
      return;
    }

    const updateData: Partial<typeof applicantsTable.$inferInsert> = {};
    if (parsed.data.firstName !== undefined) updateData.firstName = parsed.data.firstName;
    if (parsed.data.lastName !== undefined) updateData.lastName = parsed.data.lastName;
    if (parsed.data.middleName !== undefined) updateData.middleName = parsed.data.middleName ?? null;
    if (parsed.data.suffix !== undefined) updateData.suffix = parsed.data.suffix ?? null;
    if (parsed.data.pronoun !== undefined) updateData.pronoun = parsed.data.pronoun ?? null;
    if (parsed.data.nickname !== undefined) updateData.nickname = parsed.data.nickname ?? null;
    if (parsed.data.permanentAddress !== undefined) updateData.permanentAddress = parsed.data.permanentAddress;
    if (parsed.data.currentAddress !== undefined) updateData.currentAddress = parsed.data.currentAddress;
    if (parsed.data.phoneAreaCode !== undefined) updateData.phoneAreaCode = parsed.data.phoneAreaCode;
    if (parsed.data.phoneNumber !== undefined) updateData.phoneNumber = parsed.data.phoneNumber;
    if (parsed.data.homePhone !== undefined) updateData.homePhone = parsed.data.homePhone ?? null;
    if (parsed.data.skills !== undefined) updateData.skills = parsed.data.skills as string[];
    if (parsed.data.employmentHistory !== undefined) updateData.employmentHistory = parsed.data.employmentHistory;
    if (parsed.data.certificates !== undefined) updateData.certificates = parsed.data.certificates;
    if (parsed.data.references !== undefined) updateData.references = parsed.data.references;
    if (parsed.data.facebookUrl !== undefined) updateData.facebookUrl = parsed.data.facebookUrl ?? null;
    if (parsed.data.linkedinUrl !== undefined) updateData.linkedinUrl = parsed.data.linkedinUrl ?? null;
    if ((parsed.data as any).targetIndustry !== undefined) (updateData as any).targetIndustry = (parsed.data as any).targetIndustry ?? null;
    if ((parsed.data as any).targetRole !== undefined) (updateData as any).targetRole = (parsed.data as any).targetRole ?? null;
    if (parsed.data.expectedSalary !== undefined) updateData.expectedSalary = parsed.data.expectedSalary ?? null;
    if (parsed.data.salaryNegotiable !== undefined) updateData.salaryNegotiable = parsed.data.salaryNegotiable;
    if (parsed.data.availabilityDate !== undefined) updateData.availabilityDate = parsed.data.availabilityDate;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

    const [updated] = await db
      .update(applicantsTable)
      .set(updateData)
      .where(eq(applicantsTable.id, params.data.id))
      .returning();

    res.json(formatApplicant(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update applicant");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
