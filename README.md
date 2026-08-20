# Mogoj

An all-in-one personal productivity app combining PARA-based organization
(Projects, Areas, Resources, Archive), GTD-style Inbox capture, task/project
management with Kanban boards, and Notion-style rich text resources.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, TipTap, Zustand, TanStack Query v5
- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Prisma
- **Auth**: JWT (httpOnly cookies) with refresh token rotation
- **Storage**: Cloudflare R2 (S3-compatible)

## Structure

```
apps/
  web/        Next.js frontend
  api/        Express backend
packages/
  shared/     Zod schemas + shared TS types
```

## Local setup

**Prerequisites:** Node.js 20+, pnpm 9+, Docker (for local Postgres), a Cloudflare R2 bucket (for resource file uploads).

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Start Postgres**

   ```bash
   docker compose up -d postgres
   ```

3. **Configure environment variables**

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.local.example apps/web/.env.local
   ```

   Edit `apps/api/.env`:
   - `DATABASE_URL` — already points at the docker-compose Postgres by default.
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CSRF_SECRET` — generate with `openssl rand -base64 48`, one each.
   - `R2_*` — your Cloudflare R2 account ID, access key, secret key, bucket name, and public URL (needed for resource file uploads; auth/tasks/projects work without it).

4. **Run migrations and seed demo data**

   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

   This creates a demo account: `demo@mogoj.app` / `password123`, with sample areas, a project, tasks, a resource, and an inbox item.

5. **Start the dev servers**

   ```bash
   pnpm dev
   ```

   This runs both apps via Turborepo:
   - API: http://localhost:4000 (health check at `/health`)
   - Web: http://localhost:3000

6. **Log in** at http://localhost:3000/login with the demo account above, or register a new one.

### Other useful commands

```bash
pnpm build          # build all apps
pnpm lint           # lint all workspaces
pnpm typecheck      # typecheck all workspaces
pnpm db:studio      # open Prisma Studio to browse the database
```

### Deployment

- **Frontend (Vercel)**: point it at `apps/web`, set `NEXT_PUBLIC_API_URL` to your deployed API's `/api/v1` URL.
- **Backend + Postgres (Railway)**: deploy `apps/api` (build: `pnpm --filter @mogoj/api build`, start: `pnpm --filter @mogoj/api start`), attach a Postgres plugin, and set the same env vars as `.env.example` — `WEB_ORIGIN` must be your Vercel domain, and `NODE_ENV=production` (this switches auth cookies to `SameSite=None; Secure` for the cross-origin setup).
