import { createHash } from "crypto";
import { getVoterPepper } from "./env";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function hashVoterIdentifier(
  raw: string,
  type: "EMAIL" | "PHONE",
): string {
  const pepper = getVoterPepper();
  const normalized =
    type === "EMAIL" ? normalizeEmail(raw) : normalizePhone(raw);
  return createHash("sha256")
    .update(`${pepper}|${type}|${normalized}`)
    .digest("hex");
}

export function hashIp(ip: string): string {
  const pepper = getVoterPepper();
  return createHash("sha256").update(`${pepper}|ip|${ip}`).digest("hex");
}
