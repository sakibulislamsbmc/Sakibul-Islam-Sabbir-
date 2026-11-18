import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Server-only admin credential configuration.
 * NEVER import this module from client routes or components.
 * Stores only a cryptographic one-way salted scrypt hash (no plaintext password).
 */
export const DEFAULT_ADMIN_EMAIL = "sakibulislamsbmc@gmail.com";

export const DEFAULT_ADMIN_PASSWORD_HASH =
  "scrypt:194c4685c9314269280c3c02faa7e80b:824926b3f63ac5681ccbb4c315573ab03bb0a523c8c3e933926bfb86889e21eb8a4ed3910dc4264ecb9e2eee61826ae1b8d3f8454eff40cfcb8ab706cf74901f";

let cachedRuntimeSecret = "";

export function getRuntimeAdminSessionSecret(): string {
  if (cachedRuntimeSecret) return cachedRuntimeSecret;

  const tmpSecretFile = path.join("/tmp", ".ss_admin_session_secret");
  try {
    if (fs.existsSync(tmpSecretFile)) {
      const existing = fs.readFileSync(tmpSecretFile, "utf8").trim();
      if (existing.length >= 32) {
        cachedRuntimeSecret = existing;
        return cachedRuntimeSecret;
      }
    }
  } catch {
    // Fallback to in-memory CSPRNG secret
  }

  cachedRuntimeSecret = crypto.randomBytes(32).toString("hex");
  try {
    fs.writeFileSync(tmpSecretFile, cachedRuntimeSecret, { mode: 0o600 });
  } catch {
    // Non-fatal if /tmp is read-only
  }
  return cachedRuntimeSecret;
}
