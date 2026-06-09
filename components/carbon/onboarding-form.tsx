"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SelectField } from "@/components/carbon/form-controls";
import { saveSessionProfile } from "@/lib/carbon/session";
import { zodIssuesToFieldErrors } from "@/lib/carbon/form-errors";
import { makeClientId } from "@/lib/carbon/ids";
import { userProfileSchema } from "@/lib/validation/schemas";
import type { UserProfile } from "@/lib/carbon/types";

const DEFAULT_PROFILE: Omit<UserProfile, "id"> = {
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "reduce_carbon",
};

const PERSONA_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "working", label: "Working professional" },
  { value: "family", label: "Family" },
] as const;

// Derived from PERSONA_OPTIONS to prevent the two from drifting apart.
const PERSONAS = PERSONA_OPTIONS.map((o) => o.value) as unknown as readonly UserProfile["persona"][];

const MAIN_GOAL_OPTIONS = [
  { value: "reduce_carbon", label: "Reduce my carbon footprint" },
  { value: "save_money", label: "Save money on energy and travel" },
  { value: "learn", label: "Learn about my climate impact" },
  { value: "habit_building", label: "Build sustainable habits" },
] as const;

// Derived from MAIN_GOAL_OPTIONS to prevent the two from drifting apart.
const MAIN_GOALS = MAIN_GOAL_OPTIONS.map((o) => o.value) as unknown as readonly UserProfile["mainGoal"][];

function parseOption<T extends string>(value: string, options: readonly T[], fallback: T): T {
  return options.includes(value as T) ? (value as T) : fallback;
}

export function OnboardingForm() {
  const router = useRouter();
  const [city, setCity] = useState(DEFAULT_PROFILE.city);
  const [country, setCountry] = useState(DEFAULT_PROFILE.country);
  const [householdSize, setHouseholdSize] = useState(String(DEFAULT_PROFILE.householdSize));
  const [persona, setPersona] = useState<UserProfile["persona"]>(DEFAULT_PROFILE.persona);
  const [mainGoal, setMainGoal] = useState<UserProfile["mainGoal"]>(DEFAULT_PROFILE.mainGoal);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = userProfileSchema.safeParse({
      id: makeClientId("user"),
      city: city.trim() || DEFAULT_PROFILE.city,
      country: country.trim() || DEFAULT_PROFILE.country,
      householdSize: Number(householdSize),
      persona,
      mainGoal,
    });

    if (!parsed.success) {
      setErrors(zodIssuesToFieldErrors(parsed.error.issues));
      return;
    }

    const saveResult = saveSessionProfile(parsed.data);
    if (!saveResult.ok) {
      setErrors({ form: saveResult.reason ?? "Unable to save your profile." });
      return;
    }

    setErrors({});
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
          {errors.city && (
            <span className="text-xs font-medium text-red-600" role="alert">
              {errors.city}
            </span>
          )}
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
          {errors.country && (
            <span className="text-xs font-medium text-red-600" role="alert">
              {errors.country}
            </span>
          )}
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
            onChange={(e) => setHouseholdSize(e.target.value)}
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          />
          {errors.householdSize && (
            <span className="text-xs font-medium text-red-600" role="alert">
              {errors.householdSize}
            </span>
          )}
        </label>

        <SelectField
          id="persona"
          label="Persona"
          value={persona}
          options={PERSONA_OPTIONS}
          onChange={(value) => setPersona(parseOption(value, PERSONAS, "student"))}
        />

        <SelectField
          id="mainGoal"
          label="Main goal"
          value={mainGoal}
          options={MAIN_GOAL_OPTIONS}
          onChange={(value) => setMainGoal(parseOption(value, MAIN_GOALS, "reduce_carbon"))}
          className="sm:col-span-2"
        />
      </div>

      <p className="text-sm leading-6 text-slate-600">
        Exact address is not needed. Carbon Compass uses city-level context and approximate
        lifestyle data only. Calculator data stays in this browser unless you open AI assistant
        features, which send summarized context to the server for a response.
      </p>

      {errors.form && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors.form}
        </p>
      )}

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
