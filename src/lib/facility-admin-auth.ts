// 시설별 담당 선생님 로그인. 비밀번호는 시설마다 다르며 facility_admins.password_hash에
// "salt:hash"(SHA-256, Web Crypto) 형태로 저장합니다. 세션 토큰은 관리자/선생님 세션과 동일하게
// (secret, purpose) 조합으로만 서명되는 정적 토큰이라 DB 조회 없이 미들웨어(Edge)에서 검증할 수 있습니다.
import { TEACHER_COOKIE_NAME } from "@/lib/constants";
import { computeSessionToken, isValidSessionToken, timingSafeEqualString } from "@/lib/session-auth";

const encoder = new TextEncoder();

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSaltHex(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return bytesToHex(bytes.buffer);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToHex(digest);
}

export const DEFAULT_FACILITY_PASSWORD = "qnrh1234!!";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomSaltHex();
  const hash = await sha256Hex(`${salt}:${password}`);
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = await sha256Hex(`${salt}:${password}`);
  return timingSafeEqualString(expected, hash);
}

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
