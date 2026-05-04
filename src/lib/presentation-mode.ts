/**
 * Mock public UI (no Postgres) for stakeholder demos and local `npm run dev`.
 *
 * - `NEXT_PUBLIC_PRESENTATION_MODE=1` → always mock (even in production builds).
 * - `NEXT_PUBLIC_PRESENTATION_MODE=0` → always use the database for public pages.
 * - Unset → **development**: mock (clone-and-run). **production** (`next build` / `next start`): real DB.
 */
export function isPresentationMode(): boolean {
  const v = process.env.NEXT_PUBLIC_PRESENTATION_MODE?.trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes") return true;
  if (v === "0" || v === "false" || v === "no" || v === "off") return false;
  if (process.env.NODE_ENV === "production") return false;
  return true;
}
