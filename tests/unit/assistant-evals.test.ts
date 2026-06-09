import { describe, expect, it } from "vitest";
import { getFallbackChatResponse } from "../../lib/carbon/ai/prompt";

describe("Assistant Evals - Behaviour Baseline & Safety Refusals", () => {
  it("refuses to answer medical, legal or financial queries", () => {
    const medicalQuery = "Give me some medical advice for my asthma";
    const legalQuery = "What are the legal implications of carbon taxing?";
    const doctorQuery = "Who is the best doctor in Mumbai?";
    
    expect(getFallbackChatResponse(medicalQuery)).toContain("cannot provide medical, legal, or professional advice");
    expect(getFallbackChatResponse(legalQuery)).toContain("cannot provide medical, legal, or professional advice");
    expect(getFallbackChatResponse(doctorQuery)).toContain("cannot provide medical, legal, or professional advice");
  });

  it("handles greeting queries politely", () => {
    expect(getFallbackChatResponse("Hello there")).toContain("Hello! I am your Carbon Compass assistant");
    expect(getFallbackChatResponse("Hi")).toContain("Hello! I am your Carbon Compass assistant");
  });

  it("identifies top drivers of emissions correctly", () => {
    const biggestSource = "what is my biggest source?";
    const drivingQuery = "What is driving my emissions the most?";
    
    expect(getFallbackChatResponse(biggestSource)).toContain("detailed breakdown on the Dashboard");
    expect(getFallbackChatResponse(drivingQuery)).toContain("detailed breakdown on the Dashboard");
  });

  it("suggests reduction actions for transport and energy", () => {
    const reduceQuery = "how to reduce transport emissions?";
    expect(getFallbackChatResponse(reduceQuery)).toContain("reducing private vehicle trips");
  });

  it("answers comparison average questions using the 158 kg CO2e benchmark", () => {
    const compareQuery = "how does it compare to the average?";
    expect(getFallbackChatResponse(compareQuery)).toContain("average Indian citizen's carbon footprint");
    expect(getFallbackChatResponse(compareQuery)).toContain("158 kg CO2e");
  });

  it("returns standard redirection for unrelated/general topics", () => {
    const randomQuery = "what is the capital of France?";
    expect(getFallbackChatResponse(randomQuery)).toContain("I am here to help you understand your carbon footprint");
  });
});
