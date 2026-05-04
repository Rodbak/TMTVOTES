import { SignJWT, jwtVerify } from "jose";
import { getJwtSecret } from "./env";

const COOKIE = "tmt_admin";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export { COOKIE, COOKIE_MAX_AGE };

export type AdminJwtPayload = {
  sub: string;
  username: string;
  displayName: string;
};

export async function signAdminToken(payload: AdminJwtPayload): Promise<string> {
  return new SignJWT({
    username: payload.username,
    displayName: payload.displayName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(getJwtSecret());
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    const sub = payload.sub;
    const username = payload.username as string | undefined;
    const displayName = (payload.displayName as string | undefined) ?? "Admin";
    if (!sub || !username) return null;
    return { sub, username, displayName };
  } catch {
    return null;
  }
}
