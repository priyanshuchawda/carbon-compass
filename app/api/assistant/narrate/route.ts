import { NextResponse } from "next/server";
import { redactError } from "@/lib/carbon/redaction";
import { sanitizeText } from "@/lib/carbon/sanitize";
import { assistantRequestSchema, assistantResponseContractSchema } from "@/lib/validation/schemas";
import { getGeminiApiKey } from "@/lib/carbon/ai/config";
import { buildAssistantPrompt, getFallbackResponse } from "@/lib/carbon/ai/prompt";
import type { GeminiContent } from "@/lib/carbon/ai/client";
import { resolveGeminiTextWithTools } from "@/lib/carbon/ai/tool-loop";
import { handleRateLimit, parseBoundedBody } from "@/lib/carbon/api-utils";
import { logError } from "@/lib/carbon/logger";

export async function POST(request: Request) {
  // 1. Rate Limiting
  const limitRes = handleRateLimit(request, 10, 60_000);
  const { headers, requestId } = limitRes;

  if (!limitRes.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers }
    );
  }

  // 2. Validate request payload
  const parsed = await parseBoundedBody(request, assistantRequestSchema, headers);
  if (!parsed.success) {
    return parsed.errorResponse;
  }

  const { profile, result, recommendations, footprint } = parsed.data;

  // Sanitize user inputs (non-mutating)
  const sanitizedProfile = {
    ...profile,
    city: sanitizeText(profile.city, 80),
    country: sanitizeText(profile.country, 80),
  };

  const fallbackJSON = getFallbackResponse({
    profile: sanitizedProfile,
    result,
    recommendations,
    footprint,
  });

  // 3. API Key check
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        narrative: fallbackJSON.narrative,
        weeklyChallenge: fallbackJSON.weeklyChallenge,
        goalTip: fallbackJSON.goalTip,
        costUSD: 0,
        isDemo: true,
      },
      { headers }
    );
  }

  try {
    const systemInstruction = buildAssistantPrompt({
      profile: sanitizedProfile,
      result,
      recommendations,
      footprint,
    });

    const contents: GeminiContent[] = [
      {
        role: "user",
        parts: [{ text: systemInstruction }],
      },
    ];

    const resolved = await resolveGeminiTextWithTools(contents, {
      profile: sanitizedProfile,
      footprintInput: footprint,
      result,
    });
    const finalJSON = assistantResponseContractSchema.parse(JSON.parse(resolved.text));

    return NextResponse.json(
      {
        narrative: finalJSON.narrative,
        weeklyChallenge: finalJSON.weeklyChallenge,
        goalTip: finalJSON.goalTip,
        costUSD: resolved.costUSD,
        isDemo: false,
      },
      { headers }
    );
  } catch (err) {
    const safeError = redactError(err);
    logError("Narrate API endpoint failure", err, { requestId });

    return NextResponse.json(
      {
        narrative: fallbackJSON.narrative,
        weeklyChallenge: fallbackJSON.weeklyChallenge,
        goalTip: fallbackJSON.goalTip,
        costUSD: 0,
        error: safeError.message,
        isDemo: true,
      },
      { headers }
    );
  }
}
