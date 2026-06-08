import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type FactorRecord = {
  id: string;
  label: string;
  value: number;
  unit: string;
  sourceName: string;
  note: string;
};

describe("emission factor source table", () => {
  it("stores updateable source metadata for the India electricity factor", () => {
    const filePath = join(process.cwd(), "data", "emission-factors.json");
    const records = JSON.parse(readFileSync(filePath, "utf8")) as FactorRecord[];
    const indiaElectricity = records.find(
      (record) => record.id === "india-grid-electricity-fy-2024-25",
    );

    expect(indiaElectricity).toMatchObject({
      label: "India grid electricity",
      value: 0.71,
      unit: "kg CO2/kWh",
      sourceName: "Central Electricity Authority baseline database",
    });
    expect(indiaElectricity?.note).toMatch(/educational estimate/i);
  });
});
