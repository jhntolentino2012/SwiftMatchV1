# Workspace

## Overview

SwiftMatch — a recruitment platform with the tagline "Don't search. Get spotted."
pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Server-controlled report access

- Existing JWT authentication remains in place. Protected routes verify HS256, load the user by signed user ID from PostgreSQL, and require a confirmed account. Token/body email claims never authorize access.
- `GET /api/auth/report-access` returns `{ canViewReports, canViewCandidatePool }` with `Cache-Control: no-store`. Missing/invalid tokens, deleted users and unconfirmed accounts receive 401.
- The `report_entitlements` table has one row per `users.id`, with scope `applicant` or `employer` and a required future `expires_at`. Missing or expired rows grant nothing. Applicant scope permits own reports only; employer scope permits candidate pool and all reports. Confirmed owner accounts bypass subscription checks through the shared server-only owner helper.
- Protected data returns 403 with `code` and `error` equal to `SUBSCRIPTION_REQUIRED` or `REPORT_ACCESS_DENIED`. Both results URLs enforce identical authorization. Own basic profiles remain free. Applicant writes and assessment submissions require ownership (owner bypass retained); profile edits cannot change email identity. Quiz completion feedback is still free.
- Job application score reads and CV match-analysis require report access. CV lookup by applicant ID requires own-profile/employer/owner access. Deliberate token-based CV share links remain public and contain CV/profile content only, not assessment scores.
- No signup field, profile field, browser storage value, subscription button, or public endpoint can grant an entitlement.

**Trusted grant/revoke procedure:** An authorized operator must first verify the correct confirmed account and purchased scope through their trusted payment/administration process. Use parameterized SQL with a trusted database client; never accept user-supplied authorization claims. The placeholders below are bound values, not literal account IDs:

```sql
-- Bind $1 to the verified users.id, $2 to applicant or employer,
-- and $3 to the actual paid-through UTC timestamp (strictly in the future).
INSERT INTO report_entitlements (user_id, scope, expires_at)
VALUES ($1, $2, $3)
ON CONFLICT (user_id) DO UPDATE
SET scope = EXCLUDED.scope, expires_at = EXCLUDED.expires_at;

-- Revoke immediately; no token refresh is needed.
DELETE FROM report_entitlements WHERE user_id = $1;
```

Do not grant indefinite access or invent payment status. Expiry is checked on every protected request. There is currently no payment-provider sync or self-service entitlement editor. No existing accounts were granted a subscription as part of this change.

Development schema: the additive entitlement table was applied only to development via the database SQL tool. Drizzle push encountered unrelated pre-existing CV unique-constraint drift, so that unrelated change was not accepted and no existing data was truncated. Production schema changes use Replit Publish; there is no startup/deploy migration script.

Regression command (development database only; temporary fixtures are cleaned up):
`pnpm --filter @workspace/scripts exec tsx --test ../artifacts/api-server/src/tests/report-access.test.ts`
These route-level tests call real Express routers and PostgreSQL without starting a server. They cover JWT failures, confirmed identity, free/expired/applicant/employer/owner permissions, report alias parity, mutation ownership, free completion feedback, grant constraints, and revocation.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Product Features

### Applicant Interface (10-step profile wizard)
1. Personal Info (name, pronoun, nickname, suffix)
2. Contact Info (addresses, phone with area code, home phone with N/A option, email)
3. Skills (autocomplete from API, max 5 tags)
4. Employment History (company, position, years, reason for leaving - dropdown)
5. Certificates & Training (max 3 entries)
6. Character References (up to 3, with phone + email)
7. Social Links (Facebook + LinkedIn)
8. Job Preferences (salary + negotiable/non-negotiable toggle + availability date)
9. Pre-Assessment (4 categories: Knowledge, Personality, Work Commitment, Situational)
10. Introduction Video upload

### Job Application & Assessment Automation
- `job_applications` table: `(id, applicant_id, job_id, job_title, company, industry, status, ke_score, created_at)` with UNIQUE(applicant_id, job_id)
- `assessment_results` has `job_id` nullable FK linking a K&E result to a specific job application
- `POST /api/jobs/:id/apply` — requires applicant JWT; creates application record; returns 409 if already applied
- `GET /api/jobs/:id/applications` — admin-only; returns applicants with joined profile info
- Industry normalization: raw job industry strings (e.g. "Healthcare") mapped to canonical quiz keys ("Healthcare / Medical") in `Assessment.tsx:normalizeIndustry()`
- K&E quiz submit passes `jobId` to backend; on save, updates `job_applications.ke_score` + sets `status = "assessed"`
- Apply button on job cards and detail panel footer: if JWT valid → POST apply → redirect to `/assessment?jobId=&jobTitle=&industry=&company=`; if no JWT → redirect to /signup; employer sessions see no Apply button
- Assessment page reads URL params on mount and auto-triggers K&E quiz pre-loaded with job's industry
- KnowledgeQuiz shows orange job context banner (title + company) when opened from a job application
- Profile-based auto-assessment: if profile has `targetIndustry` + `targetRole`, K&E quiz auto-starts (skips selection) — already working
- Random questions per applicant: `pickQuiz` shuffle in backend already randomizes 10 questions (3 easy, 4 medium, 3 hard) per session
- Retake cooldown: 1-month cooldown enforced in `ke-quiz/submit`; bypassed for owner email

### Recruiter Custom Assessment (per-job)
- `jobs.custom_questions` JSONB; each `CustomQuestion` = `{ id, prompt, type: "multiple_choice" | "text", options?, correctAnswers[] }`
- `job_applications` extra columns: `custom_score`, `custom_correct_count`, `custom_total_count`, `custom_answers` JSONB
- Recruiter UI: `Jobs.tsx` editor — orange-bordered question builder, MC checkbox toggle for correct option, text type with `|`-separated accepted answers. All mutators use functional `setState` to avoid stale-closure drops on rapid clicks.
- `canEditJob` = admin OR employer-owner.
- `POST/PUT /api/jobs[/id]` accept `customQuestions`; `sanitizeCustomQuestions` validates structure + types.
- **Public reads sanitized**: `GET /api/jobs` and `GET /api/jobs/:id` strip `correctAnswers` from every question via `stripJobAnswerKeys`. Recruiter editor reloads its full answer keys via the authenticated PUT round-trip when needed (the editor sees only the current draft it constructs).
- `GET /api/jobs/:id/custom-assessment` (no auth) returns sanitized questions for applicant view.
- `POST /api/jobs/:id/custom-assessment/submit` (auth): grades case-insensitive trimmed equality (MC = correctAnswers[0]; text = any of `|`-separated accepted answers). Always returns `{ score, correctCount, totalCount, breakdown[] }`. Persists via atomic `INSERT ... ON CONFLICT (applicant_id, job_id) DO UPDATE` only when an applicant profile exists for the JWT email; otherwise grades and returns score without persisting.
- `GET /api/jobs/applications/me` returns the caller's own job_applications rows including custom score fields.
- Frontend pages: `CustomAssessment.tsx` (quiz + result breakdown view), `Assessment.tsx` redirects to `/custom-assessment?jobId=X` after K&E if job has custom questions, `Results.tsx` renders `<MyJobApplications />` listing per-job K&E + Custom badges.

### Employer Interface
- Placeholder page (coming soon)

### Applicant Dashboard
- Profile summary
- Recommended job matches
- Assessment results
- Recommended courses / training ("bench" for skill enhancement)

### Resume / CV Auto-Fill
- Resume upload card appears above the 10-step wizard on `/apply`
- Accepts PDF, Word (.docx/.doc), and plain text files up to 10MB
- Backend extracts raw text with `pdf-parse` (PDF) and `mammoth` (DOCX)
- GPT (gpt-5-mini via Replit AI Integration) parses structured data from the text
- Extracted fields: name, contact, address, skills, employment history, certificates, salary, availability date, social links
- Uses OpenAI AI integration — no user API key required (billed to Replit credits)
- Env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

### API Features
- Applicant CRUD
- Pre-assessment system (seeded with 4 assessments)
- Job postings (seeded with 6 sample jobs)
- Course/training recommendations (seeded with 8 courses)
- Skill suggestions autocomplete endpoint
- Resume parsing: `POST /api/resume/parse` (multipart, field name: `resume`)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── swiftmatch/         # React + Vite frontend (at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
│       └── schema/
│           ├── applicants.ts
│           ├── assessments.ts
│           ├── jobs.ts
│           └── courses.ts
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Routes

- `GET /api/healthz` — health check
- `GET/POST /api/applicants` — list/create applicants
- `GET/PATCH /api/applicants/:id` — get/update applicant
- `GET /api/applicants/:id/assessment-results` — get applicant's assessment results
- `GET /api/assessments` — list assessments (auto-seeded)
- `GET /api/assessments/:id` — get assessment
- `POST /api/assessments/:id/submit` — submit assessment answers
- `GET /api/jobs` — list jobs (auto-seeded)
- `GET /api/jobs/:id` — get job
- `GET /api/courses` — list courses (auto-seeded)
- `GET /api/skills/suggestions?q=` — autocomplete skill suggestions
- `POST /api/resume/parse` — parse uploaded resume/CV and return structured applicant data

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes

## Owner / Admin Accounts

Owner emails are configured in two places (must stay in sync):
- **Backend**: `artifacts/api-server/src/lib/owner.ts` — `DEFAULT_OWNER_EMAILS` array, also extendable via `OWNER_EMAILS` env var (comma-separated).
- **Frontend**: `artifacts/swiftmatch/src/lib/owner.ts` — `OWNER_EMAILS` Set used by `isOwnerEmail()`.

Current owner: `jhn.tolentino2012@gmail.com`.

Owner-account bypasses currently in place:
1. **Email confirmation skipped** — signup endpoint inserts owner with `is_confirmed=true` and never sends a confirmation email.
2. **Premium subscription bypassed** — the server grants owner accounts report and candidate-pool access using the verified database identity. Results reads `/api/auth/report-access`; localStorage subscription flags do not grant access.

Authorization and owner bypasses must be enforced on the server using the verified database identity. Frontend owner checks are presentation only, never proof of access.

## Pending / Deferred

### Email delivery (signup confirmation + password reset) — NOT YET CONNECTED
- Signup endpoint (`POST /api/auth/signup`) calls `sendConfirmationEmail` in `artifacts/api-server/src/lib/email.ts`.
- The email lib falls back to logging the confirmation link to the server console when `SMTP_HOST` env var is missing, so the "Check your inbox" UI shows but no email actually leaves the server.
- User dismissed the Gmail Replit integration on 2026-05-02 and chose to defer email setup ("lets do it later").
- When the user is ready, options to revisit:
  1. Connect a Replit email integration: Brevo, Loops.so, or Gmail (`searchIntegrations("send email")`).
  2. Provide raw SMTP credentials and set env vars: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SMTP_FROM`.
  3. Temporarily auto-confirm new accounts on signup (set `isConfirmed: true` directly in the signup insert) — only acceptable for dev/testing.
- Until then: confirmation links can be retrieved manually from the API server logs (search for `"DEV: Email confirmation link"`).
