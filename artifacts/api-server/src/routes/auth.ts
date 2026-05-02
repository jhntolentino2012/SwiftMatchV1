import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { db } from "@workspace/db";
import { usersTable, applicantsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { sendConfirmationEmail, sendPasswordResetEmail } from "../lib/email";

const router = Router();

function jwtSecret(): string {
  const s = process.env["SESSION_SECRET"];
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function tokenExpiry(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Owner / admin emails — bypass email confirmation on signup so they can log in
 * immediately without waiting for a confirmation email. Configure additional
 * owners by setting the OWNER_EMAILS env var (comma-separated).
 */
const DEFAULT_OWNER_EMAILS = ["jhn.tolentino2012@gmail.com"];
const OWNER_EMAILS = new Set(
  [
    ...DEFAULT_OWNER_EMAILS,
    ...(process.env["OWNER_EMAILS"]?.split(",") ?? []),
  ]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

function isOwnerEmail(email: string): boolean {
  return OWNER_EMAILS.has(email.toLowerCase());
}

/* ── POST /auth/signup ─────────────────────────────── */
router.post("/signup", async (req, res) => {
  const { email, password, confirmPassword, phone } = req.body as any;

  if (!email || !password || !confirmPassword || !phone) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }
  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match." });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const normalizedEmail = email.toLowerCase();
  const owner = isOwnerEmail(normalizedEmail);

  if (owner) {
    // Owner accounts skip email confirmation entirely.
    await db.insert(usersTable).values({
      email: normalizedEmail,
      passwordHash,
      phone,
      isConfirmed: true,
    });
    req.log.info({ email: normalizedEmail }, "Owner account auto-confirmed on signup");
    res.status(201).json({
      confirmed: true,
      message: "Owner account created and auto-activated. You can sign in immediately.",
    });
    return;
  }

  const confirmationToken = generateToken();
  const confirmationTokenExpiry = tokenExpiry(24);

  await db.insert(usersTable).values({
    email: normalizedEmail,
    passwordHash,
    phone,
    confirmationToken,
    confirmationTokenExpiry,
  });

  await sendConfirmationEmail(normalizedEmail, confirmationToken);

  res.status(201).json({
    confirmed: false,
    message: "Account created. Please check your email to confirm your account.",
  });
});

/* ── GET /auth/confirm-email ───────────────────────── */
router.get("/confirm-email", async (req, res) => {
  const { token } = req.query as any;
  if (!token) {
    res.status(400).json({ error: "Token is required." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.confirmationToken, token)).limit(1);
  if (!user) {
    res.status(404).json({ error: "Invalid or expired confirmation token." });
    return;
  }
  if (user.confirmationTokenExpiry && user.confirmationTokenExpiry < new Date()) {
    res.status(410).json({ error: "Confirmation token has expired. Please sign up again." });
    return;
  }

  await db.update(usersTable).set({ isConfirmed: true, confirmationToken: null, confirmationTokenExpiry: null }).where(eq(usersTable.id, user.id));

  res.json({ message: "Email confirmed successfully. You can now sign in." });
});

/* ── POST /auth/login ──────────────────────────────── */
router.post("/login", async (req, res) => {
  const { email, password } = req.body as any;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  if (!user.isConfirmed) {
    res.status(403).json({ error: "Please confirm your email address before signing in. Check your inbox." });
    return;
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret(), { expiresIn: "7d" });

  res.json({ token, user: { id: user.id, email: user.email, phone: user.phone } });
});

/* ── POST /auth/forgot-password ────────────────────── */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body as any;
  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);

  // Always return success to prevent email enumeration
  if (!user || !user.isConfirmed) {
    res.json({ message: "If that email is registered, a reset link has been sent." });
    return;
  }

  const resetToken = generateToken();
  const resetTokenExpiry = tokenExpiry(1);
  await db.update(usersTable).set({ resetToken, resetTokenExpiry }).where(eq(usersTable.id, user.id));

  await sendPasswordResetEmail(user.email, resetToken);

  res.json({ message: "If that email is registered, a reset link has been sent." });
});

/* ── POST /auth/reset-password ─────────────────────── */
router.post("/reset-password", async (req, res) => {
  const { token, password, confirmPassword } = req.body as any;
  if (!token || !password || !confirmPassword) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }
  if (password !== confirmPassword) {
    res.status(400).json({ error: "Passwords do not match." });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, token)).limit(1);
  if (!user) {
    res.status(404).json({ error: "Invalid or expired reset token." });
    return;
  }
  if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
    res.status(410).json({ error: "Reset token has expired. Please request a new one." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.update(usersTable).set({ passwordHash, resetToken: null, resetTokenExpiry: null }).where(eq(usersTable.id, user.id));

  res.json({ message: "Password updated successfully. You can now sign in." });
});

/* ── GET /auth/me ──────────────────────────────────── */
router.get("/me", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated." });
    return;
  }
  try {
    const payload = jwt.verify(authHeader.slice(7), jwtSecret()) as any;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) { res.status(404).json({ error: "User not found." }); return; }

    // Look up applicant record by email
    let [applicant] = await db.select({ id: applicantsTable.id, targetIndustry: applicantsTable.targetIndustry })
      .from(applicantsTable)
      .where(eq(applicantsTable.email, user.email))
      .limit(1);

    // Auto-create a stub applicant for owner accounts so they can use assessments
    // without completing the full onboarding form.
    if (!applicant && isOwnerEmail(user.email)) {
      const emailHandle = user.email.split("@")[0] ?? "owner";
      const [created] = await db.insert(applicantsTable).values({
        firstName: emailHandle,
        lastName: "Owner",
        permanentAddress: "N/A",
        currentAddress: "N/A",
        phoneAreaCode: "63",
        phoneNumber: user.phone || "0000000000",
        email: user.email,
        availabilityDate: "Immediate",
      }).returning({ id: applicantsTable.id });
      applicant = created;
      req.log.info({ email: user.email, applicantId: applicant?.id }, "Auto-created stub applicant for owner");
    }

    res.json({ id: user.id, email: user.email, phone: user.phone, applicantId: applicant?.id ?? null, targetIndustry: applicant?.targetIndustry ?? null });
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
});

export default router;
