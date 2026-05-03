import { Router } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable, applicantsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

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
      "targetIndustry", "targetRole", "careerLevel", "workSetup",
      "expectedSalary", "salaryNegotiable", "availabilityDate",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of ALLOWED) {
      if (req.body[field] !== undefined) updates[field] = req.body[field] ?? null;
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
