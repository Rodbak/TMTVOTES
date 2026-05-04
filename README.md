# TMT Votes — Frontend Demo

A **frontend-only** public voting demo built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. Designed for stakeholder presentations and design walkthroughs — **no backend, no database, no API keys**.

- Pick a topic, vote with email or phone, and see live results with confetti.
- An **Admin** area (client-side) lets you create, open / close, and delete topics on the fly.
- All state lives in the browser via React context + `localStorage`, so reloads keep your demo intact.

---

## Quick start

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **Home:** Active and closed topic grid
- **Vote / Results:** `/vote/[id]`
- **Admin:** `/admin` (demo credentials: `admin` / `tmt2024`)

To reset all topics back to seed data, clear local storage for the site (DevTools → Application → Local Storage → delete `tmt.*` keys) and refresh.

---

## Build for production

```bash
npm run build
npm start
```

Or deploy to Vercel — no environment variables required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FOWNER%2FREPO)

Update `OWNER/REPO` after you push the repo.

---

## Push to GitHub

```bash
git add -A
git commit -m "Frontend demo of TMT Votes"
git branch -M main
git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
git push -u origin main
```

---

## License

MIT — see [LICENSE](./LICENSE).
