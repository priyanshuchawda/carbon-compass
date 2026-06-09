import { NextResponse } from "next/server";
import { redactSensitiveString, redactError } from "@/lib/carbon/redaction";
import type { FootprintResult, Recommendation, UserProfile } from "@/lib/carbon/types";

// Pricing for Gemini 2.5 Flash
const INPUT_COST_PER_MILLION = 0.075;
const OUTPUT_COST_PER_MILLION = 0.30;

interface AssistantRequestBody {
  profile: UserProfile;
  result: FootprintResult;
  recommendations: Recommendation[];
}

/**
 * Robust fetch helper to call Gemini API with exponential retry backoff
 */
async function callGeminiAPI(
  apiKey: string,
  prompt: string,
  maxAttempts = 3,
  initialDelayMs = 300
): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          narrative: {
            type: "STRING",
            description: "A short, encouraging 2-3 sentence summary explaining their top emissions driver, its percentage, and a dynamic local reference."
          },
          weeklyChallenge: {
            type: "STRING",
            description: "A practical weekly challenge customized to help reduce their highest impact category."
          },
          goalTip: {
            type: "STRING",
            description: "A personalized tip linking their carbon footprint reduction directly to their main goal."
          }
        },
        required: ["narrative", "weeklyChallenge", "goalTip"]
      }
    }
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        // Set a reasonable timeout
        signal: AbortSignal.timeout(8000)
      });

      if (response.ok) {
        return response;
      }
      
      // If we got a rate-limit (429) or server error (5xx), we retry
      if (response.status === 429 || response.status >= 500) {
        throw new Error(`HTTP Error status ${response.status}`);
      }
      
      // Other errors (e.g. 400 bad request) do not retry
      return response;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError || new Error("Gemini API call failed after retries");
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    // 1. If key is missing, return a local fallback payload directly
    if (!apiKey) {
      return NextResponse.json({
        narrative: "Your carbon footprint looks standard for your profile, but COMMUTE remains your primary leverage point.",
        weeklyChallenge: "Swap 2 private scooter/car trips for metro, bus, or cycling this week.",
        goalTip: "Commute swaps save petrol cost directly, helping you stretch your monthly budget.",
        costUSD: 0,
        isDemo: true
      });
    }

    const payload: AssistantRequestBody = await request.json();
    const { profile, result, recommendations } = payload;

    // 2. Build structured grounding context prompt
    const topCategory = result.breakdown.find(item => item.category === result.topCategory);
    const leadingRec = recommendations[0];
    
    const prompt = `
      You are the Compass Assistant for Carbon Compass, a sustainability platform.
      Provide a personalized, encouraging analysis for a user with the following profile:
      - City: ${profile.city}
      - Persona: ${profile.persona}
      - Goal: ${profile.mainGoal} (values: save_money, reduce_carbon, learn, habit_building)
      
      Emissions metrics calculated by our local engine:
      - Monthly footprint: ${result.monthlyTotalKgCO2e} kg CO2e
      - Annual footprint: ${result.annualTotalKgCO2e} kg CO2e
      - Eco score: ${result.ecoScore}/100 (higher score means lower per-person impact)
      - Highest impact category: ${topCategory?.label ?? result.topCategory} (contributes ${topCategory ? Math.round((topCategory.kgCO2e / result.monthlyTotalKgCO2e) * 100) : 0}% of monthly emissions)
      - Potential monthly saving: ${result.potentialMonthlySavingKgCO2e} kg CO2e
      - Recommended first step: ${leadingRec ? leadingRec.title : "Reduce daily vehicle travel"}
      
      Instructions:
      - Refer to their city (${profile.city}) or persona (${profile.persona}) naturally.
      - Do not preach or shame. Keep the tone practical, encouraging, and supportive.
      - Return a JSON object with properties 'narrative', 'weeklyChallenge', and 'goalTip'.
    `;

    // 3. Request Gemini content
    const response = await callGeminiAPI(apiKey, prompt);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API Error: ${redactSensitiveString(errorText)} (Status ${response.status})`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Invalid response structure from Gemini API");
    }

    // Parse the forced JSON response
    const parsedJSON = JSON.parse(candidateText.trim());

    // Calculate token costs if usageMetadata is present
    const promptTokens = data.usageMetadata?.promptTokenCount ?? 0;
    const candidatesTokens = data.usageMetadata?.candidatesTokenCount ?? 0;
    const costUSD = Number(
      (
        (promptTokens / 1_000_000) * INPUT_COST_PER_MILLION +
        (candidatesTokens / 1_000_000) * OUTPUT_COST_PER_MILLION
      ).toFixed(8)
    );

    return NextResponse.json({
      narrative: parsedJSON.narrative,
      weeklyChallenge: parsedJSON.weeklyChallenge,
      goalTip: parsedJSON.goalTip,
      costUSD,
      isDemo: false
    });
  } catch (err) {
    // Redact error trace before responding
    const safeError = redactError(err);
    console.error("Narrate API Endpoint Failure:", safeError);
    
    // Return a safe degraded state rather than failing client-side
    return NextResponse.json(
      {
        narrative: "Your footprint breakdown is ready. Transport is currently your highest footprint opportunity.",
        weeklyChallenge: "Swap 2 short fuel trips with walking or metro transit this week.",
        goalTip: "Focusing on your largest category yields the highest impact.",
        costUSD: 0,
        error: safeError.message,
        isDemo: true
      },
      { status: 200 } // Return 200 to allow the app to degrade gracefully without throwing UI exceptions
    );
  }
}
