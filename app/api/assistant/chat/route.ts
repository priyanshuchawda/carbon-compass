import { NextResponse } from "next/server";
import { redactError } from "@/lib/carbon/redaction";
import { sanitizeText } from "@/lib/carbon/sanitize";
import { assistantChatRequestSchema, chatResponseSchema } from "@/lib/validation/schemas";
import { getGeminiApiKey } from "@/lib/carbon/ai/config";
import { buildChatPrompt, getFallbackChatResponse } from "@/lib/carbon/ai/prompt";
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

  // 2. Validate request payload using the bounded parser
  const parsed = await parseBoundedBody(request, assistantChatRequestSchema, headers);
  if (!parsed.success) {
    return parsed.errorResponse;
  }

  const { profile, result, footprint, messages } = parsed.data;

  // Sanitize user-provided fields (non-mutating)
  const sanitizedProfile = {
    ...profile,
    city: sanitizeText(profile.city, 80),
    country: sanitizeText(profile.country, 80),
  };

  const lastUserMsg = messages[messages.length - 1]?.content ?? "";
  const fallbackText = getFallbackChatResponse(lastUserMsg, {
    profile: sanitizedProfile,
    result,
    footprint,
  });

  // 3. API Key check
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        content: fallbackText,
        costUSD: 0,
        isDemo: true,
      },
      { headers }
    );
  }

  try {
    const systemInstruction = buildChatPrompt({ profile: sanitizedProfile, result, footprint });

    // Construct chat history in Gemini format
    const contents: GeminiContent[] = [
      {
        role: "user",
        parts: [{ text: systemInstruction }],
      },
    ];

    // Append history
    for (const msg of messages) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    const resolved = await resolveGeminiTextWithTools(contents, {
      profile: sanitizedProfile,
      footprintInput: footprint,
      result,
    });

    const validatedChatRes = chatResponseSchema.parse({
      content: resolved.text,
      costUSD: resolved.costUSD,
      isDemo: false,
    });

    return NextResponse.json(validatedChatRes, { headers });
  } catch (err) {
    const safeError = redactError(err);
    logError("Chat API endpoint failure", err, { requestId });

    const validatedFallback = chatResponseSchema.parse({
      content: fallbackText,
      costUSD: 0,
      isDemo: true,
    });

    return NextResponse.json(
      {
        ...validatedFallback,
        error: safeError.message,
      },
      { headers }
    );
  }
}
