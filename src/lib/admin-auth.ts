import { ADMIN_COOKIE_NAME } from "@/lib/constants";

// Edge(middleware)와 Node(Server Action) 런타임 모두에서 동작해야 하므로
// node:crypto 대신 표준 Web Crypto(SubtleCrypto) API만 사용합니다.

const encoder = new TextEncoder();

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return secret;
}

// 관리자 비밀번호와 무관하게, 서버 비밀키(ADMIN_SESSION_SECRET)로만 서명되는 세션 토큰입니다.
// 로그인에 성공하면 항상 동일한 토큰이 발급되며, 이 값은 비밀키 없이는 위조할 수 없습니다.
export async function computeAdminToken(): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode("admin-session"));
  return bytesToHex(signature);
}

export async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await computeAdminToken();
  return timingSafeEqualString(token, expected);
}

export function checkAdminPassword(password: string): boolean {
  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    throw new Error("ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.");
  }
  return timingSafeEqualString(password, configured);
}

export { ADMIN_COOKIE_NAME };
