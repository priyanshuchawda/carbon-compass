import { exit } from "node:process";

const baseUrl = (process.env.SMOKE_URL || "http://localhost:3000").replace(/\/+$/, "");

async function runSmokeTests() {
  console.log(`Running smoke checks against ${baseUrl}...`);

  // 1. Check core pages
  try {
    const pages = [
      { path: "/", keyword: "Carbon Compass" },
      { path: "/calculator", keyword: "calculator" },
      { path: "/dashboard", keyword: "Dashboard" },
      { path: "/assistant", keyword: "Assistant" },
      { path: "/log", keyword: "Activity Tracker" },
      { path: "/report", keyword: "report" },
    ];

    for (const page of pages) {
      const response = await fetch(`${baseUrl}${page.path}`);
      if (!response.ok) {
        throw new Error(`${page.path} check failed: status ${response.status}`);
      }
      const html = await response.text();
      if (!html.toLowerCase().includes(page.keyword.toLowerCase())) {
        throw new Error(`${page.path} content check failed: '${page.keyword}' keyword missing`);
      }
    }

    console.log("✅ Core page checks passed.");
  } catch (err) {
    console.error("❌ Core page check failed:", err instanceof Error ? err.message : err);
    exit(1);
  }

  // 2. Check Health Endpoint
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health API check failed: status ${response.status}`);
    }
    const json = await response.json();
    if (json.status !== "ok" || !json.version) {
      throw new Error("Health API contract mismatch");
    }
    console.log(`✅ Health API check passed (version: ${json.version}).`);
  } catch (err) {
    console.error("❌ Health API check failed:", err instanceof Error ? err.message : err);
    exit(1);
  }

  // 3. Check Assistant API Headers and Fallback responses
  try {
    const response = await fetch(`${baseUrl}/api/assistant/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        profile: {
          id: "smoke-user",
          city: "Pune",
          country: "India",
          householdSize: 1,
          persona: "student",
          mainGoal: "reduce_carbon"
        },
        result: {
          monthlyTotalKgCO2e: 158,
          annualTotalKgCO2e: 1896,
          breakdown: [
            { category: "transport", label: "Transport", kgCO2e: 50, percentage: 31.6 },
            { category: "energy", label: "Home energy", kgCO2e: 50, percentage: 31.6 },
            { category: "food", label: "Food", kgCO2e: 58, percentage: 36.8 },
            { category: "shopping", label: "Shopping", kgCO2e: 0, percentage: 0 },
            { category: "waste", label: "Waste", kgCO2e: 0, percentage: 0 }
          ],
          topCategory: "food",
          ecoScore: 70,
          potentialMonthlySavingKgCO2e: 10,
          assumptions: []
        },
        footprint: {
          transport: { twoWheelerKmPerWeek: 0, carKmPerWeek: 0, publicTransportTripsPerWeek: 0, cabAutoTripsPerWeek: 0, flightsPerYear: 0 },
          energy: { monthlyElectricityKWh: 0, lpgCylindersPerMonth: 0, acHoursPerDay: 0, renewableEnergy: false },
          food: { dietType: "vegetarian", meatMealsPerWeek: 0, dairyFrequency: "low", foodDeliveryPerWeek: 0, foodWasteLevel: "low" },
          shopping: { clothesPerMonth: 0, onlineOrdersPerMonth: 0, electronicsPerYear: 0 },
          waste: { recycles: false, composts: false, plasticUsage: "low" }
        },
        messages: [
          { role: "user", content: "Hi" }
        ]
      })
    });

    if (!response.ok && response.status !== 429) {
      throw new Error(`Assistant API failed: status ${response.status}`);
    }

    const reqId = response.headers.get("X-Request-ID");
    const limit = response.headers.get("RateLimit-Limit") || response.headers.get("X-RateLimit-Limit");
    const remaining = response.headers.get("RateLimit-Remaining") || response.headers.get("X-RateLimit-Remaining");

    if (!reqId || !limit || !remaining) {
      throw new Error("Assistant API responses are missing Rate Limit headers or Request ID");
    }

    console.log(`✅ Assistant API check passed.`);
    console.log(`   └─ X-Request-ID: ${reqId}`);
    console.log(`   └─ RateLimit-Limit: ${limit}`);
    console.log(`   └─ RateLimit-Remaining: ${remaining}`);
  } catch (err) {
    console.error("❌ Assistant API headers check failed:", err instanceof Error ? err.message : err);
    exit(1);
  }

  console.log("🎉 All production smoke checks passed successfully!");
}

runSmokeTests();
