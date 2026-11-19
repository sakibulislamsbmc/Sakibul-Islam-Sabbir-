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

const BOOK_PDF_SOURCES: Record<string, { driveFileId: string }> = {
  "muslim-ten-essential-topics": {
    driveFileId: "1rlVLdKSZzz_HAtHPihRthvIsKPsV0Wd1",
  },
};

const BOOK_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour server-side memory cache
const cachedBookBuffers = new Map<string, { bytes: Uint8Array; fetchedAt: number }>();

async function handleSecureBookStreamRequest(
  request: Request,
  pathname: string,
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
  if (!bookId || !BOOK_PDF_SOURCES[bookId]) {
    return new Response(JSON.stringify({ error: "Book not found." }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const now = Date.now();
  const cached = cachedBookBuffers.get(bookId);
  if (cached && now - cached.fetchedAt < BOOK_CACHE_TTL_MS) {
    return new Response(cached.bytes as unknown as BodyInit, {
      status: 200,
      headers: {
        "content-type": "application/octet-stream",
        "content-length": String(cached.bytes.byteLength),
        "content-disposition": "inline",
        "cache-control": "private, no-store, no-transform",
        "x-content-type-options": "nosniff",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  const source = BOOK_PDF_SOURCES[bookId];
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

    cachedBookBuffers.set(bookId, { bytes, fetchedAt: now });

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
  } catch (err) {
    console.error("[/api/books/stream error]", err);
    return new Response(JSON.stringify({ error: "নেটওয়ার্ক সমস্যার কারণে বইটি লোড করা যায়নি।" }), {
      status: 502,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
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
    "1) For any question about Sakibul Islam Sabbir, Bismahsoft Academy, Bismahsoft Ltd, courses (Free 27-class Quran course at /courses or Paid ৳6,000 Graphic Design & AI Live Course at /graphic-design-course), AI Workshop 2027 (/workshop), web/Android projects (/projects), portfolio (/portfolio), tributes (/thankful), account verification (/account), or contact (/contact), answer accurately from the WEBSITE KNOWLEDGE BASE below.",
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
        return withSecurityHeaders(await handleSecureBookStreamRequest(request, url.pathname));
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withSecurityHeaders(await normalizeCatastrophicSsrResponse(response));
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
