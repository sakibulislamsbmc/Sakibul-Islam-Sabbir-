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

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/course-presence") {
        return await handleCoursePresenceRequest(request);
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
