# TMT Votes

Public voting app — Next.js 14 (App Router) · Prisma · PostgreSQL · TypeScript · Tailwind CSS.

The site has **two modes**, controlled by a single env flag:

| Mode | When | Storage |
|------|------|---------|
| **Demo** *(default)* | `NEXT_PUBLIC_HAS_BACKEND` not `1` | `localStorage` per browser. No DB, no API. Great for quick previews. |
| **Live** | `NEXT_PUBLIC_HAS_BACKEND=1` | Postgres via Prisma + Next API routes. Shared votes, real admin login. |

You can ship the demo on Vercel today, then flip the flag once Postgres is wired in.

---

## Quick start

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no `.env` you get the demo mode.

---

## Going live (Postgres backend)

### 1. Provision Postgres

Pick one — all have generous free tiers:

- **[Neon](https://neon.tech)** — recommended; one-click Vercel integration auto-fills `DATABASE_URL`.
- **[Supabase](https://supabase.com)** — Postgres + auth + storage in one platform.
- **[Vercel Postgres](https://vercel.com/storage/postgres)** — first-party, simplest billing.

### 2. Set environment variables

Locally: copy `.env.example` to `.env` and fill in. On Vercel: **Project → Settings → Environment Variables**, add for **Production** and **Preview**:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_HAS_BACKEND` | yes | `1` to switch to API mode |
| `DATABASE_URL` | yes | From your Postgres provider |
| `JWT_SECRET` | yes | ≥ 32 random chars |
| `VOTER_ID_PEPPER` | yes | ≥ 16 random chars |
| `ADMIN_USERNAME` | seed only | Used by `db:seed` to create the first admin |
| `ADMIN_PASSWORD` | seed only | Strong password before going live |
| `ADMIN_DISPLAY_NAME` | seed only | Optional |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | optional | Cloudflare Turnstile CAPTCHA — both must be set to enable the human-check on `/api/vote`. Skipping them is safe; the form just won’t show the widget. |
| `NEXT_PUBLIC_SENTRY_DSN` (and/or `SENTRY_DSN`) | optional | Enable Sentry error monitoring. Without it the SDK is a no-op. |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` | optional | Source-map upload during Vercel builds. Skip if you only want runtime error capture. |

### 3. Apply the schema

```bash
# Local first run
npm run db:push          # quick sync (dev) — or:
npx prisma migrate dev   # creates a versioned migration

# Then seed the first admin + sample topics
npm run db:seed
```

For Vercel, run the same `npx prisma migrate deploy` and `npx prisma db seed` once against the prod `DATABASE_URL` (e.g. via `vercel env pull` then run locally, or as a one-off script).

### 4. Deploy

Push to `main`. Vercel rebuilds. Visit the site:

- Public app: `/`
- Admin login: `/admin` — credentials from `ADMIN_USERNAME` / `ADMIN_PASSWORD`

---

## Architecture

```
src/
  app/
    page.tsx                # public home
    vote/page.tsx           # /vote?id=...
    admin/page.tsx          # login → dashboard
    api/
      topics/               # GET (public)
      vote/                 # POST, deduped by topic+identifier hash
      auth/login|logout|me  # bcrypt + JWT cookie
      admin/topics/         # CRUD (admin-only)
  components/
    topics-store.tsx        # mode-switching client store (localStorage ↔ API)
    nav.tsx, footer.tsx, ...
  lib/
    prisma.ts, jwt.ts, voter-hash.ts, validation.ts,
    topics-service.ts, rate-limit.ts, request-utils.ts
  middleware.ts             # cookie sniff for /admin/*
prisma/
  schema.prisma             # Admin / Topic / Option / Vote
  seed.ts                   # first admin + sample topics
```

Voter dedup: server hashes `email|phone` with a peppered SHA-256 and enforces `UNIQUE(topicId, identifierHash)`. No raw identifier stored.

---

## Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Local dev |
| `npm run build` | `prisma generate` + `next build` |
| `npm run start` | Run the built app |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync `schema.prisma` to the DB without migrations |
| `npm run db:migrate` | Create a new migration (interactive) |
| `npm run db:deploy` | Apply pending migrations (CI / prod) |
| `npm run db:seed` | Create first admin + sample topics |
| `npm run db:studio` | Prisma Studio (browse data) |

---

## License

MIT — see [LICENSE](./LICENSE).
