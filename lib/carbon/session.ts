/**
 * sessionStorage bridge for Carbon Compass.
 *
 * Passes user-submitted FootprintInput and UserProfile from the calculator
 * form to the dashboard, actions, and report pages within the same browser
 * session. Data never leaves the browser.
 *
 * Keys are namespaced under "carbon-compass.session.*" to avoid collisions
 * with the progress localStorage keys ("carbon-compass:progress:v1").
 */

import { z } from "zod";
import {
  footprintInputSchema,
  userProfileSchema,
} from "@/lib/validation/schemas";
import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

const SESSION_FOOTPRINT_KEY = "carbon-compass.session.footprint";
const SESSION_PROFILE_KEY = "carbon-compass.session.profile";

function safeSessionStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> | undefined {
  if (typeof window === "undefined") return undefined;
  return window.sessionStorage;
}

// ── write ─────────────────────────────────────────────────────────────────────

export function saveSessionFootprint(input: FootprintInput): void {
  const storage = safeSessionStorage();
  if (!storage) return;
  storage.setItem(SESSION_FOOTPRINT_KEY, JSON.stringify(input));
}

export function saveSessionProfile(profile: UserProfile): void {
  const storage = safeSessionStorage();
  if (!storage) return;
  storage.setItem(SESSION_PROFILE_KEY, JSON.stringify(profile));
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
