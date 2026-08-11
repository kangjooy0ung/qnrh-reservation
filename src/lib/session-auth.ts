// Edge(middleware)와 Node(Server Action) 런타임 모두에서 동작해야 하므로
// node:crypto 대신 표준 Web Crypto(SubtleCrypto) API만 사용합니다.

const encoder = new TextEncoder();

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// 로그인 비밀번호와 무관하게, 서버 비밀키(secret)와 용도 문자열(purpose)로만 서명되는 세션 토큰입니다.
// 로그인에 성공하면 항상 동일한 토큰이 발급되며, 이 값은 비밀키 없이는 위조할 수 없습니다.
// purpose를 다르게 주면 같은 secret을 공유해도 서로 다른 세션 종류(관리자/선생님)를 안전하게 구분할 수 있습니다.
export async function computeSessionToken(secret: string, purpose: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(purpose));
  return bytesToHex(signature);
}

export async function isValidSessionToken(
  token: string | undefined,
  secret: string,
  purpose: string
): Promise<boolean> {
  if (!token) return false;
  const expected = await computeSessionToken(secret, purpose);
  return timingSafeEqualString(token, expected);
}
