import { SignJWT, jwtVerify } from "jose";
import { getJwtSecret } from "./env";

export const COOKIE = "tmt_admin";
const ALG = "HS256";
const TTL_SECONDS = 60 * 60 * 8;

export type AdminJwtPayload = {
  sub: string;
  username: string;
  displayName: string;
};

export async function signAdminToken(payload: AdminJwtPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (
      typeof payload.sub === "string" &&
      typeof payload.username === "string" &&
      typeof payload.displayName === "string"
    ) {
      return {
        sub: payload.sub,
        username: payload.username,
        displayName: payload.displayName,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TTL_SECONDS,
};
