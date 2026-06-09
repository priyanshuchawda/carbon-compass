import { NextResponse } from "next/server";
import { redactError } from "@/lib/carbon/redaction";
import { sanitizeText } from "@/lib/carbon/sanitize";
import { assistantRequestSchema, assistantResponseContractSchema } from "@/lib/validation/schemas";
import { executeTool } from "@/lib/carbon/assistant-tools";
import { rateLimit } from "@/lib/carbon/ai/rate-limit";
import { getGeminiApiKey } from "@/lib/carbon/ai/config";
import { buildAssistantPrompt, getFallbackResponse } from "@/lib/carbon/ai/prompt";
import { callGeminiWithFallback } from "@/lib/carbon/ai/client";
import type { GeminiContent, GeminiPart } from "@/lib/carbon/ai/client";
import { readBoundedBody } from "@/lib/carbon/utils";

export async function POST(request: Request) {
  // 1. Rate Limiting & Request ID
  const ip = request.headers.get("x-forwarded-for") || "unknown-ip";
  const limitRes = rateLimit(ip, 10, 60_000);
  const requestId = `req_${Math.random().toString(36).substring(2, 11)}`;
  const headers = new Headers();
  const resetSeconds = Math.ceil(Math.max(0, limitRes.resetAt - Date.now()) / 1000);
  headers.set("X-Request-ID", requestId);
  headers.set("RateLimit-Limit", "10");
  headers.set("RateLimit-Remaining", String(limitRes.remaining));
  headers.set("RateLimit-Reset", String(resetSeconds));
  headers.set("X-RateLimit-Limit", "10");
  headers.set("X-RateLimit-Remaining", String(limitRes.remaining));
  headers.set("X-RateLimit-Reset", String(resetSeconds));

  if (!limitRes.allowed) {
    headers.set("Retry-After", String(resetSeconds));
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers }
    );
  }

  // 2. Validate request payload
  let validatedData;
  try {
    const rawText = await readBoundedBody(request);
    const rawPayload = JSON.parse(rawText);
    const result = assistantRequestSchema.safeParse(rawPayload);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed: " + result.error.message },
        { status: 400, headers }
      );
    }
    validatedData = result.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Invalid JSON request payload";
    return NextResponse.json(
      { error: msg },
      { status: 400, headers }
    );
  }

  const { profile, result, recommendations, footprint } = validatedData;

  // Sanitize user inputs
  profile.city = sanitizeText(profile.city, 80);
  profile.country = sanitizeText(profile.country, 80);

  const fallbackJSON = getFallbackResponse({ profile, result, recommendations, footprint });

  // 3. API Key check
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return NextResponse.json({
      narrative: fallbackJSON.narrative,
      weeklyChallenge: fallbackJSON.weeklyChallenge,
      goalTip: fallbackJSON.goalTip,
      costUSD: 0,
      isDemo: true
    }, { headers });
  }

  try {
    const systemInstruction = buildAssistantPrompt({
      profile,
      result,
      recommendations,
      footprint
    });

    const contents: GeminiContent[] = [
      {
        role: "user",
        parts: [{ text: systemInstruction }]
      }
    ];

    let accumulatedCost = 0;
    let finalJSON = null;

    // Up to 4 turns of tool calling
    for (let turn = 0; turn < 4; turn++) {
      const { responseBody, costUSD } = await callGeminiWithFallback(
        contents,
        AbortSignal.timeout(10000)
      );

      accumulatedCost += costUSD;

      const candidate = responseBody.candidates?.[0];
      const parts = candidate?.content?.parts;

      if (!parts || parts.length === 0) {
        throw new Error("Invalid response structure from Gemini API");
      }

      // Check for function calls
      const functionCalls = parts.filter(
        (part): part is GeminiPart & { functionCall: Required<GeminiPart>["functionCall"] } =>
          !!part.functionCall
      );

      if (functionCalls.length > 0) {
        contents.push({
          role: "model",
          parts
        });

        const functionResponses: GeminiPart[] = [];
        for (const call of functionCalls) {
          const { name, args } = call.functionCall;
          const resultData = await executeTool(name, args, {
            profile,
            footprintInput: footprint,
            result
          });

          functionResponses.push({
            functionResponse: {
              name,
              response: { result: resultData }
            }
          });
        }

        // Record function responses in history
        contents.push({
          role: "function",
          parts: functionResponses
        });

        // Continue loop
        continue;
      }

      // If no function call, parse text response
      const candidateText = parts[0]?.text;
      if (!candidateText) {
        throw new Error("No text or function call in Gemini response");
      }

      const rawJSON = JSON.parse(candidateText.trim());
      // Zod contract check
      finalJSON = assistantResponseContractSchema.parse(rawJSON);
      break;
    }

    if (!finalJSON) {
      throw new Error("Failed to retrieve final JSON from Gemini API");
    }

    return NextResponse.json({
      narrative: finalJSON.narrative,
      weeklyChallenge: finalJSON.weeklyChallenge,
      goalTip: finalJSON.goalTip,
      costUSD: accumulatedCost,
      isDemo: false
    }, { headers });

  } catch (err) {
    const safeError = redactError(err);
    console.error(`Narrate API Endpoint Failure [ReqID: ${requestId}]:`, safeError);

    return NextResponse.json({
      narrative: fallbackJSON.narrative,
      weeklyChallenge: fallbackJSON.weeklyChallenge,
      goalTip: fallbackJSON.goalTip,
      error: safeError.message,
      isDemo: true
    }, { headers });
  }
}
