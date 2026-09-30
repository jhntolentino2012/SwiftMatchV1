import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { db, usersTable, applicantsTable, reportEntitlementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { isOwnerEmail } from "../lib/owner.js";

type VerifiedUser = Pick<typeof usersTable.$inferSelect, "id" | "email">;

export async function requireVerifiedUser(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Cache-Control", "no-store");
  const header = req.headers.authorization;
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Authentication is not configured." });
    return;
  }
  let userId: number;
  try {
    if (!header?.startsWith("Bearer ")) throw new Error("Missing token");
    const payload = jwt.verify(header.slice(7), secret, { algorithms: ["HS256"] });
    if (typeof payload === "string" || !Number.isSafeInteger(payload.userId) || payload.userId < 1) {
      throw new Error("Invalid user ID");
    }
    userId = payload.userId;
  } catch {
    res.status(401).json({ error: "Authentication required or invalid token." });
    return;
  }
  try {
    const [user] = await db.select({ id: usersTable.id, email: usersTable.email, isConfirmed: usersTable.isConfirmed })
      .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user?.isConfirmed) {
      res.status(401).json({ error: "A confirmed account is required." });
      return;
    }
    res.locals.verifiedUser = user;
    // Compatibility for existing job handlers; email is always authoritative DB identity.
    (req as Request & { user?: { userId: number; email: string } }).user = { userId: user.id, email: user.email };
    next();
  } catch (error) {
    next(error);
  }
}

export function verifiedUser(res: Response): VerifiedUser {
  return res.locals.verifiedUser as VerifiedUser;
}

export async function reportAccess(res: Response) {
  const user = verifiedUser(res);
  if (isOwnerEmail(user.email)) return { canViewReports: true, canViewCandidatePool: true };
  const [grant] = await db.select().from(reportEntitlementsTable)
    .where(eq(reportEntitlementsTable.userId, user.id)).limit(1);
  const active = !!grant && Number.isFinite(grant.expiresAt.getTime()) && grant.expiresAt.getTime() > Date.now();
  return {
    canViewReports: active && (grant.scope === "applicant" || grant.scope === "employer"),
    canViewCandidatePool: active && grant.scope === "employer",
  };
}

export function denyReport(res: Response, code = "SUBSCRIPTION_REQUIRED") {
  res.status(403).json({ error: code, code, message: code === "SUBSCRIPTION_REQUIRED"
    ? "An active report subscription is required." : "You do not have access to this applicant." });
}

export const requireReportSubscription: RequestHandler = async (_req, res, next) => {
  try {
    if (!(await reportAccess(res)).canViewReports) { denyReport(res); return; }
    next();
  } catch (error) { next(error); }
};

export const requireCandidatePool: RequestHandler = async (_req, res, next) => {
  try {
    if (!(await reportAccess(res)).canViewCandidatePool) { denyReport(res); return; }
    next();
  } catch (error) { next(error); }
};

/** Basic own profile is free. Reports need a grant. Writes and submissions require ownership. */
export function applicantAccess(
  id: (req: Request) => unknown,
  mode: "profile" | "report" | "write",
): RequestHandler {
  return async (req, res, next) => {
    try {
      const applicantId = Number(id(req));
      if (!Number.isSafeInteger(applicantId) || applicantId < 1) {
        res.status(400).json({ error: "Invalid applicant ID." }); return;
      }
      const user = verifiedUser(res);
      const owner = isOwnerEmail(user.email);
      const access = mode === "write" ? null : await reportAccess(res);
      if (mode === "report" && !access?.canViewReports) { denyReport(res); return; }
      const [applicant] = await db.select({ email: applicantsTable.email })
        .from(applicantsTable).where(eq(applicantsTable.id, applicantId)).limit(1);
      if (!applicant) { res.status(404).json({ error: "Applicant not found." }); return; }
      const own = applicant.email.toLowerCase() === user.email.toLowerCase();
      if (!own && !owner && (mode === "write" || !access?.canViewCandidatePool)) {
        denyReport(res, "REPORT_ACCESS_DENIED"); return;
      }
      // Identity cannot be reassigned via profile edits, even by privileged users.
      if (mode === "write" && req.body?.email !== undefined &&
          String(req.body.email).toLowerCase() !== applicant.email.toLowerCase()) {
        denyReport(res, "REPORT_ACCESS_DENIED"); return;
      }
      next();
    } catch (error) { next(error); }
  };
}