# TMT Votes

**Public voting for live events and campaigns** — organisers publish topics and options; voters participate with **email or phone** (hashed server-side, no accounts). A separate **admin** area handles scheduling, featured topics, and a masked voter audit trail.

Built as a **demo-ready** reference implementation you can fork, deploy, and walk through with a prospect.

After the repo is on GitHub, you can add a CI badge to this README:

`https://github.com/<your-user-or-org>/<your-repo>/actions/workflows/ci.yml/badge.svg`

---

## Why show this repo

| Area | What it demonstrates |
|------|----------------------|
| **Voter UX** | Home, topic vote flow, results, shareable links, motion + feedback |
| **Admin** | Login, dashboard, topic CRUD, dates, featured flag, voter list (hashed IDs) |
| **Backend** | Prisma + PostgreSQL, REST-style API routes, one vote per topic per identifier |
| **Security posture** | Bcrypt admin passwords, JWT in **httpOnly** cookie, rate limiting, same-origin checks, peppered voter hashes |

> **Do not** ship the default seed password in a real public deployment. Change `ADMIN_PASSWORD` (and all secrets) before seeding production.

---

## Stack

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS**
- **Framer Motion** · **Sonner** · **canvas-confetti** (vote success)
- **Prisma 5** · **PostgreSQL**
- **jose** (JWT) · **bcryptjs** · **Zod**

---

## Public UI without Postgres (default in dev)

Running **`npm run dev`** uses **built-in sample topics** by default — you do **not** need Docker, Postgres, or a filled-in `.env` to walk through the home page, vote flow, results, and confetti. A **“Demo data”** badge appears in the header.

- **`/api/vote`** updates counts **in memory** for that dev session.
- **`NEXT_PUBLIC_PRESENTATION_MODE=1`** — force mock data even for `next build` / `next start` (e.g. a UI-only deploy).
- **`NEXT_PUBLIC_PRESENTATION_MODE=0`** — use the real database in development (pair with `DATABASE_URL` and migrations/seed below).
- **Admin** (`/admin/...`) still needs PostgreSQL and seed credentials when you turn the real backend on.

---

## Quick start (local)

1. **Clone** and install:

   ```bash
   npm ci
   ```

2. **Browse the UI (fastest)** — run `npm run dev` and open [http://localhost:3000](http://localhost:3000). No database required.

3. **Full stack (optional)** — copy `.env.example` to `.env`, set `NEXT_PUBLIC_PRESENTATION_MODE=0`, and configure:

   | Variable | Purpose |
   |----------|---------|
   | `DATABASE_URL` | PostgreSQL connection string |
   | `JWT_SECRET` | Admin JWT signing key (≥32 chars in production) |
   | `VOTER_ID_PEPPER` | Server-only pepper for voter identifier hashing (≥16 chars) |
   | `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_DISPLAY_NAME` | Used by `npm run db:seed` when the DB has no admin |
   | `NEXT_PUBLIC_APP_URL` | Optional; canonical URL for Open Graph (e.g. `https://votes.example.com`) |

4. **Database** — start Postgres, then sync and seed:

   ```bash
   docker compose up -d
   npx prisma db push
   npm run db:seed
   ```

5. **Run**:

   ```bash
   npm run dev
   ```

- **Public app:** [http://localhost:3000](http://localhost:3000)
- **Admin login:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (not linked from the public header on purpose)

Default seed credentials (override via `.env` before `db:seed`): username `admin`, password `admin123`.

### Blank page, 500, or “Database is not reachable”

This applies when you use the **real database** (`NEXT_PUBLIC_PRESENTATION_MODE=0` in dev, or a production build without `NEXT_PUBLIC_PRESENTATION_MODE=1`). The UI then needs a **live PostgreSQL** that matches `DATABASE_URL` in `.env`.

1. **Docker** — install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then:

   ```bash
   docker compose up -d
   npx prisma db push
   npm run db:seed
   ```

2. **No Docker** — use a free hosted database ([Neon](https://neon.tech) or [Supabase](https://supabase.com)), put its connection string in `.env` as `DATABASE_URL`, then run `npx prisma db push` and `npm run db:seed`.

Restart `npm run dev` after Postgres is up. If something else breaks, check the terminal where Next is running for the full error.

---

## Deploy (typical: Vercel + managed Postgres)

1. Create a **Postgres** database (Neon, Supabase, Railway, etc.) and set `DATABASE_URL` in the host’s environment.
2. Set `JWT_SECRET`, `VOTER_ID_PEPPER`, and `NEXT_PUBLIC_APP_URL` to your production domain.
3. Run migrations or schema sync as part of deploy (e.g. build command including `prisma db push` or `prisma migrate deploy`, depending on whether you use migrations in production).
4. Seed or create the first admin **once** with a strong password (not the demo default).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOWNER%2FREPO)

Update `OWNER/REPO` in the button URL to match your fork.

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs **lint**, **Prisma db push**, **seed**, and **production build** against a **Postgres 16** service container so forks and PRs get a green signal when the app is healthy.

---

## Publish to GitHub

1. **Do not commit secrets** — keep `.env` local only (it is listed in `.gitignore`). Use [`.env.example`](./.env.example) as the template for others.
2. **Sanity check** (from the project root):

   ```bash
   npm ci
   npm run lint
   npm run build
   ```

3. **Create the empty repo** on GitHub (no README/license if you already have them here), then:

   ```bash
   git add -A
   git status   # confirm .env is NOT listed
   git commit -m "Initial commit: TMT Votes public voting app"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
   git push -u origin main
   ```

4. **GitHub Actions** — CI runs on `main` / `master` automatically after push. In the README, replace `OWNER/REPO` in the Vercel “Deploy” button URL with your path.

5. **Stakeholder-only frontend on Vercel** — set `NEXT_PUBLIC_PRESENTATION_MODE=1` in the host env so the public site uses mock data without Postgres. Omit that (or set `0`) when you wire a real database.

---

## License

MIT — see [LICENSE](./LICENSE).
