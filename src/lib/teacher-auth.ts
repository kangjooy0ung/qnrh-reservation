import { TEACHER_COOKIE_NAME } from "@/lib/constants";
import { computeSessionToken, isValidSessionToken, timingSafeEqualString } from "@/lib/session-auth";

const SESSION_PURPOSE = "teacher-session";

// 관리자 세션과 동일한 비밀키를 재사용하되, purpose를 다르게 서명해 완전히 별개의 세션으로 취급합니다.
// (관리자용 시크릿과 별도로 TEACHER_SESSION_SECRET을 새로 발급/배포하지 않아도 됩니다.)
function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

export async function computeTeacherToken(): Promise<string> {
  return computeSessionToken(sessionSecret(), SESSION_PURPOSE);
}

export async function isValidTeacherToken(token: string | undefined): Promise<boolean> {
  return isValidSessionToken(token, sessionSecret(), SESSION_PURPOSE);
}

export function checkTeacherPassword(password: string): boolean {
  const configured = process.env.TEACHER_PASSWORD;
  if (!configured) {
    throw new Error("TEACHER_PASSWORD 환경변수가 설정되지 않았습니다.");
  }
  return timingSafeEqualString(password, configured);
}

export { TEACHER_COOKIE_NAME };
