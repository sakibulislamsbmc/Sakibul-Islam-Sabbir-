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

async function readLocalEnvGeminiKey(): Promise<string> {
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
      if (key === "GEMINI_API_KEY") {
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

  let body: { messages?: unknown; currentPath?: unknown };
  try {
    body = (await request.json()) as { messages?: unknown; currentPath?: unknown };
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
        return await handleCoursePresenceRequest(request);
      }
      if (url.pathname === "/api/assistant-chat") {
        return await handleAssistantChatRequest(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
