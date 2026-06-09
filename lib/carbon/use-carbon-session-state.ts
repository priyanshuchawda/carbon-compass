"use client";

import { useState } from "react";
import { calculateFootprint } from "@/lib/carbon/calculate";
import { getRecommendations } from "@/lib/carbon/recommendations";
import { loadSessionPayload } from "@/lib/carbon/session";
import type {
  FootprintInput,
  FootprintResult,
  Recommendation,
  UserProfile,
} from "@/lib/carbon/types";
import {
  demoFootprintInput,
  demoFootprintResult,
  demoProfile,
  demoRecommendations,
} from "@/lib/carbon/demo";

export type CarbonSessionState = {
  result: FootprintResult;
  recommendations: Recommendation[];
  profile: UserProfile;
  footprintInput: FootprintInput;
  isDemo: boolean;
};

export function useCarbonSessionState(): CarbonSessionState {
  const [state] = useState<CarbonSessionState>(() => {
    const session = loadSessionPayload();
    if (!session) {
      return {
        result: demoFootprintResult,
        recommendations: demoRecommendations,
        profile: demoProfile,
        footprintInput: demoFootprintInput,
        isDemo: true,
      };
    }

    const result = calculateFootprint(session.footprint, session.profile);
    const recommendations = getRecommendations(session.footprint, result, session.profile);
    return {
      result,
      recommendations,
      profile: session.profile,
      footprintInput: session.footprint,
      isDemo: false,
    };
  });

  return state;
}
