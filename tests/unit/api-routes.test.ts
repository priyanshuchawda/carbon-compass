import { describe, expect, it } from "vitest";
import { POST as calculatePost } from "@/app/api/calculate/route";
import { POST as recommendationsPost } from "@/app/api/recommendations/route";
import { GET as healthGet } from "@/app/api/health/route";

const profile = {
  id: "api-demo",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "reduce_carbon",
};

const footprint = {
  transport: {
    twoWheelerKmPerWeek: 120,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 2,
    cabAutoTripsPerWeek: 3,
    flightsPerYear: 0,
  },
  energy: {
    monthlyElectricityKWh: 100,
    lpgCylindersPerMonth: 0.5,
    acHoursPerDay: 2,
    renewableEnergy: false,
  },
  food: {
    dietType: "mixed",
    meatMealsPerWeek: 2,
    dairyFrequency: "medium",
    foodDeliveryPerWeek: 3,
    foodWasteLevel: "medium",
  },
  shopping: {
    clothesPerMonth: 2,
    onlineOrdersPerMonth: 4,
    electronicsPerYear: 1,
  },
  waste: {
    recycles: false,
    composts: false,
    plasticUsage: "medium",
  },
};

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("carbon API route handlers", () => {
  it("calculates a server-safe footprint for valid input", async () => {
    const response = await calculatePost(jsonRequest({ profile, footprint }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.monthlyTotalKgCO2e).toBeGreaterThan(0);
    expect(body.result.topCategory).toBeTruthy();
  });

  it("rejects invalid calculation input", async () => {
    const response = await calculatePost(
      jsonRequest({
        profile,
        footprint: {
          ...footprint,
          transport: { ...footprint.transport, twoWheelerKmPerWeek: -5 },
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/invalid input/i);
  });

  it("returns ranked recommendations for valid input", async () => {
    const response = await recommendationsPost(
      jsonRequest({ profile, footprint }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.monthlyTotalKgCO2e).toBeGreaterThan(0);
    expect(body.recommendations.length).toBeGreaterThanOrEqual(3);
  });

  it("returns status ok from the health API", async () => {
    const response = await healthGet();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.version).toBe("0.1.0");
    expect(body.timestamp).toBeDefined();
  });
});
