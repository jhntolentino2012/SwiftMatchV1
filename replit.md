# Workspace

## Overview

SwiftMatch — a recruitment platform with the tagline "Don't search. Get spotted."
pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

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
