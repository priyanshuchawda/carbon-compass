import { demoFootprintResult } from "@/lib/carbon/demo";
import type { ProgressEntry } from "@/lib/carbon/progress";

export const demoProgressHistory: ProgressEntry[] = [
  {
    id: "demo-progress-1",
    recordedAt: "2026-05-25T09:00:00.000Z",
    monthlyTotalKgCO2e: demoFootprintResult.monthlyTotalKgCO2e + 42,
    ecoScore: Math.max(demoFootprintResult.ecoScore - 8, 0),
    topCategory: "transport",
  },
  {
    id: "demo-progress-2",
    recordedAt: "2026-06-01T09:00:00.000Z",
    monthlyTotalKgCO2e: demoFootprintResult.monthlyTotalKgCO2e + 18,
    ecoScore: Math.max(demoFootprintResult.ecoScore - 3, 0),
    topCategory: "transport",
  },
  {
    id: "demo-progress-3",
    recordedAt: "2026-06-08T09:00:00.000Z",
    monthlyTotalKgCO2e: demoFootprintResult.monthlyTotalKgCO2e,
    ecoScore: demoFootprintResult.ecoScore,
    topCategory: demoFootprintResult.topCategory,
  },
];
