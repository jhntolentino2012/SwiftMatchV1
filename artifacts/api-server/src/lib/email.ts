import nodemailer from "nodemailer";
import { logger } from "./logger";

function getBaseUrl(): string {
  const domains = process.env["REPLIT_DOMAINS"];
  if (domains) return `https://${domains.split(",")[0]}`;
  return "http://localhost:80";
}

function createTransporter() {
  const host = process.env["SMTP_HOST"];
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env["SMTP_PORT"] || 587),
    secure: process.env["SMTP_SECURE"] === "true",
    auth: {
      user: process.env["SMTP_USER"],
      pass: process.env["SMTP_PASS"],
    },
  });
}

const FROM = process.env["SMTP_FROM"] || "SwiftMatch <no-reply@swiftmatch.app>";

export async function sendConfirmationEmail(to: string, token: string) {
  const link = `${getBaseUrl()}/email-confirmed?token=${token}`;
  const transporter = createTransporter();

  if (!transporter) {
    logger.info({ link, to }, "DEV: Email confirmation link (SMTP not configured)");
    return;
  }

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Confirm your SwiftMatch account",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
        <h2 style="color:#1e3a5f">Welcome to SwiftMatch!</h2>
        <p>Thank you for signing up. Please confirm your email address to activate your account.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#1e3a5f;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Confirm My Email
        </a>
        <p style="color:#888;font-size:13px">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${getBaseUrl()}/reset-password?token=${token}`;
  const transporter = createTransporter();

  if (!transporter) {
    logger.info({ link, to }, "DEV: Password reset link (SMTP not configured)");
    return;
  }

  await transporter.sendMail({
    from: FROM,
    to,
    subject: "Reset your SwiftMatch password",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px">
        <h2 style="color:#1e3a5f">Password Reset Request</h2>
        <p>We received a request to reset the password for your SwiftMatch account.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#1e3a5f;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Reset My Password
        </a>
        <p style="color:#888;font-size:13px">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}
