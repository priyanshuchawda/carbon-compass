import { NextResponse, type NextRequest } from "next/server";
import { securityHeaders } from "./lib/carbon/security/headers";

/**
 * Edge/runtime middleware: enforces security headers, request body size limits,
 * and Origin checks to defend against CSRF on API endpoints.
 */

const MAX_API_BODY_BYTES = 256 * 1024; // 256 KB

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // 1. API Guard: reject oversized bodies or invalid origins
  if (pathname.startsWith("/api/")) {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_API_BODY_BYTES) {
      return jsonResponse({ error: "Request body too large." }, 413);
    }

    // Origin check on POST requests to prevent cross-origin state modifications (CSRF defense)
    if (request.method === "POST") {
      const origin = request.headers.get("origin");
      if (origin) {
        try {
          const originUrl = new URL(origin);
          if (originUrl.host !== request.nextUrl.host) {
            return jsonResponse({ error: "Forbidden: Cross-origin requests are not allowed." }, 403);
          }
        } catch {
          return jsonResponse({ error: "Forbidden: Malformed origin header." }, 403);
        }
      }
    }
  }

  // 2. Bypass header mutation for the assistant endpoint to allow streaming if needed (or standard next)
  if (pathname === "/api/assistant/narrate") {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  for (const { key, value } of securityHeaders()) {
    response.headers.set(key, value);
  }
  return response;
}

function jsonResponse(body: unknown, status: number): NextResponse {
  const res = NextResponse.json(body, { status });
  for (const { key, value } of securityHeaders()) {
    res.headers.set(key, value);
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.well-known).*)"],
};
