// 시설별 담당 선생님 로그인. 비밀번호는 시설마다 다르며 facility_admins.password_hash에
// password-hash.ts의 "salt:hash" 형태로 저장합니다. 세션 토큰은 관리자/선생님 세션과 동일하게
// (secret, purpose) 조합으로만 서명되는 정적 토큰이라 DB 조회 없이 미들웨어(Edge)에서 검증할 수 있습니다.
import { TEACHER_COOKIE_NAME } from "@/lib/constants";
import { hashPassword, verifyPassword } from "@/lib/password-hash";
import { computeSessionToken, isValidSessionToken } from "@/lib/session-auth";

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

export const DEFAULT_FACILITY_PASSWORD = "qnrh1234!!";

export { hashPassword, verifyPassword };

function facilitySessionPurpose(facilityId: string): string {
  return `facility-session:${facilityId}`;
}

export async function computeFacilitySessionToken(facilityId: string): Promise<string> {
  return computeSessionToken(sessionSecret(), facilitySessionPurpose(facilityId));
}

export async function isValidFacilitySessionToken(
  token: string | undefined,
  facilityId: string
): Promise<boolean> {
  return isValidSessionToken(token, sessionSecret(), facilitySessionPurpose(facilityId));
}

// 쿠키 값 형식: "<facilityId>:<token>"
export function parseFacilitySessionCookie(
  value: string | undefined
): { facilityId: string; token: string } | null {
  if (!value) return null;
  const idx = value.indexOf(":");
  if (idx === -1) return null;
  return { facilityId: value.slice(0, idx), token: value.slice(idx + 1) };
}

export async function computeFacilitySessionCookieValue(facilityId: string): Promise<string> {
  return `${facilityId}:${await computeFacilitySessionToken(facilityId)}`;
}

export { TEACHER_COOKIE_NAME };
