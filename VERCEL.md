# Deploying SwiftMatch on Vercel

SwiftMatch needs both the Vite frontend and the Express API. A static-only
deployment cannot process signup requests.

## Project settings

- Recommended Root Directory: repository root (`.`).
- The root `vercel.json` builds only SwiftMatch and serves its `dist/public`.
- Alternatively, use `artifacts/swiftmatch` as Root Directory with **Include
  source files outside of the Root Directory** enabled. Its local configuration
  and API entry point use the same backend.
- Install dependencies with pnpm using the repository workspace and lockfile.
- Configure the backend's environment variables in Vercel: `DATABASE_URL`,
  `SESSION_SECRET`, and the SMTP configuration for confirmation emails. Configure
  other integration variables for the features you use. Do not commit secrets.
- The database must be reachable from Vercel and have the existing app schema.

## Routing

Both configurations exclude `/api/*` from the SPA rewrite. Vercel's
`api/[...path].ts` catch-all function exports the existing Express app without
opening a listening server, while `api/index.ts` handles the exact `/api` path.
The catch-all preserves the original URL, so Express retains its `/api` mount
and method handlers, including `POST /api/auth/signup`.

Redeploy after committing these files. Check the deployment's Functions list for
`api/[...path]`, then send `POST /api/auth/signup` with `{}` and
`Content-Type: application/json`. Expect HTTP 400 and
`{"error":"All fields are required."}`, not HTTP 405 or an HTML page.
Also check `GET /api/healthz` and opening `/signup` directly.

A rewrite alone does not configure the database, mail delivery, or secrets.