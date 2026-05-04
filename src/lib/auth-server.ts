import { cookies } from "next/headers";
import { COOKIE, verifyAdminToken, type AdminJwtPayload } from "./jwt";

export async function getSessionAdmin(): Promise<AdminJwtPayload | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
