# Deployment (Vercel + Neon)

Two Vercel projects from this monorepo, plus a Neon Postgres database. Names only below, never commit values.

## Vercel project: API (root directory `apps/api`)

`vercel.json` runs `prisma generate`, bundles `src/app.ts` with tsup into `dist/app.js` (inlining `@mogoj/shared`), and pins the region to `sin1`. The Vercel entry is `apps/api/index.js`, which re-exports that bundle so Vercel's own TS compile is skipped. `src/listen.ts` is local-only. Enable "Include source files outside of the Root Directory" (Project → Settings → Build and Deployment → Root Directory) on both projects. Don't set `NODE_ENV` as a Vercel env var: it makes the install skip devDependencies (prisma, tsup), and Vercel already sets it at runtime.

| Env var | Notes |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** (non-pooled) string, used by `prisma migrate` |
| `WEB_ORIGIN` | The web project's public URL |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CSRF_SECRET` | Each at least 32 chars |
| `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL_DAYS` | Optional |
| `ALLOW_REGISTRATION` | `false` closes `POST /auth/register` (defaults to closed in production) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Optional; without all five, `POST /resources/upload-url` returns 503 |

## Vercel project: Web (root directory `apps/web`)

| Env var | Notes |
|---|---|
| `NEXT_PUBLIC_API_URL` | `/api/v1` (relative; requests go through the rewrite) |
| `API_ORIGIN` | The API project's public URL, no trailing slash. Read at build time; it must stay listed under `env` in `turbo.json` or Turbo strips it and the rewrite is missing |

## Deploy order

1. Create the Neon database; copy the pooled and direct strings.
2. Run migrations (below).
3. Deploy the API project; check `GET /health`.
4. Deploy the web project with `API_ORIGIN` set to the API URL.
5. Set the API's `WEB_ORIGIN` to the web URL and redeploy the API if it changed.

## Migrations against Neon

From your machine, with `DATABASE_URL` and `DIRECT_URL` exported for Neon in that shell only:

```bash
pnpm db:migrate:deploy
```

Seeding (`pnpm db:seed`) creates the demo user with a known password; do not run it against production.
