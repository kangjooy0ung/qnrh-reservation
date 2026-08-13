// 비밀번호/PIN을 "salt:hash"(SHA-256, Web Crypto) 형태로 저장하기 위한 공용 유틸.
// Edge(미들웨어)와 Node 런타임 모두에서 동작해야 하므로 표준 Web Crypto(SubtleCrypto)만 사용합니다.
import { timingSafeEqualString } from "@/lib/session-auth";

const encoder = new TextEncoder();

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
