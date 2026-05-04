function req(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v.trim();
}

const isProd = process.env.NODE_ENV === "production";

export function getJwtSecret(): Uint8Array {
  const s = process.env.JWT_SECRET?.trim();
  const fallback =
    "dev-only-jwt-secret-change-me-32chars!"; /* 32+ chars for local */
  const value =
    s && s.length >= 32 ? s : isProd ? null : fallback;
  if (!value) {
    throw new Error(
      "JWT_SECRET must be set to at least 32 characters in production.",
    );
  }
  return new TextEncoder().encode(value);
}

export function getVoterPepper(): string {
  const s = process.env.VOTER_ID_PEPPER?.trim();
  const fallback = "dev-voter-pepper-16min!!";
  const value = s && s.length >= 16 ? s : isProd ? null : fallback;
  if (!value) {
    throw new Error(
      "VOTER_ID_PEPPER must be set to at least 16 characters in production.",
    );
  }
  return value;
}

export function getDatabaseUrl(): string {
  return req("DATABASE_URL");
}
