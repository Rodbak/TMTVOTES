/**
 * Cloudflare Turnstile server-side verification.
 * Returns true (allow) when no secret is configured, so the app stays
 * functional in dev / on first deploy before keys are added.
 */
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type SiteVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
};

export async function verifyTurnstile(
  token: string | undefined,
  ip?: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return { ok: true };
  }
  if (!token) {
    return { ok: false, reason: "missing_token" };
  }

  const body = new URLSearchParams();
  body.append("secret", secret);
  body.append("response", token);
  if (ip && ip !== "unknown") body.append("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      cache: "no-store",
    });
    const data = (await res.json()) as SiteVerifyResponse;
    if (!data.success) {
      return {
        ok: false,
        reason: (data["error-codes"] ?? []).join(",") || "verification_failed",
      };
    }
    return { ok: true };
  } catch (e) {
    console.error("turnstile verify failed", e);
    return { ok: false, reason: "verifier_unreachable" };
  }
}
