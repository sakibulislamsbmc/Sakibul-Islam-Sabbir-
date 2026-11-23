import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import { findMatchingRoutes, WEBSITE_KNOWLEDGE_PROMPT } from "./lib/assistant-knowledge";

const PRESENCE_TTL_MS = 45_000;
const activeCourseVisitors = new Map<string, number>();

const CHAT_RATE_WINDOW_MS = 60_000;
const CHAT_RATE_MAX_REQUESTS = 25;
const chatRateBuckets = new Map<string, number[]>();

type BookPdfSource =
  | { type: "drive"; driveFileId: string }
  | { type: "local"; fullPath: string; previewPath?: string };

const BOOK_PDF_SOURCES: Record<string, BookPdfSource> = {
  "muslim-ten-essential-topics": {
    type: "drive",
    driveFileId: "1rlVLdKSZzz_HAtHPihRthvIsKPsV0Wd1",
  },
  "creative-design-freelance-blueprint": {
    type: "local",
    fullPath: "server-assets/books/creative-design-freelance-blueprint-full.pdf",
    previewPath: "server-assets/books/creative-design-freelance-blueprint-preview.pdf",
  },
};

const BOOK_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour server-side memory cache
const cachedBookBuffers = new Map<string, { bytes: Uint8Array; fetchedAt: number }>();

function buildProtectedPdfResponse(bytes: Uint8Array): Response {
  return new Response(bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      "content-type": "application/octet-stream",
      "content-length": String(bytes.byteLength),
      "content-disposition": "inline",
      "cache-control": "private, no-store, no-transform",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

async function handleSecureBookStreamRequest(
  request: Request,
  pathname: string,
  searchParams: URLSearchParams,
): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  // Block direct browser tab navigation, external embeds, or non-reader requests
  const readerHeader = request.headers.get("x-bismah-reader");
  const fetchMode = request.headers.get("sec-fetch-mode");
  const fetchDest = request.headers.get("sec-fetch-dest");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (
    readerHeader !== "internal" ||
    fetchMode === "navigate" ||
    fetchDest === "document" ||
    (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none")
  ) {
    return new Response(
      JSON.stringify({
        error:
          "এই বইটি শুধুমাত্র আমাদের অফিসিয়াল ওয়েবসাইটের ভেতর থেকেই পড়া যাবে। অন্য কোনো ব্রাউজারে সরাসরি ওপেন করা অনুমোদিত নয়।",
      }),
      {
        status: 403,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      },
    );
  }

  const match = pathname.match(/^\/api\/books\/([a-z0-9-]+)\/stream$/);
  const bookId = match?.[1];
  const source = bookId ? BOOK_PDF_SOURCES[bookId] : undefined;
  if (!bookId || !source) {
    return new Response(JSON.stringify({ error: "Book not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const isPreview = searchParams.get("mode") === "preview";
  const cacheKey = `${bookId}:${isPreview ? "preview" : "full"}`;
  const now = Date.now();
  const cached = cachedBookBuffers.get(cacheKey);
  if (cached && now - cached.fetchedAt < BOOK_CACHE_TTL_MS) {
    return buildProtectedPdfResponse(cached.bytes);
  }

  if (source.type === "local") {
    try {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const relPath = isPreview && source.previewPath ? source.previewPath : source.fullPath;
      const absPath = path.resolve(process.cwd(), relPath);
      if (!fs.existsSync(absPath)) {
        return new Response(JSON.stringify({ error: "বইয়ের ফাইলটি সার্ভারে পাওয়া যায়নি।" }), {
          status: 404,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }
      const fileBuf = fs.readFileSync(absPath);
      const bytes = new Uint8Array(fileBuf.buffer, fileBuf.byteOffset, fileBuf.byteLength);
      cachedBookBuffers.set(cacheKey, { bytes, fetchedAt: now });
      return buildProtectedPdfResponse(bytes);
    } catch (err) {
      console.error("[/api/books/stream local read error]", err);
      return new Response(JSON.stringify({ error: "বইটি সার্ভার থেকে লোড করা যায়নি।" }), {
        status: 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  }

  const driveUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(source.driveFileId)}`;

  try {
    const upstream = await fetch(driveUrl, {
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 BismahBookReader/1.0",
      },
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: "বইটি সার্ভার থেকে লোড করা যায়নি। একটু পর আবার চেষ্টা করুন।" }),
        {
          status: 502,
          headers: { "content-type": "application/json; charset=utf-8" },
        },
      );
    }

    const arrayBuf = await upstream.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);

    // Validate PDF magic signature (%PDF-)
    const isPdf =
      bytes.length > 5 &&
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d;

    if (!isPdf) {
      return new Response(
        JSON.stringify({
          error: "বইয়ের ফাইলটি যাচাই করা যায়নি। অনুগ্রহ করে ফাইলের শেয়ারিং সেটিংস চেক করুন।",
        }),
        {
          status: 502,
          headers: { "content-type": "application/json; charset=utf-8" },
        },
      );
    }

    cachedBookBuffers.set(cacheKey, { bytes, fetchedAt: now });
    return buildProtectedPdfResponse(bytes);
  } catch (err) {
    console.error("[/api/books/stream error]", err);
    return new Response(JSON.stringify({ error: "নেটওয়ার্ক সমস্যার কারণে বইটি লোড করা যায়নি।" }), {
      status: 502,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}

function getRequestPublicOrigin(request: Request): string {
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host")?.trim();
  if (host) {
    const proto =
      forwardedProto ||
      (host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    return `${proto}://${host}`;
  }
  const envUrl = process.env.APP_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");
  try {
    return new URL(request.url).origin;
  } catch {
    return "";
  }
}

async function resolveAbsoluteSocialMetaUrls(
  request: Request,
  response: Response,
): Promise<Response> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const origin = getRequestPublicOrigin(request);
  if (!origin) return response;

  const html = await response.text();
  // Ensure og:image, og:image:secure_url, og:url, and twitter:image always have absolute URLs for Facebook/WhatsApp/Telegram crawlers
  const updatedHtml = html
    .replace(
      /(<meta\b[^>]*(?:property=["']og:(?:image|image:secure_url|url)["']|name=["']twitter:image["'])[^>]*\bcontent=["'])(\/[^"']*)(["'][^>]*>)/gi,
      `$1${origin}$2$3`,
    )
    .replace(
      /(<meta\b[^>]*\bcontent=["'])(\/[^"']*)(["'][^>]*(?:property=["']og:(?:image|image:secure_url|url)["']|name=["']twitter:image["'])[^>]*>)/gi,
      `$1${origin}$2$3`,
    );

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return new Response(updatedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "local";
}

function isChatRateLimited(ip: string, now: number): boolean {
  const timestamps = (chatRateBuckets.get(ip) ?? []).filter((ts) => now - ts < CHAT_RATE_WINDOW_MS);
  if (timestamps.length >= CHAT_RATE_MAX_REQUESTS) {
    chatRateBuckets.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  chatRateBuckets.set(ip, timestamps);
  if (chatRateBuckets.size > 500) {
    for (const [key, list] of chatRateBuckets.entries()) {
      const fresh = list.filter((ts) => now - ts < CHAT_RATE_WINDOW_MS);
      if (fresh.length === 0) chatRateBuckets.delete(key);
    }
  }
  return false;
}

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  if (!headers.has("X-Content-Type-Options")) {
    headers.set("X-Content-Type-Options", "nosniff");
  }
  if (!headers.has("Referrer-Policy")) {
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }
  if (!headers.has("Permissions-Policy")) {
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function pruneInactiveVisitors(now: number) {
  for (const [sessionId, lastSeen] of activeCourseVisitors.entries()) {
    if (now - lastSeen > PRESENCE_TTL_MS) {
      activeCourseVisitors.delete(sessionId);
    }
  }
}

async function handleCoursePresenceRequest(request: Request): Promise<Response> {
  const now = Date.now();
  pruneInactiveVisitors(now);

  if (request.method === "POST") {
    try {
      const body = (await request.json().catch(() => ({}))) as { sessionId?: unknown };
      if (typeof body.sessionId === "string" && body.sessionId.trim().length >= 6) {
        activeCourseVisitors.set(body.sessionId.trim().slice(0, 64), now);
      }
    } catch {
      // Ignore malformed body
    }
  } else if (request.method === "DELETE") {
    try {
      const url = new URL(request.url);
      const qSessionId = url.searchParams.get("sessionId");
      if (qSessionId) {
        activeCourseVisitors.delete(qSessionId.trim().slice(0, 64));
      } else {
        const body = (await request.json().catch(() => ({}))) as { sessionId?: unknown };
        if (typeof body.sessionId === "string") {
          activeCourseVisitors.delete(body.sessionId.trim().slice(0, 64));
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  return new Response(
    JSON.stringify({
      activeVisitors: activeCourseVisitors.size,
      updatedAt: now,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}

interface IncomingChatMessage {
  role?: unknown;
  text?: unknown;
}

function buildSystemInstruction(currentPath: string): string {
  return [
    "You are Bismah — Sakibul Islam Sabbir Sir's AI Assistant ('Bismah সাব্বির স্যার এর Ai Assistant').",
    "Persona & Tone: Speak warmly, respectfully, and naturally like an attentive human mentor/assistant.",
    "Language Rule: Reply in natural, fluent Bangla when the user writes in Bangla or Banglish (Romanized Bengali), and reply in clear English when the user writes in English. Keep formatting crisp and readable using short paragraphs or clean bullet points—avoid robotic filler.",
    "Knowledge Priority:",
    "1) For any question about Sakibul Islam Sabbir, Bismahsoft Academy, Bismahsoft Ltd, Education platform (/education covering Free 27-class Quran course at /courses, Paid ৳6,000 Graphic Design & AI Live Course at /graphic-design-course, AI Workshop 2027 at /workshop, and Published Books at /books), Portfolio (/portfolio covering Design, Video, Website Development & Android App Development), tributes (/thankful), account verification (/account), or contact (/contact), answer accurately from the WEBSITE KNOWLEDGE BASE below.",
    "2) For broader, general-knowledge, educational, creative, tech, AI tool, or current real-world questions not on the website, actively use Google Search grounding to research reliable facts online, synthesize the findings cleanly, and present a clear, helpful answer.",
    "3) If a question is nonsensical or no reliable information is available even after searching, politely thank the user, let them know an exact answer wasn't found, and warmly invite them to ask another question.",
    `Current page the visitor is viewing: ${currentPath || "/"}`,
    "",
    WEBSITE_KNOWLEDGE_PROMPT,
  ].join("\n");
}

function extractSafeWebSources(response: unknown): Array<{ title: string; url: string }> {
  const candidates = (
    response as {
      candidates?: Array<{
        groundingMetadata?: {
          groundingChunks?: Array<{ web?: { uri?: string; title?: string } }>;
        };
      }>;
    }
  )?.candidates;

  const chunks = candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];

  const seen = new Set<string>();
  const sources: Array<{ title: string; url: string }> = [];

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    if (typeof uri !== "string" || (!uri.startsWith("https://") && !uri.startsWith("http://"))) {
      continue;
    }
    if (seen.has(uri)) continue;
    seen.add(uri);

    const rawTitle = typeof chunk?.web?.title === "string" ? chunk.web.title.trim() : "";
    let fallbackHost = uri;
    try {
      fallbackHost = new URL(uri).hostname.replace(/^www\./, "");
    } catch {
      // keep uri
    }

    sources.push({
      title: rawTitle || fallbackHost,
      url: uri,
    });
    if (sources.length >= 4) break;
  }

  return sources;
}

async function readLocalEnvVar(varName: string): Promise<string> {
  const fromProcess = process.env[varName]?.trim();
  if (fromProcess) return fromProcess;
  try {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) return "";
    const content = fs.readFileSync(envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIdx = line.indexOf("=");
      if (eqIdx <= 0) continue;
      const key = line.slice(0, eqIdx).trim();
      if (key === varName) {
        return line
          .slice(eqIdx + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // Ignore filesystem errors on edge runtimes
  }
  return "";
}

async function readLocalEnvGeminiKey(): Promise<string> {
  return readLocalEnvVar("GEMINI_API_KEY");
}

const ADMIN_LOGIN_WINDOW_MS = 15 * 60_000;
const ADMIN_LOGIN_MAX_ATTEMPTS = 8;
const adminLoginBuckets = new Map<string, number[]>();
const ADMIN_COOKIE_NAME = "ss_admin_gate";

function isAdminLoginRateLimited(ip: string, now: number): boolean {
  const attempts = (adminLoginBuckets.get(ip) ?? []).filter(
    (ts) => now - ts < ADMIN_LOGIN_WINDOW_MS,
  );
  adminLoginBuckets.set(ip, attempts);
  return attempts.length >= ADMIN_LOGIN_MAX_ATTEMPTS;
}

function recordFailedAdminLogin(ip: string, now: number): void {
  const attempts = (adminLoginBuckets.get(ip) ?? []).filter(
    (ts) => now - ts < ADMIN_LOGIN_WINDOW_MS,
  );
  attempts.push(now);
  adminLoginBuckets.set(ip, attempts);
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

async function verifyAdminSessionToken(
  token: string | undefined,
  secret: string,
  expectedEmail: string,
): Promise<boolean> {
  if (!token || !secret || !expectedEmail) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return false;
  try {
    const crypto = await import("node:crypto");
    const expectedSig = crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
    const sigBuf = Buffer.from(sigB64, "utf8");
    const expBuf = Buffer.from(expectedSig, "utf8");
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return false;
    }
    const decoded = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      email?: string;
      exp?: number;
    };
    return (
      decoded.email?.toLowerCase() === expectedEmail.toLowerCase() &&
      typeof decoded.exp === "number" &&
      decoded.exp > Date.now()
    );
  } catch {
    return false;
  }
}

async function handleAdminAuthRequest(request: Request, pathname: string): Promise<Response> {
  const { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD_HASH, getRuntimeAdminSessionSecret } =
    await import("./lib/admin-auth-config");

  const adminEmail = DEFAULT_ADMIN_EMAIL.toLowerCase();
  const adminHash = DEFAULT_ADMIN_PASSWORD_HASH;
  const sessionSecret =
    (await readLocalEnvVar("ADMIN_SESSION_SECRET")) || getRuntimeAdminSessionSecret();

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const isHttps = request.url.startsWith("https://") || forwardedProto === "https";
  const cookieFlags = isHttps ? "SameSite=None; Secure" : "SameSite=Lax";

  if (pathname === "/api/admin/session") {
    const cookies = parseCookies(request.headers.get("cookie"));
    const verified = await verifyAdminSessionToken(
      cookies[ADMIN_COOKIE_NAME],
      sessionSecret,
      adminEmail,
    );
    return new Response(
      JSON.stringify({ authenticated: verified, email: verified ? adminEmail : null }),
      {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      },
    );
  }

  if (pathname === "/api/admin/logout" && request.method === "POST") {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "set-cookie": `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; ${cookieFlags}; Max-Age=0`,
      },
    });
  }

  if (pathname === "/api/admin/login") {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    const clientIp = getClientIp(request);
    const now = Date.now();
    if (isAdminLoginRateLimited(clientIp, now)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error:
            "অনেকবার ভুল প্রচেষ্টার কারণে লগইন সাময়িকভাবে সীমিত করা হয়েছে। ১৫ মিনিট পর চেষ্টা করুন।",
        }),
        {
          status: 429,
          headers: { "content-type": "application/json; charset=utf-8", "retry-after": "900" },
        },
      );
    }

    let body: { email?: unknown; password?: unknown };
    try {
      const raw = await request.text();
      if (raw.length > 4096) {
        return new Response(JSON.stringify({ ok: false, error: "Payload too large" }), {
          status: 413,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }
      body = JSON.parse(raw) as { email?: unknown; password?: unknown };
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "Invalid request payload" }), {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    const submittedEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const submittedPassword = typeof body.password === "string" ? body.password.trim() : "";

    const crypto = await import("node:crypto");
    const emailBuf = Buffer.from(submittedEmail, "utf8");
    const targetEmailBuf = Buffer.from(adminEmail, "utf8");
    const emailMatches =
      emailBuf.length === targetEmailBuf.length && crypto.timingSafeEqual(emailBuf, targetEmailBuf);

    let passwordMatches = false;
    const hashParts = adminHash.split(":");
    if (hashParts.length === 3 && hashParts[0] === "scrypt") {
      const [, salt, expectedHex] = hashParts;
      if (salt && expectedHex && submittedPassword.length > 0 && submittedPassword.length <= 256) {
        const derived = crypto.scryptSync(submittedPassword, salt, 64);
        const expectedBuf = Buffer.from(expectedHex, "hex");
        passwordMatches =
          derived.length === expectedBuf.length && crypto.timingSafeEqual(derived, expectedBuf);
      }
    }

    if (!emailMatches || !passwordMatches) {
      recordFailedAdminLogin(clientIp, now);
      return new Response(
        JSON.stringify({
          ok: false,
          error: "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়। শুধুমাত্র প্রাইমারি এডমিন লগইন করতে পারবেন।",
        }),
        {
          status: 401,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          },
        },
      );
    }

    adminLoginBuckets.delete(clientIp);
    const payloadB64 = Buffer.from(
      JSON.stringify({ email: adminEmail, exp: now + 12 * 60 * 60 * 1000 }),
      "utf8",
    ).toString("base64url");
    const sig = crypto.createHmac("sha256", sessionSecret).update(payloadB64).digest("base64url");
    const token = `${payloadB64}.${sig}`;

    return new Response(JSON.stringify({ ok: true, email: adminEmail }), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "set-cookie": `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; ${cookieFlags}; Max-Age=43200`,
      },
    });
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function isKeyError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const status =
    typeof (err as { status?: unknown })?.status === "number"
      ? (err as { status: number }).status
      : 0;
  return (
    status === 403 ||
    msg.includes("API_KEY_INVALID") ||
    msg.includes("API key not valid") ||
    msg.includes("PERMISSION_DENIED")
  );
}

async function generateWithAssistantFallback(
  GoogleGenAICtor: typeof import("@google/genai").GoogleGenAI,
  apiKey: string,
  contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>,
  systemInstruction: string,
) {
  const ai = new GoogleGenAICtor({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // 1) Primary: gemini-4-hydrogen with Google Search grounding
  try {
    return await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
      },
    });
  } catch (err1: unknown) {
    if (isKeyError(err1)) throw err1;

    // 2) Fallback: gemini-4-hydrogen without Search tool (handles free-tier search quota 429 / 400)
    try {
      return await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents,
        config: {
          systemInstruction,
        },
      });
    } catch (err2: unknown) {
      if (isKeyError(err2)) throw err2;

      // 3) Fallback: gemini-3.1-flash-lite if gemini-4-hydrogen hits transient 503/429 demand spikes
      return await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents,
        config: {
          systemInstruction,
        },
      });
    }
  }
}

async function handleAssistantChatRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const now = Date.now();
  if (isChatRateLimited(getClientIp(request), now)) {
    return new Response(
      JSON.stringify({
        error:
          "নিরাপত্তার স্বার্থে সাময়িকভাবে অনুরোধ সীমা অতিক্রম হয়েছে। অনুগ্রহ করে ১ মিনিট পর আবার চেষ্টা করুন।",
        errorCode: "RATE_LIMIT",
      }),
      {
        status: 429,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "retry-after": "60",
        },
      },
    );
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 32_768) {
    return new Response(JSON.stringify({ error: "Payload too large" }), {
      status: 413,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  let body: { messages?: unknown; currentPath?: unknown };
  try {
    const rawText = await request.text();
    if (rawText.length > 32_768) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
    body = JSON.parse(rawText) as { messages?: unknown; currentPath?: unknown };
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const rawMessages = Array.isArray(body.messages) ? (body.messages as IncomingChatMessage[]) : [];
  const cleanedMessages = rawMessages
    .map((m) => ({
      role:
        m?.role === "assistant"
          ? ("model" as const)
          : m?.role === "user"
            ? ("user" as const)
            : null,
      text: typeof m?.text === "string" ? m.text.trim().slice(0, 2000) : "",
    }))
    .filter(
      (m): m is { role: "user" | "model"; text: string } => m.role !== null && m.text.length > 0,
    );

  // Drop any initial static UI greeting so conversation contents start with a user turn
  const firstUserIdx = cleanedMessages.findIndex((m) => m.role === "user");
  const conversationalTurns =
    firstUserIdx >= 0 ? cleanedMessages.slice(firstUserIdx).slice(-10) : [];

  if (conversationalTurns.length === 0) {
    return new Response(JSON.stringify({ error: "Please enter a message to ask." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const envApiKey = process.env.GEMINI_API_KEY?.trim() || "";
  const localEnvApiKey = await readLocalEnvGeminiKey();
  const candidateKeys = Array.from(new Set([localEnvApiKey, envApiKey].filter(Boolean)));

  if (candidateKeys.length === 0) {
    return new Response(
      JSON.stringify({
        error:
          "অনলাইন AI ও সার্চ ফিচারের জন্য বৈধ GEMINI_API_KEY প্রয়োজন। অনুগ্রহ করে AI Studio-এর Settings > Secrets প্যানেল থেকে আপনার API Key যাচাই বা যুক্ত করুন। নিচের বাটনে ক্লিক করে এখনই ওয়েবসাইটের অফলাইন নলেজ থেকে উত্তর দেখতে পারেন।",
        errorCode: "API_KEY_INVALID",
      }),
      {
        status: 503,
        headers: { "content-type": "application/json; charset=utf-8" },
      },
    );
  }

  const currentPath =
    typeof body.currentPath === "string" && body.currentPath.startsWith("/")
      ? body.currentPath.slice(0, 120)
      : "/";

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const contents = conversationalTurns.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    }));
    const systemInstruction = buildSystemInstruction(currentPath);

    let response;
    let lastError: unknown;
    for (const key of candidateKeys) {
      try {
        response = await generateWithAssistantFallback(
          GoogleGenAI,
          key,
          contents,
          systemInstruction,
        );
        break;
      } catch (err: unknown) {
        lastError = err;
        if (!isKeyError(err)) {
          throw err;
        }
      }
    }

    if (!response) {
      throw lastError ?? new Error("API key not valid.");
    }

    const reply =
      response.text?.trim() ||
      "দুঃখিত, এই প্রশ্নের জন্য কোনো নির্দিষ্ট উত্তর পাওয়া যায়নি। অনুগ্রহ করে অন্য কোনো প্রশ্ন জিজ্ঞাসা করুন—আমি সাহায্য করতে প্রস্তুত।";

    const latestUserText =
      [...conversationalTurns].reverse().find((m) => m.role === "user")?.text ?? "";
    const sources = extractSafeWebSources(response);
    const suggestedRoutes = findMatchingRoutes(`${latestUserText}\n${reply}`);

    return new Response(
      JSON.stringify({
        reply,
        sources,
        suggestedRoutes,
        mode: "online",
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reach AI assistant service.";
    const status =
      typeof (err as { status?: unknown })?.status === "number"
        ? (err as { status: number }).status
        : 502;
    const safeStatus = status >= 400 && status < 600 ? status : 502;

    const keyInvalid = isKeyError(err);

    console.warn(
      `[/api/assistant-chat] handled ${safeStatus}:`,
      keyInvalid ? "API key missing/invalid" : message.slice(0, 180),
    );

    const errorCode =
      safeStatus === 429 ? "RATE_LIMIT" : keyInvalid ? "API_KEY_INVALID" : "UPSTREAM_ERROR";

    const localizedError =
      safeStatus === 429
        ? "অনেকগুলো অনুরোধ একসাথে আসায় সাময়িকভাবে একটু অপেক্ষা করতে হচ্ছে। কয়েক সেকেন্ড পর আবার চেষ্টা করুন।"
        : keyInvalid
          ? "অনলাইন AI ও সার্চ ফিচারের জন্য বৈধ GEMINI_API_KEY প্রয়োজন। অনুগ্রহ করে AI Studio-এর Settings > Secrets প্যানেল থেকে আপনার API Key যাচাই বা যুক্ত করুন। নিচের বাটনে ক্লিক করে এখনই ওয়েবসাইটের অফলাইন নলেজ থেকে উত্তর দেখতে পারেন।"
          : "অনলাইন AI সার্ভারে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে একটু পর আবার চেষ্টা করুন অথবা নিচের বাটনে ওয়েবসাইট তথ্য থেকে উত্তর দেখুন।";

    return new Response(JSON.stringify({ error: localizedError, errorCode }), {
      status: safeStatus,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function parseYouTubeIdsServer(rawUrl: string): {
  videoId: string | null;
  playlistId: string | null;
} {
  const trimmed = rawUrl.trim();
  let videoId: string | null = null;
  let playlistId: string | null = null;

  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be") {
      const seg = parsed.pathname.split("/").filter(Boolean)[0];
      if (seg && /^[A-Za-z0-9_-]{11}$/.test(seg)) videoId = seg;
      const list = parsed.searchParams.get("list");
      if (list && /^[A-Za-z0-9_-]{10,64}$/.test(list)) playlistId = list;
    } else if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const v = parsed.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) videoId = v;
      const list = parsed.searchParams.get("list");
      if (list && /^[A-Za-z0-9_-]{10,64}$/.test(list)) playlistId = list;
      if (!videoId) {
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (
          parts.length >= 2 &&
          ["shorts", "embed", "live", "v"].includes(parts[0]) &&
          /^[A-Za-z0-9_-]{11}$/.test(parts[1])
        ) {
          videoId = parts[1];
        }
      }
    }
  } catch {
    const vMatch = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/);
    if (vMatch?.[1]) videoId = vMatch[1];
    const lMatch = trimmed.match(/[?&]list=([A-Za-z0-9_-]{10,64})/);
    if (lMatch?.[1]) playlistId = lMatch[1];
  }

  return { videoId, playlistId };
}

async function fetchYouTubeVideoOembed(videoId: string): Promise<{
  title: string;
  channelTitle: string;
  thumbnail: string;
}> {
  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const fallback = {
    title: `YouTube Audio (${videoId})`,
    channelTitle: "YouTube",
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };

  for (const endpoint of [
    `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
    `https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`,
  ]) {
    try {
      const res = await fetch(endpoint, {
        headers: { "user-agent": "Mozilla/5.0 BismahAudioBook/1.0" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
      };
      if (data.title) {
        return {
          title: data.title.trim(),
          channelTitle: (data.author_name || "YouTube").trim(),
          thumbnail: data.thumbnail_url || fallback.thumbnail,
        };
      }
    } catch {
      // Try next metadata endpoint
    }
  }

  return fallback;
}

async function fetchYouTubePlaylistTracks(playlistId: string): Promise<{
  playlistTitle: string;
  tracks: Array<{
    videoId: string;
    title: string;
    channelTitle: string;
    thumbnail: string;
  }>;
}> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${encodeURIComponent(playlistId)}`;
  try {
    const res = await fetch(feedUrl, {
      headers: { "user-agent": "Mozilla/5.0 BismahAudioBook/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const xml = await res.text();
      const feedTitleMatch = xml.match(/<feed[\s\S]*?<title>([\s\S]*?)<\/title>/);
      const playlistTitle = feedTitleMatch?.[1]
        ? decodeXmlEntities(feedTitleMatch[1].trim())
        : `YouTube Playlist`;

      const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g);
      const tracks: Array<{
        videoId: string;
        title: string;
        channelTitle: string;
        thumbnail: string;
      }> = [];

      for (const m of entryMatches) {
        const block = m[1] || "";
        const vid = block.match(/<yt:videoId>([A-Za-z0-9_-]{11})<\/yt:videoId>/)?.[1];
        if (!vid) continue;
        const titleRaw = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || `Track (${vid})`;
        const authorRaw =
          block.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/)?.[1] ||
          "YouTube";
        tracks.push({
          videoId: vid,
          title: decodeXmlEntities(titleRaw.trim()),
          channelTitle: decodeXmlEntities(authorRaw.trim()),
          thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
        });
      }

      if (tracks.length > 0) {
        return { playlistTitle, tracks };
      }
    }
  } catch {
    // Fall through to playlist page fallback
  }

  // Fallback: inspect YouTube playlist page HTML for videoIds
  try {
    const pageRes = await fetch(
      `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`,
      {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
          "accept-language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(6000),
      },
    );
    if (pageRes.ok) {
      const html = await pageRes.text();
      const seen = new Set<string>();
      const ids: string[] = [];
      for (const m of html.matchAll(/"videoId":"([A-Za-z0-9_-]{11})"/g)) {
        const id = m[1];
        if (id && !seen.has(id)) {
          seen.add(id);
          ids.push(id);
          if (ids.length >= 15) break;
        }
      }
      if (ids.length > 0) {
        const resolved = await Promise.all(
          ids.map(async (id) => {
            const meta = await fetchYouTubeVideoOembed(id);
            return { videoId: id, ...meta };
          }),
        );
        return { playlistTitle: "YouTube Playlist", tracks: resolved };
      }
    }
  } catch {
    // Ignore
  }

  return { playlistTitle: "YouTube Playlist", tracks: [] };
}

async function handleBismahApiRequest(
  request: Request,
  pathname: string,
  searchParams: URLSearchParams,
): Promise<Response> {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  if (pathname === "/api/bismah/resolve") {
    const rawUrl = searchParams.get("url")?.trim() || "";
    const { videoId, playlistId } = parseYouTubeIdsServer(rawUrl);

    if (!videoId && !playlistId) {
      return new Response(
        JSON.stringify({ error: "Please paste a valid YouTube video or playlist link." }),
        {
          status: 400,
          headers: { "content-type": "application/json; charset=utf-8" },
        },
      );
    }

    // If playlist link (without specific videoId, or user explicitly pasted playlist?list=...)
    if (playlistId && !videoId) {
      const pl = await fetchYouTubePlaylistTracks(playlistId);
      if (pl.tracks.length === 0) {
        return new Response(
          JSON.stringify({
            error:
              "Could not load tracks from this playlist. Make sure the playlist is public or unlisted.",
          }),
          {
            status: 404,
            headers: { "content-type": "application/json; charset=utf-8" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          type: "playlist",
          playlistId,
          playlistTitle: pl.playlistTitle,
          tracks: pl.tracks,
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        },
      );
    }

    const meta = await fetchYouTubeVideoOembed(videoId!);
    return new Response(
      JSON.stringify({
        type: "video",
        playlistId: playlistId || null,
        tracks: [
          {
            videoId: videoId!,
            title: meta.title,
            channelTitle: meta.channelTitle,
            thumbnail: meta.thumbnail,
          },
        ],
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "public, max-age=300",
        },
      },
    );
  }

  if (pathname === "/api/bismah/thumb") {
    const videoId = searchParams.get("videoId")?.trim() || "";
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      return new Response("Invalid videoId", { status: 400 });
    }
    try {
      const upstream = await fetch(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!upstream.ok) {
        return new Response("Thumbnail unavailable", { status: 404 });
      }
      const bytes = await upstream.arrayBuffer();
      return new Response(bytes, {
        status: 200,
        headers: {
          "content-type": upstream.headers.get("content-type") || "image/jpeg",
          "cache-control": "public, max-age=86400",
        },
      });
    } catch {
      return new Response("Thumbnail fetch failed", { status: 502 });
    }
  }

  if (pathname === "/api/bismah/audio") {
    const videoId = searchParams.get("videoId")?.trim() || "";
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
      return new Response(JSON.stringify({ error: "Invalid videoId" }), {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    const ytCookie = await readLocalEnvVar("YOUTUBE_COOKIE");

    // 1. Fetch fresh visitorData from YouTube embed endpoint (critical for ANDROID_VR / IOS Innertube)
    let visitorData: string | undefined;
    try {
      const embRes = await fetch(`https://www.youtube.com/embed/${encodeURIComponent(videoId)}`, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
          "accept-language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (embRes.ok) {
        const html = await embRes.text();
        visitorData = html.match(/"VISITOR_DATA":"([^"]+)"/)?.[1];
      }
    } catch {
      // Proceed even if embed page fails
    }

    // 2. Multi-client Innertube extraction waterfall (ANDROID_VR -> IOS -> ANDROID)
    // Prefer audio/mp4 (AAC) so both iOS Safari and Android Chrome play smoothly offline & with screen off.
    const innertubeClients = [
      {
        ua: "com.google.android.apps.youtube.vr.oculus/1.61.48 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
        client: {
          clientName: "ANDROID_VR",
          clientVersion: "1.61.48",
          deviceMake: "Oculus",
          deviceModel: "Quest 3",
          osName: "Android",
          osVersion: "12L",
          androidSdkVersion: 32,
          hl: "en",
          gl: "US",
        },
      },
      {
        ua: "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)",
        client: {
          clientName: "IOS",
          clientVersion: "20.10.4",
          deviceMake: "Apple",
          deviceModel: "iPhone16,2",
          osName: "iPhone",
          osVersion: "18.3.2.22D82",
          hl: "en",
          gl: "US",
        },
      },
      {
        ua: "com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip",
        client: {
          clientName: "ANDROID",
          clientVersion: "20.10.38",
          androidSdkVersion: 34,
          hl: "en",
          gl: "US",
        },
      },
    ];

    for (const profile of innertubeClients) {
      try {
        const reqHeaders: Record<string, string> = {
          "content-type": "application/json",
          "user-agent": profile.ua,
        };
        if (visitorData) reqHeaders["x-goog-visitor-id"] = visitorData;
        if (ytCookie) reqHeaders["cookie"] = ytCookie;

        const innertube = await fetch(
          "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
          {
            method: "POST",
            headers: reqHeaders,
            body: JSON.stringify({
              videoId,
              context: {
                client: {
                  ...profile.client,
                  ...(visitorData ? { visitorData } : {}),
                },
              },
              contentCheckOk: true,
              racyCheckOk: true,
            }),
            signal: AbortSignal.timeout(6000),
          },
        );

        if (!innertube.ok) continue;

        const data = (await innertube.json()) as {
          playabilityStatus?: { status?: string };
          videoDetails?: { lengthSeconds?: string };
          streamingData?: {
            adaptiveFormats?: Array<{
              mimeType?: string;
              url?: string;
              bitrate?: number;
              contentLength?: string;
            }>;
          };
        };

        const audioFormats = (data.streamingData?.adaptiveFormats ?? [])
          .filter((f) => f.mimeType?.startsWith("audio/") && Boolean(f.url))
          .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0));

        // Prefer ~128kbps AAC MP4 (fast download + universal iOS/Android screen-off support)
        const mp4Formats = audioFormats.filter((f) => f.mimeType?.includes("audio/mp4"));
        const preferred =
          mp4Formats.find((f) => (f.bitrate ?? 0) >= 96_000 && (f.bitrate ?? 0) <= 180_000) ??
          mp4Formats[0] ??
          audioFormats[0];

        if (!preferred?.url) continue;

        const contentLenNum = Number(preferred.contentLength || 0);
        const cleanCt = (preferred.mimeType || "audio/mp4").split(";")[0].trim() || "audio/mp4";

        if (contentLenNum > 0) {
          // Verify first 1MB chunk succeeds before committing 200 OK audio stream headers
          const CHUNK_SIZE = 1024 * 1024;
          const sep = preferred.url.includes("?") ? "&" : "?";
          const firstEnd = Math.min(contentLenNum - 1, CHUNK_SIZE - 1);
          const firstRes = await fetch(`${preferred.url}${sep}range=0-${firstEnd}`, {
            headers: { "user-agent": profile.ua, accept: "*/*" },
            signal: AbortSignal.timeout(15000),
          });

          if (!firstRes.ok) continue;
          const firstBuf = new Uint8Array(await firstRes.arrayBuffer());
          if (firstBuf.byteLength === 0) continue;

          const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
              try {
                controller.enqueue(firstBuf);
                let offset = firstEnd + 1;
                while (offset < contentLenNum) {
                  const end = Math.min(contentLenNum - 1, offset + CHUNK_SIZE - 1);
                  const chunkRes = await fetch(`${preferred.url}${sep}range=${offset}-${end}`, {
                    headers: { "user-agent": profile.ua, accept: "*/*" },
                    signal: AbortSignal.timeout(20000),
                  });
                  if (!chunkRes.ok) {
                    throw new Error(`Chunk failed with status ${chunkRes.status}`);
                  }
                  const chunkBuf = new Uint8Array(await chunkRes.arrayBuffer());
                  if (chunkBuf.byteLength === 0) break;
                  controller.enqueue(chunkBuf);
                  offset += chunkBuf.byteLength;
                }
                controller.close();
              } catch (err) {
                controller.error(err);
              }
            },
          });

          const headers = new Headers();
          headers.set("content-type", cleanCt);
          headers.set("content-length", String(contentLenNum));
          headers.set("accept-ranges", "bytes");
          headers.set("x-bismah-audio-source", "direct");
          if (data.videoDetails?.lengthSeconds) {
            headers.set("x-bismah-duration-sec", data.videoDetails.lengthSeconds);
          }
          headers.set("cache-control", "private, max-age=3600");
          return new Response(stream, { status: 200, headers });
        }

        // Fallback if YouTube omitted contentLength
        const audioRes = await fetch(preferred.url, {
          headers: {
            "user-agent": profile.ua,
            accept: "*/*",
          },
          signal: AbortSignal.timeout(45000),
        });

        if (audioRes.ok && audioRes.body) {
          const rawCt = audioRes.headers.get("content-type") || cleanCt;
          const headers = new Headers();
          headers.set("content-type", rawCt.split(";")[0].trim() || "audio/mp4");
          const len = audioRes.headers.get("content-length");
          if (len) headers.set("content-length", len);
          headers.set("accept-ranges", "bytes");
          headers.set("x-bismah-audio-source", "direct");
          if (data.videoDetails?.lengthSeconds) {
            headers.set("x-bismah-duration-sec", data.videoDetails.lengthSeconds);
          }
          headers.set("cache-control", "private, max-age=3600");
          return new Response(audioRes.body, { status: 200, headers });
        }
      } catch {
        // Try next Innertube client
      }
    }

    return new Response(
      JSON.stringify({
        mode: "client-extract-fallback",
        videoId,
        hasAudioBlob: false,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
      },
    );
  }

  // Allowlisted audio stream relay used ONLY when the user's residential browser resolves a
  // googlevideo.com or public Invidious/Piped stream URL that lacks CORS headers.
  if (pathname === "/api/bismah/proxy-audio") {
    const rawTarget = searchParams.get("url")?.trim() || "";
    let parsedTarget: URL;
    try {
      parsedTarget = new URL(rawTarget);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid audio stream URL" }), {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    const host = parsedTarget.hostname.toLowerCase();
    const isAllowedHost =
      parsedTarget.protocol === "https:" &&
      (host.endsWith(".googlevideo.com") ||
        host === "inv.nadeko.net" ||
        host === "invidious.nerdvpn.de" ||
        host === "invidious.tiekoetter.com" ||
        host.startsWith("pipedproxy-") ||
        host.endsWith(".kavin.rocks") ||
        host.endsWith(".private.coffee"));

    if (!isAllowedHost) {
      return new Response(JSON.stringify({ error: "Audio host is not allowlisted" }), {
        status: 403,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    try {
      const upstream = await fetch(parsedTarget.toString(), {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
          accept: "audio/*,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(45000),
      });

      const ct = upstream.headers.get("content-type") || "";
      if (
        !upstream.ok ||
        !upstream.body ||
        (!ct.startsWith("audio/") && !ct.includes("octet-stream"))
      ) {
        return new Response(JSON.stringify({ error: "Upstream audio unavailable" }), {
          status: 502,
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      }

      const headers = new Headers();
      headers.set("content-type", ct.split(";")[0].trim() || "audio/mp4");
      const len = upstream.headers.get("content-length");
      if (len) headers.set("content-length", len);
      headers.set("cache-control", "private, max-age=1800");
      return new Response(upstream.body, { status: 200, headers });
    } catch {
      return new Response(JSON.stringify({ error: "Failed to stream audio" }), {
        status: 502,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/course-presence") {
        return withSecurityHeaders(await handleCoursePresenceRequest(request));
      }
      if (url.pathname === "/api/assistant-chat") {
        return withSecurityHeaders(await handleAssistantChatRequest(request));
      }
      if (url.pathname.startsWith("/api/admin/")) {
        return withSecurityHeaders(await handleAdminAuthRequest(request, url.pathname));
      }
      if (url.pathname.startsWith("/api/books/")) {
        return withSecurityHeaders(
          await handleSecureBookStreamRequest(request, url.pathname, url.searchParams),
        );
      }
      if (url.pathname.startsWith("/api/bismah/")) {
        return withSecurityHeaders(
          await handleBismahApiRequest(request, url.pathname, url.searchParams),
        );
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      const resolved =
        url.pathname === "/books" || url.pathname === "/graphic-design-course"
          ? await resolveAbsoluteSocialMetaUrls(request, normalized)
          : normalized;
      return withSecurityHeaders(resolved);
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
