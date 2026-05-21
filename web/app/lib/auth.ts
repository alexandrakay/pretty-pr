import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const TOKEN_COOKIE = "gh_token";
const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.GITHUB_COOKIE_SECRET;
  if (!secret) throw new Error("GITHUB_COOKIE_SECRET is not set");
  return Buffer.from(secret.padEnd(32, "0").slice(0, 32));
}

export function encryptToken(token: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(value: string): string | null {
  try {
    const key = getKey();
    const [ivHex, authTagHex, dataHex] = value.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const data = Buffer.from(dataHex, "hex");
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(data) + decipher.final("utf8");
  } catch {
    return null;
  }
}

export function getGitHubToken(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;)\\s*${TOKEN_COOKIE}=([^;]+)`));
  if (!match) return null;
  return decryptToken(decodeURIComponent(match[1]));
}

export function tokenCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

export { TOKEN_COOKIE };
