/**
 * sessionStorage bridge for Carbon Compass.
 *
 * Passes user-submitted FootprintInput and UserProfile from the calculator
 * form to the dashboard, actions, and report pages within the same browser
 * session. Calculator data stays in the browser unless a user opens AI
 * assistant features, which send summarized context to server-side API routes.
 *
 * Keys are namespaced under "carbon-compass.session.*" to avoid collisions
 * with the progress localStorage keys ("carbon-compass:progress:v1").
 */

import { z } from "zod";
import { footprintInputSchema, userProfileSchema } from "@/lib/validation/schemas";
import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

const SESSION_FOOTPRINT_KEY = "carbon-compass.session.footprint";
const SESSION_PROFILE_KEY = "carbon-compass.session.profile";

function safeSessionStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> | undefined {
  if (typeof window === "undefined") return undefined;
  return window.sessionStorage;
}

// ── write ─────────────────────────────────────────────────────────────────────

export function saveSessionFootprint(input: FootprintInput): { ok: boolean; reason?: string } {
  const parsed = footprintInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: "Validation failed: " + parsed.error.message };
  }
  const storage = safeSessionStorage();
  if (!storage) {
    return { ok: false, reason: "sessionStorage is not available" };
  }
  try {
    storage.setItem(SESSION_FOOTPRINT_KEY, JSON.stringify(parsed.data));
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Write failed";
    return { ok: false, reason: msg };
  }
}

export function saveSessionProfile(profile: UserProfile): { ok: boolean; reason?: string } {
  const parsed = userProfileSchema.safeParse(profile);
  if (!parsed.success) {
    return { ok: false, reason: "Validation failed: " + parsed.error.message };
  }
  const storage = safeSessionStorage();
  if (!storage) {
    return { ok: false, reason: "sessionStorage is not available" };
  }
  try {
    storage.setItem(SESSION_PROFILE_KEY, JSON.stringify(parsed.data));
    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Write failed";
    return { ok: false, reason: msg };
  }
}

// ── read ──────────────────────────────────────────────────────────────────────

export function loadSessionFootprint(): FootprintInput | null {
  const storage = safeSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(SESSION_FOOTPRINT_KEY);
    if (!raw) return null;
    const parsed = footprintInputSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function loadSessionProfile(): UserProfile | null {
  const storage = safeSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(SESSION_PROFILE_KEY);
    if (!raw) return null;
    const parsed = userProfileSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// ── clear ─────────────────────────────────────────────────────────────────────

export function clearSessionData(): void {
  const storage = safeSessionStorage();
  if (!storage) return;
  storage.removeItem(SESSION_FOOTPRINT_KEY);
  storage.removeItem(SESSION_PROFILE_KEY);
}

// ── schema re-exports for validation ──────────────────────────────────────────

export const sessionFootprintSchema = footprintInputSchema;
export const sessionProfileSchema = userProfileSchema;

// ── combined helper ───────────────────────────────────────────────────────────

/**
 * Zod schema for the combined session payload (profile + footprint).
 */
export const sessionPayloadSchema = z.object({
  profile: userProfileSchema,
  footprint: footprintInputSchema,
});

export type SessionPayload = z.infer<typeof sessionPayloadSchema>;

export function loadSessionPayload(): SessionPayload | null {
  const footprint = loadSessionFootprint();
  const profile = loadSessionProfile();
  if (!footprint || !profile) return null;
  return { footprint, profile };
}
