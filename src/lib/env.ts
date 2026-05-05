function trim(value: string | undefined): string {
  return (value ?? "").trim();
}

const isProd = process.env.NODE_ENV === "production";

const DEV_JWT = "dev-only-jwt-secret-change-me-32chars!";
const DEV_PEPPER = "dev-voter-pepper-16+chars";

export function getJwtSecret(): Uint8Array {
  const v = trim(process.env.JWT_SECRET);
  if (v.length >= 32) return new TextEncoder().encode(v);
  if (isProd) {
    throw new Error(
      "JWT_SECRET must be set to at least 32 characters in production.",
    );
  }
  return new TextEncoder().encode(DEV_JWT);
}

export function getVoterPepper(): string {
  const v = trim(process.env.VOTER_ID_PEPPER);
  if (v.length >= 16) return v;
  if (isProd) {
    throw new Error(
      "VOTER_ID_PEPPER must be set to at least 16 characters in production.",
    );
  }
  return DEV_PEPPER;
}

export function hasDatabaseUrl(): boolean {
  return Boolean(trim(process.env.DATABASE_URL));
}
