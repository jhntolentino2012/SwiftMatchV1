import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable, applicantsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireVerifiedUser } from "../middlewares/report-access.js";
import { UpdateApplicantBody } from "@workspace/api-zod";

const router = Router();
router.use(requireVerifiedUser);

function jwtSecret(): string {
  const s = process.env["SESSION_SECRET"];
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function requireAuth(req: any): { userId: number } | null {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(authHeader.slice(7), jwtSecret()) as { userId: number };
  } catch {
    return null;
  }
}

/* ── GET /profile ──────────────────────────────────────
   Returns the full applicant record for the logged-in user.
─────────────────────────────────────────────────────── */
router.get("/", async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) { res.status(401).json({ error: "Authentication required." }); return; }

  try {
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found." }); return; }

    const [applicant] = await db.select().from(applicantsTable)
      .where(eq(applicantsTable.email, user.email))
      .orderBy(applicantsTable.id)
      .limit(1);
    if (!applicant) { res.status(404).json({ error: "Applicant profile not found." }); return; }

    res.json({
      ...applicant,
      skills: Array.isArray(applicant.skills) ? applicant.skills : [],
      employmentHistory: Array.isArray(applicant.employmentHistory) ? applicant.employmentHistory : [],
      certificates: Array.isArray(applicant.certificates) ? applicant.certificates : [],
      references: Array.isArray(applicant.references) ? applicant.references : [],
      phone: user.phone,
      createdAt: applicant.createdAt.toISOString(),
      updatedAt: applicant.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Internal server error." });
  }
});

/* ── PUT /profile ──────────────────────────────────────
   Updates allowed fields on the applicant record for the
   logged-in user.
─────────────────────────────────────────────────────── */
router.put("/", async (req, res) => {
  const payload = requireAuth(req);
  if (!payload) { res.status(401).json({ error: "Authentication required." }); return; }

  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body)
    ? req.body as Record<string, unknown> : {};
  const arrayFields = ["skills", "employmentHistory", "certificates", "references"] as const;
  const arrayUpdates: Record<string, unknown> = {};
  for (const field of arrayFields) {
    if (body[field] !== undefined) arrayUpdates[field] = body[field];
  }
  const validated = UpdateApplicantBody.safeParse(arrayUpdates);
  if (!validated.success) {
    res.status(400).json({ error: validated.error.message }); return;
  }

  try {
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found." }); return; }

    const ALLOWED = [
      "firstName", "lastName", "middleName", "suffix", "pronoun", "nickname",
      "permanentAddress", "currentAddress", "phoneAreaCode", "phoneNumber", "homePhone",
      "skills", "employmentHistory", "certificates", "references",
      "facebookUrl", "linkedinUrl",
      "headline",
      "targetIndustry", "targetRole", "careerLevel", "expertise", "workSetup",
      "expectedSalary", "salaryNegotiable", "availabilityDate",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of ALLOWED) {
      if (body[field] !== undefined) updates[field] = body[field] ?? null;
    }
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update." }); return;
    }

    const [updated] = await db.update(applicantsTable)
      .set(updates)
      .where(eq(applicantsTable.email, user.email))
      .returning();
    if (!updated) { res.status(404).json({ error: "Applicant profile not found." }); return; }

    res.json({
      ...updated,
      skills: Array.isArray(updated.skills) ? updated.skills : [],
      employmentHistory: Array.isArray(updated.employmentHistory) ? updated.employmentHistory : [],
      certificates: Array.isArray(updated.certificates) ? updated.certificates : [],
      references: Array.isArray(updated.references) ? updated.references : [],
      phone: user.phone,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
