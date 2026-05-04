/**
 * Mock public UI (no Postgres) for stakeholder demos and local `npm run dev`.
 *
 * - `NEXT_PUBLIC_PRESENTATION_MODE=1` → always mock (even in production).
 * - `NEXT_PUBLIC_PRESENTATION_MODE=0` → always use the database for public pages.
 * - **`DATABASE_URL` empty / unset** → mock (avoids 500 on hosts with no DB yet).
 * - **Hosted deploy + `DATABASE_URL` pointing at localhost** → mock (common mis-copy from
 *   `.env.example`; the cloud cannot reach your laptop’s Postgres).
 * - Otherwise: **development** defaults to mock; **production** uses the real database.
 */

function isLocalDbHostname(url: string): boolean {
  try {
    const u = new URL(url);
    const h = u.hostname;
    return h === "localhost" || h === "127.0.0.1" || h === "::1";
  } catch {
    return false;
  }
}

function isCloudDeploy(): boolean {
  return Boolean(
    process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.RENDER ||
    process.env.CF_PAGES, // Cloudflare Pages
  );
}

export function isPresentationMode(): boolean {
  const v = process.env.NEXT_PUBLIC_PRESENTATION_MODE?.trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "no" || v === "off") return false;

  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) return true;

  if (isCloudDeploy() && isLocalDbHostname(dbUrl)) return true;

  if (process.env.NODE_ENV === "production") return false;
  return true;
}
