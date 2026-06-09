"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveSessionProfile } from "@/lib/carbon/session";
import type { UserProfile } from "@/lib/carbon/types";

const DEFAULT_PROFILE: Omit<UserProfile, "id"> = {
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "reduce_carbon",
};

function generateId(): string {
  return `user-${Date.now().toString(36)}`;
}

export function OnboardingForm() {
  const router = useRouter();
  const [city, setCity] = useState(DEFAULT_PROFILE.city);
  const [country, setCountry] = useState(DEFAULT_PROFILE.country);
  const [householdSize, setHouseholdSize] = useState(DEFAULT_PROFILE.householdSize);
  const [persona, setPersona] = useState<UserProfile["persona"]>(DEFAULT_PROFILE.persona);
  const [mainGoal, setMainGoal] = useState<UserProfile["mainGoal"]>(DEFAULT_PROFILE.mainGoal);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const profile: UserProfile = {
      id: generateId(),
      city: city.trim() || DEFAULT_PROFILE.city,
      country: country.trim() || DEFAULT_PROFILE.country,
      householdSize: Math.max(1, Math.round(householdSize)),
      persona,
      mainGoal,
    };

    saveSessionProfile(profile);
    router.push("/calculator");
  }

  return (
    <form
      className="mt-8 grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={handleSubmit}
      aria-label="Onboarding context form"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          City
          <input
            name="city"
            id="city"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            minLength={1}
            maxLength={80}
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Country
          <input
            name="country"
            id="country"
            autoComplete="country-name"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            minLength={1}
            maxLength={80}
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Household size
          <input
            name="householdSize"
            id="householdSize"
            type="number"
            autoComplete="off"
            min={1}
            max={20}
            value={householdSize}
            onChange={(e) => setHouseholdSize(Number(e.target.value))}
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Persona
          <select
            name="persona"
            id="persona"
            autoComplete="off"
            value={persona}
            onChange={(e) => setPersona(e.target.value as UserProfile["persona"])}
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <option value="student">Student</option>
            <option value="working">Working professional</option>
            <option value="family">Family</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-800 sm:col-span-2">
          Main goal
          <select
            name="mainGoal"
            id="mainGoal"
            autoComplete="off"
            value={mainGoal}
            onChange={(e) => setMainGoal(e.target.value as UserProfile["mainGoal"])}
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <option value="reduce_carbon">Reduce my carbon footprint</option>
            <option value="save_money">Save money on energy and travel</option>
            <option value="learn">Learn about my climate impact</option>
            <option value="habit_building">Build sustainable habits</option>
          </select>
        </label>
      </div>

      <p className="text-sm leading-6 text-slate-600">
        Exact address is not needed. Carbon Compass uses city-level context and
        approximate lifestyle data only. No data is sent to any server.
      </p>

      <div>
        <button
          type="submit"
          id="btn-onboarding-next"
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Continue to calculator →
        </button>
      </div>
    </form>
  );
}
