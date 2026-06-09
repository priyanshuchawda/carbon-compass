import { NextResponse } from "next/server";
import { redactError } from "./redaction";
import { readBoundedBody } from "./utils";
import { rateLimit } from "./ai/rate-limit";
import type { ZodSchema } from "zod";

export interface RateLimitResult {
  allowed: boolean;
  headers: Headers;
  requestId: string;
}

export function handleRateLimit(request: Request, limit = 10, windowMs = 60_000): RateLimitResult {
  const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
  const limitRes = rateLimit(ip, limit, windowMs);
  const requestId = `req_${crypto.randomUUID()}`;
  const headers = new Headers();
  const resetSeconds = Math.ceil(Math.max(0, limitRes.resetAt - Date.now()) / 1000);
  headers.set("X-Request-ID", requestId);
  headers.set("RateLimit-Limit", String(limit));
  headers.set("RateLimit-Remaining", String(limitRes.remaining));
  headers.set("RateLimit-Reset", String(resetSeconds));
  headers.set("X-RateLimit-Limit", String(limit));
  headers.set("X-RateLimit-Remaining", String(limitRes.remaining));
  headers.set("X-RateLimit-Reset", String(resetSeconds));
  headers.set("Cache-Control", "no-store, max-age=0");

  if (!limitRes.allowed) {
    headers.set("Retry-After", String(resetSeconds));
  }

  return {
    allowed: limitRes.allowed,
    headers,
    requestId,
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiFailureResponse {
  success: false;
  error: string;
  issues?: Array<{ path: string; message: string }>;
}

export function apiSuccess<T>(data: T, headers?: Headers, status = 200): Response {
  return NextResponse.json({ success: true, data }, { headers, status });
}

export function apiFailure(
  error: string,
  issues?: Array<{ path: string; message: string }>,
  headers?: Headers,
  status = 400
): Response {
  return NextResponse.json({ success: false, error, issues }, { headers, status });
}

/**
 * Standard body parser that uses readBoundedBody and validates it with Zod.
 */
export async function parseBoundedBody<T>(
  request: Request,
  schema: ZodSchema<T>,
  headers?: Headers,
  limitBytes = 65536
): Promise<{ success: true; data: T } | { success: false; errorResponse: Response }> {
  try {
    const rawText = await readBoundedBody(request, limitBytes);
    const rawPayload = JSON.parse(rawText);
    const parsed = schema.safeParse(rawPayload);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return {
        success: false,
        errorResponse: apiFailure("Validation failed", issues, headers, 400),
      };
    }
    return { success: true, data: parsed.data };
  } catch (err) {
    const safeError = redactError(err);
    const displayMsg =
      err instanceof SyntaxError ? "Invalid JSON request payload" : safeError.message;
    return {
      success: false,
      errorResponse: apiFailure(displayMsg, undefined, headers, 400),
    };
  }
}
