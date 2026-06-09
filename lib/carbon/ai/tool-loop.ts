import "server-only";
import { executeTool } from "@/lib/carbon/assistant-tools";
import { callGeminiWithFallback } from "@/lib/carbon/ai/client";
import type { GeminiContent, GeminiPart } from "@/lib/carbon/ai/client";
import type { FootprintInput, FootprintResult, UserProfile } from "@/lib/carbon/types";

type ToolContext = {
  profile: UserProfile;
  footprintInput: FootprintInput;
  result: FootprintResult;
};

type GeminiTextResult = {
  text: string;
  costUSD: number;
};

function getCandidateParts(parts: GeminiPart[] | undefined): GeminiPart[] {
  if (!parts || parts.length === 0) {
    throw new Error("Invalid response structure from Gemini API");
  }

  return parts;
}

function getFunctionCalls(parts: GeminiPart[]) {
  return parts.filter(
    (part): part is GeminiPart & { functionCall: Required<GeminiPart>["functionCall"] } =>
      !!part.functionCall
  );
}

async function buildFunctionResponses(
  functionCalls: ReturnType<typeof getFunctionCalls>,
  context: ToolContext
): Promise<GeminiPart[]> {
  const functionResponses: GeminiPart[] = [];

  for (const call of functionCalls) {
    const { name, args } = call.functionCall;
    const result = await executeTool(name, args, context);

    functionResponses.push({
      functionResponse: {
        name,
        response: { result },
      },
    });
  }

  return functionResponses;
}

export async function resolveGeminiTextWithTools(
  contents: GeminiContent[],
  context: ToolContext,
  maxTurns = 4
): Promise<GeminiTextResult> {
  let accumulatedCost = 0;

  for (let turn = 0; turn < maxTurns; turn++) {
    const { responseBody, costUSD } = await callGeminiWithFallback(
      contents,
      AbortSignal.timeout(10000)
    );

    accumulatedCost += costUSD;
    const parts = getCandidateParts(responseBody.candidates?.[0]?.content?.parts);
    const functionCalls = getFunctionCalls(parts);

    if (functionCalls.length > 0) {
      contents.push({ role: "model", parts });
      contents.push({
        role: "function",
        parts: await buildFunctionResponses(functionCalls, context),
      });
      continue;
    }

    const text = parts[0]?.text?.trim();
    if (!text) {
      throw new Error("No text or function call in Gemini response");
    }

    return { text, costUSD: accumulatedCost };
  }

  throw new Error("Failed to retrieve final text from Gemini API");
}
