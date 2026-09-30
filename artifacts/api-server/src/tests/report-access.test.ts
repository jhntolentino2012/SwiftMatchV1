import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { eq, inArray } from "drizzle-orm";
import { db, pool, usersTable, applicantsTable, jobsTable, jobApplicationsTable, reportEntitlementsTable, assessmentResultsTable, assessmentsTable } from "@workspace/db";
import apiRouter from "../routes/index.js";

// Route-level integration tests, invoking the real Express router and real development DB.
// No listening server, external AI calls, live account changes, or credential output.
if (process.env.NODE_ENV === "production") throw new Error("Tests must not run in production");
const secret = randomBytes(48).toString("hex");
const prefix = `report-test-${randomUUID()}`;
const identities = ["free", "applicant", "employer", "expired", "owner", "unconfirmed"] as const;
type Identity = typeof identities[number];
const fixtures = {} as Record<Identity, { userId: number; applicantId: number; token: string; email: string }>;
let assessmentId: number;
const priorSecret = process.env.SESSION_SECRET;
const priorOwners = process.env.OWNER_EMAILS;

type ApiResponse = { status: number; body: any; headers: Record<string, string> };
function request(path: string, token?: string, method = "GET", body: unknown = {}): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {};
    const res = {
      locals: {}, statusCode: 200,
      setHeader(name: string, value: string) { headers[name.toLowerCase()] = value; return this; },
      status(value: number) { this.statusCode = value; return this; },
      json(value: unknown) { resolve({ status: this.statusCode, body: value, headers }); return this; },
    };
    const req = {
      method, url: path, originalUrl: path,
      get path() { return this.url.split("?")[0]; },
      headers: token ? { authorization: `Bearer ${token}` } : {},
      body, query: {}, params: {},
      log: { info() {}, error() {}, warn() {} },
    };
    // Real route matching includes the legacy assessment-results alias.
    (apiRouter as ReturnType<typeof Router> & {
      handle: (req: Request, res: Response, next: (error?: unknown) => void) => void;
    }).handle(req as unknown as Request, res as unknown as Response, error => {
      if (error) reject(error);
      else resolve({ status: 404, body: {}, headers });
    });
  });
}

test("signup returns JSON for invalid input and duplicate accounts", async () => {
  for (const body of [undefined, {}, { email: 123, password: "password", confirmPassword: "password", phone: "test" }]) {
    const response = await request("/auth/signup", undefined, "POST", body);
    assert.equal(response.status, 400);
    assert.equal(typeof response.body.error, "string");
  }
  const response = await request("/auth/signup", undefined, "POST", {
    email: fixtures.free.email, password: "test-password", confirmPassword: "test-password", phone: "test",
  });
  assert.equal(response.status, 409);
  assert.equal(typeof response.body.error, "string");
});

before(async () => {
  process.env.SESSION_SECRET = secret;
  process.env.OWNER_EMAILS = `${priorOwners ?? ""},${prefix}-owner@example.invalid`;
  for (const identity of identities) {
    const email = `${prefix}-${identity}@example.invalid`;
    const [user] = await db.insert(usersTable).values({
      email, phone: "test-only", passwordHash: "test-not-a-login-hash", isConfirmed: identity !== "unconfirmed",
    }).returning();
    const [applicant] = await db.insert(applicantsTable).values({
      email, firstName: "Authorization", lastName: "Test",
      permanentAddress: "Test", currentAddress: "Test", phoneAreaCode: "+1",
      phoneNumber: "test-only", availabilityDate: "2099-01-01",
    }).returning();
    fixtures[identity] = {
      email, userId: user.id, applicantId: applicant.id,
      token: jwt.sign({ userId: user.id, email }, secret, { expiresIn: "5m" }),
    };
  }
  await db.insert(reportEntitlementsTable).values([
    { userId: fixtures.applicant.userId, scope: "applicant", expiresAt: new Date(Date.now() + 60_000) },
    { userId: fixtures.employer.userId, scope: "employer", expiresAt: new Date(Date.now() + 60_000) },
    { userId: fixtures.expired.userId, scope: "applicant", expiresAt: new Date(Date.now() + 250) },
  ]);
  const [assessment] = await db.insert(assessmentsTable).values({
    title: prefix, category: "test", description: "Authorization test", questions: [],
  }).returning();
  assessmentId = assessment.id;
  await db.insert(assessmentResultsTable).values({
    applicantId: fixtures.applicant.applicantId, assessmentId, assessmentTitle: prefix,
    score: 83, passed: true, feedback: "Authorization test",
  });
  await new Promise(resolve => setTimeout(resolve, 300));
});

after(async () => {
  const values = Object.values(fixtures);
  if (values.length) {
    await db.delete(assessmentResultsTable).where(inArray(assessmentResultsTable.applicantId, values.map(f => f.applicantId)));
    await db.delete(applicantsTable).where(inArray(applicantsTable.id, values.map(f => f.applicantId)));
    await db.delete(usersTable).where(inArray(usersTable.id, values.map(f => f.userId)));
  }
  if (assessmentId) await db.delete(assessmentsTable).where(eq(assessmentsTable.id, assessmentId));
  if (priorSecret === undefined) delete process.env.SESSION_SECRET;
  else process.env.SESSION_SECRET = priorSecret;
  if (priorOwners === undefined) delete process.env.OWNER_EMAILS;
  else process.env.OWNER_EMAILS = priorOwners;
  await pool.end();
});

test("missing, invalid, expired JWT and unconfirmed/missing users are rejected without caching", async () => {
  const tokens = [
    undefined, "invalid",
    jwt.sign({ userId: fixtures.free.userId }, secret, { expiresIn: -1 }),
    jwt.sign({ userId: 2147483647 }, secret),
    fixtures.unconfirmed.token,
  ];
  for (const token of tokens) {
    for (const path of [
      "/auth/report-access", "/applicants", `/applicants/${fixtures.free.applicantId}`,
      `/assessments/applicant/${fixtures.free.applicantId}/results`,
      `/applicants/${fixtures.free.applicantId}/assessment-results`,
    ]) {
      const result = await request(path, token);
      assert.equal(result.status, 401, path);
      assert.equal(result.headers["cache-control"], "no-store");
    }
  }
});

test("free and expired grants expose no report or candidate permission", async () => {
  for (const identity of ["free", "expired"] as const) {
    const { token, applicantId } = fixtures[identity];
    const access = await request("/auth/report-access", token);
    assert.deepEqual(access.body, { canViewReports: false, canViewCandidatePool: false });
    assert.equal(access.headers["cache-control"], "no-store");
    for (const path of [
      "/applicants", `/assessments/applicant/${applicantId}/results`,
      `/applicants/${applicantId}/assessment-results`, "/jobs/applications/me",
      "/jobs/1/applications", "/resume/match-analysis",
    ]) {
      const result = await request(path, token);
      assert.equal(result.status, 403, path);
      assert.equal(result.body.code, "SUBSCRIPTION_REQUIRED");
    }
    assert.equal((await request(`/applicants/${applicantId}`, token)).status, 200);
    const other = await request(`/applicants/${fixtures.applicant.applicantId}`, token);
    assert.equal(other.status, 403);
    assert.equal(other.body.code, "REPORT_ACCESS_DENIED");
  }
});

test("applicant entitlement reads own report and alias, never others or candidate pool", async () => {
  const { token, applicantId } = fixtures.applicant;
  assert.deepEqual((await request("/auth/report-access", token)).body,
    { canViewReports: true, canViewCandidatePool: false });
  for (const path of [
    `/assessments/applicant/${applicantId}/results`, `/applicants/${applicantId}/assessment-results`,
  ]) {
    const result = await request(path, token);
    assert.equal(result.status, 200);
    assert.equal(result.body[0].score, 83);
  }
  for (const path of [
    `/assessments/applicant/${fixtures.free.applicantId}/results`,
    `/applicants/${fixtures.free.applicantId}/assessment-results`,
    `/applicants/${fixtures.free.applicantId}`,
  ]) {
    const result = await request(path, token);
    assert.equal(result.status, 403);
    assert.equal(result.body.code, "REPORT_ACCESS_DENIED");
  }
  assert.equal((await request("/applicants", token)).status, 403);
});

test("active employer and confirmed owner bypass read candidate pool and any report", async () => {
  for (const identity of ["employer", "owner"] as const) {
    const { token } = fixtures[identity];
    assert.deepEqual((await request("/auth/report-access", token)).body,
      { canViewReports: true, canViewCandidatePool: true });
    for (const path of [
      "/applicants", `/applicants/${fixtures.applicant.applicantId}`,
      `/assessments/applicant/${fixtures.applicant.applicantId}/results`,
      `/applicants/${fixtures.applicant.applicantId}/assessment-results`, "/jobs/1/applications",
    ]) assert.equal((await request(path, token)).status, 200, path);
  }
});

test("JWT email claims cannot impersonate an owner or different applicant", async () => {
  const token = jwt.sign({ userId: fixtures.free.userId, email: fixtures.owner.email }, secret);
  assert.deepEqual((await request("/auth/report-access", token)).body,
    { canViewReports: false, canViewCandidatePool: false });
  assert.equal((await request(`/applicants/${fixtures.owner.applicantId}`, token)).status, 403);
});

test("profile writes reject unauthenticated, cross-user and email takeover; own basic writes are free", async () => {
  const path = `/applicants/${fixtures.free.applicantId}`;
  assert.equal((await request(path, undefined, "PATCH", {})).status, 401);
  assert.equal((await request(path, fixtures.employer.token, "PATCH", { firstName: "Changed" })).status, 403);
  assert.equal((await request(path, fixtures.free.token, "PATCH", { email: fixtures.owner.email })).status, 403);
  assert.equal((await request(path, fixtures.owner.token, "PATCH", { email: fixtures.owner.email })).status, 403);
  assert.equal((await request(path, fixtures.free.token, "PATCH", { firstName: "Own" })).status, 200);
  assert.equal((await request("/applicants", undefined, "POST", {})).status, 401);
});

test("assessment submissions enforce ownership but keep free completion feedback", async () => {
  for (const path of [
    "/assessments/ke-quiz/submit", "/assessments/personality/submit",
    "/assessments/cultural-fit/submit", "/assessments/critical-thinking/submit",
    "/assessments/ai-readiness/submit", `/assessments/${assessmentId}/submit`,
  ]) {
    const body = { applicantId: fixtures.applicant.applicantId };
    assert.equal((await request(path, undefined, "POST", body)).status, 401, path);
    assert.equal((await request(path, fixtures.free.token, "POST", body)).status, 403, path);
    assert.equal((await request(path, fixtures.employer.token, "POST", body)).status, 403, path);
  }
  const result = await request(`/assessments/${assessmentId}/submit`, fixtures.free.token, "POST", {
    applicantId: fixtures.free.applicantId, answers: [],
  });
  assert.equal(result.status, 200);
  assert.equal(typeof result.body.score, "number");
  assert.equal(result.body.applicantId, fixtures.free.applicantId);
  assert.equal((await request(`/applicants/${fixtures.free.applicantId}/assessment-results`, fixtures.free.token)).status, 403);
});

test("grants are trusted-only and expiry/scope are enforced by the database", async () => {
  assert.equal((await request("/auth/report-access", fixtures.free.token, "POST", {
    scope: "employer", expiresAt: "2099-01-01",
  })).status, 404);
  await assert.rejects(db.insert(reportEntitlementsTable).values({
    userId: fixtures.free.userId, scope: "applicant", expiresAt: new Date(Date.now() - 1000),
  }));
  await assert.rejects(db.insert(reportEntitlementsTable).values({
    userId: fixtures.free.userId, scope: "admin" as "employer", expiresAt: new Date(Date.now() + 60000),
  }));
});

test("revocation takes effect immediately without JWT renewal", async () => {
  const { token, userId, applicantId } = fixtures.applicant;
  await db.delete(reportEntitlementsTable).where(eq(reportEntitlementsTable.userId, userId));
  assert.deepEqual((await request("/auth/report-access", token)).body,
    { canViewReports: false, canViewCandidatePool: false });
  assert.equal((await request(`/applicants/${applicantId}/assessment-results`, token)).status, 403);
});

test("profile rejects malformed array writes without replacing existing data", async () => {
  const token = fixtures.free.token;
  assert.equal((await request("/profile", token, "PUT", { skills: ["Existing"] })).status, 200);
  for (const body of [
    { skills: { 0: "Not an array" } },
    { employmentHistory: null },
    { certificates: [null] },
    { references: [{ name: "Incomplete" }] },
  ]) {
    assert.equal((await request("/profile", token, "PUT", body)).status, 400);
  }
  assert.deepEqual((await request("/profile", token)).body.skills, ["Existing"]);
});

test("job array writes reject bad payloads and malformed DB questions cannot leak answer keys or crash grading", async () => {
  const [job] = await db.insert(jobsTable).values({
    title: prefix, company: prefix, location: "Test", description: "Test",
    industry: "Test", salaryRange: "Test",
    customQuestions: [{ id: "q1", text: "Question", type: "text", correctAnswers: ["secret"] }],
  }).returning();
  try {
    for (const body of [
      { requirements: {} },
      { customQuestions: { id: "q1" } },
      { customQuestions: [{ id: "bad", text: "Bad", type: "text", correctAnswers: {} }] },
    ]) {
      assert.equal((await request(`/jobs/${job.id}`, fixtures.free.token, "PUT", body)).status, 400);
    }
    const unchanged = await db.select().from(jobsTable).where(eq(jobsTable.id, job.id));
    assert.deepEqual(unchanged[0].customQuestions, job.customQuestions);
    await db.update(jobsTable).set({ customQuestions: { broken: true } as unknown as typeof job.customQuestions })
      .where(eq(jobsTable.id, job.id));
    const publicJob = await request(`/jobs/${job.id}`);
    assert.equal(publicJob.status, 200);
    assert.deepEqual(publicJob.body.customQuestions, []);
    assert.deepEqual((await request(`/jobs/${job.id}/custom-assessment`)).body.questions, []);
    assert.equal((await request(`/jobs/${job.id}/custom-assessment/submit`,
      fixtures.free.token, "POST", { answers: {} })).status, 400);
    await db.update(jobsTable).set({
      customQuestions: [{ id: "q1", text: "Question", type: "text", correctAnswers: { broken: true } }] as unknown as typeof job.customQuestions,
    }).where(eq(jobsTable.id, job.id));
    assert.equal(JSON.stringify((await request(`/jobs/${job.id}`)).body).includes("correctAnswers"), false);
    const grade = await request(`/jobs/${job.id}/custom-assessment/submit`,
      fixtures.free.token, "POST", { answers: { q1: "secret" } });
    assert.equal(grade.status, 200);
    assert.equal(grade.body.score, 0);
    assert.deepEqual(grade.body.breakdown[0].correctAnswers, []);
  } finally {
    await db.delete(jobApplicationsTable).where(eq(jobApplicationsTable.jobId, job.id));
    await db.delete(jobsTable).where(eq(jobsTable.id, job.id));
  }
});