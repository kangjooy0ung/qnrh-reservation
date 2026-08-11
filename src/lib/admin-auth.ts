import { ADMIN_COOKIE_NAME } from "@/lib/constants";
import { computeSessionToken, isValidSessionToken, timingSafeEqualString } from "@/lib/session-auth";

const SESSION_PURPOSE = "admin-session";

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

export async function computeAdminToken(): Promise<string> {
  return computeSessionToken(sessionSecret(), SESSION_PURPOSE);
}

export async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  return isValidSessionToken(token, sessionSecret(), SESSION_PURPOSE);
}

export function checkAdminPassword(password: string): boolean {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    throw new Error("ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.");
  }
  return timingSafeEqualString(password, configured);
}

export { ADMIN_COOKIE_NAME };
