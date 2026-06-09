"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  saveSessionFootprint,
  saveSessionProfile,
} from "@/lib/carbon/session";
import type { FootprintInput, UserProfile } from "@/lib/carbon/types";

// ── default empty state ───────────────────────────────────────────────────────

const emptyInput: FootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 0,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 0,
    cabAutoTripsPerWeek: 0,
    flightsPerYear: 0,
  },
  energy: {
    monthlyElectricityKWh: 0,
    lpgCylindersPerMonth: 0,
    acHoursPerDay: 0,
    renewableEnergy: false,
  },
  food: {
    dietType: "vegetarian",
    meatMealsPerWeek: 0,
    dairyFrequency: "low",
    foodDeliveryPerWeek: 0,
    foodWasteLevel: "low",
  },
  shopping: {
    clothesPerMonth: 0,
    onlineOrdersPerMonth: 0,
    electronicsPerYear: 0,
  },
  waste: {
    recycles: false,
    composts: false,
    plasticUsage: "low",
  },
};

// ── Pune student demo fill ────────────────────────────────────────────────────

const puneStudentDemo: FootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 120,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 4,
    cabAutoTripsPerWeek: 3,
    flightsPerYear: 1,
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
    onlineOrdersPerMonth: 5,
    electronicsPerYear: 1,
  },
  waste: {
    recycles: false,
    composts: false,
    plasticUsage: "medium",
  },
};

const puneStudentProfile: UserProfile = {
  id: "demo-pune-student",
  city: "Pune",
  country: "India",
  householdSize: 1,
  persona: "student",
  mainGoal: "save_money",
};

// ── type helpers ─────────────────────────────────────────────────────────────

type NumberPath =
  | ["transport", keyof FootprintInput["transport"]]
  | ["energy", keyof FootprintInput["energy"]]
  | ["food", keyof FootprintInput["food"]]
  | ["shopping", keyof FootprintInput["shopping"]];

function numberValue(value: number | boolean | string): number | string {
  return typeof value === "number" ? value : String(value);
}

// ── component ─────────────────────────────────────────────────────────────────

export function FootprintForm() {
  const router = useRouter();
  const [input, setInput] = useState<FootprintInput>(emptyInput);

  function updateNumber(path: NumberPath, value: string) {
    const parsed = Number(value);
    const nextValue = Number.isFinite(parsed) ? parsed : 0;

    setInput((current) => ({
      ...current,
      [path[0]]: {
        ...current[path[0]],
        [path[1]]: nextValue,
      },
    }));
  }

  function handleDemoFill() {
    setInput(puneStudentDemo);
    saveSessionProfile(puneStudentProfile);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Persist user input so dashboard/actions/report can use it.
    saveSessionFootprint(input);
    router.push("/dashboard");
  }

  return (
    <form
      className="mt-8 grid gap-6"
      onSubmit={handleSubmit}
      aria-label="Carbon footprint calculator"
    >
      {/* ── demo fill ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          id="btn-demo-fill"
          onClick={handleDemoFill}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Use Pune student demo data
        </button>
        <button
          type="button"
          id="btn-clear-form"
          onClick={() => setInput(emptyInput)}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Clear
        </button>
      </div>

      {/* ── transport ─────────────────────────────────────────────────── */}
      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-lg font-semibold text-slate-950">
          Transport
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Two-wheeler km per week"
            name="twoWheelerKmPerWeek"
            hint="Bike or scooter daily commute"
            value={input.transport.twoWheelerKmPerWeek}
            onChange={(value) =>
              updateNumber(["transport", "twoWheelerKmPerWeek"], value)
            }
          />
          <NumberField
            label="Car km per week"
            name="carKmPerWeek"
            hint="Personal car travel"
            value={input.transport.carKmPerWeek}
            onChange={(value) =>
              updateNumber(["transport", "carKmPerWeek"], value)
            }
          />
          <NumberField
            label="Public transport trips per week"
            name="publicTransportTripsPerWeek"
            hint="Metro, bus, local train"
            value={input.transport.publicTransportTripsPerWeek}
            onChange={(value) =>
              updateNumber(["transport", "publicTransportTripsPerWeek"], value)
            }
          />
          <NumberField
            label="Cab or auto trips per week"
            name="cabAutoTripsPerWeek"
            hint="Ola, Uber, auto-rickshaw"
            value={input.transport.cabAutoTripsPerWeek}
            onChange={(value) =>
              updateNumber(["transport", "cabAutoTripsPerWeek"], value)
            }
          />
          <NumberField
            label="Domestic flights per year"
            name="flightsPerYear"
            hint="One-way flights"
            value={input.transport.flightsPerYear}
            onChange={(value) =>
              updateNumber(["transport", "flightsPerYear"], value)
            }
          />
        </div>
      </fieldset>

      {/* ── home energy ───────────────────────────────────────────────── */}
      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-lg font-semibold text-slate-950">
          Home energy
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Monthly electricity (kWh)"
            name="monthlyElectricityKWh"
            hint="Check your electricity bill"
            value={input.energy.monthlyElectricityKWh}
            onChange={(value) =>
              updateNumber(["energy", "monthlyElectricityKWh"], value)
            }
          />
          <NumberField
            label="LPG cylinders per month"
            name="lpgCylindersPerMonth"
            hint="Cooking gas usage"
            value={input.energy.lpgCylindersPerMonth}
            onChange={(value) =>
              updateNumber(["energy", "lpgCylindersPerMonth"], value)
            }
          />
          <NumberField
            label="AC hours per day"
            name="acHoursPerDay"
            hint="Average daily air conditioning use"
            value={input.energy.acHoursPerDay}
            onChange={(value) =>
              updateNumber(["energy", "acHoursPerDay"], value)
            }
          />
          <label className="flex items-center gap-3 self-end pb-1 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              name="renewableEnergy"
              id="renewableEnergy"
              checked={input.energy.renewableEnergy}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  energy: {
                    ...current.energy,
                    renewableEnergy: event.target.checked,
                  },
                }))
              }
              className="size-5 rounded border-slate-300 text-emerald-700"
            />
            Using rooftop solar or green tariff
          </label>
        </div>
      </fieldset>

      {/* ── food ──────────────────────────────────────────────────────── */}
      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-lg font-semibold text-slate-950">
          Food
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-800">
            Diet type
            <select
              name="dietType"
              id="dietType"
              autoComplete="off"
              value={input.food.dietType}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  food: {
                    ...current.food,
                    dietType: event.target
                      .value as FootprintInput["food"]["dietType"],
                  },
                }))
              }
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <option value="vegan">Vegan</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="mixed">Mixed (occasional meat)</option>
              <option value="meat_heavy">Meat-heavy (daily meat)</option>
            </select>
          </label>

          <NumberField
            label="Meat meals per week"
            name="meatMealsPerWeek"
            hint="Including chicken, fish, mutton, eggs"
            value={input.food.meatMealsPerWeek}
            onChange={(value) =>
              updateNumber(["food", "meatMealsPerWeek"], value)
            }
          />

          <label className="grid gap-2 text-sm font-medium text-slate-800">
            Dairy frequency
            <select
              name="dairyFrequency"
              id="dairyFrequency"
              autoComplete="off"
              value={input.food.dairyFrequency}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  food: {
                    ...current.food,
                    dairyFrequency: event.target
                      .value as FootprintInput["food"]["dairyFrequency"],
                  },
                }))
              }
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <option value="low">Low (rarely)</option>
              <option value="medium">Medium (daily chai / curd)</option>
              <option value="high">High (multiple times daily)</option>
            </select>
          </label>

          <NumberField
            label="Food delivery orders per week"
            name="foodDeliveryPerWeek"
            hint="Swiggy, Zomato, or similar"
            value={input.food.foodDeliveryPerWeek}
            onChange={(value) =>
              updateNumber(["food", "foodDeliveryPerWeek"], value)
            }
          />

          <label className="grid gap-2 text-sm font-medium text-slate-800">
            Food waste level
            <select
              name="foodWasteLevel"
              id="foodWasteLevel"
              autoComplete="off"
              value={input.food.foodWasteLevel}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  food: {
                    ...current.food,
                    foodWasteLevel: event.target
                      .value as FootprintInput["food"]["foodWasteLevel"],
                  },
                }))
              }
              className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <option value="low">Low (rarely waste food)</option>
              <option value="medium">Medium (some waste weekly)</option>
              <option value="high">High (frequent spoilage)</option>
            </select>
          </label>
        </div>
      </fieldset>

      {/* ── shopping ──────────────────────────────────────────────────── */}
      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-lg font-semibold text-slate-950">
          Shopping
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Clothes bought per month"
            name="clothesPerMonth"
            hint="New garments, shoes, accessories"
            value={input.shopping.clothesPerMonth}
            onChange={(value) =>
              updateNumber(["shopping", "clothesPerMonth"], value)
            }
          />
          <NumberField
            label="Online orders per month"
            name="onlineOrdersPerMonth"
            hint="Amazon, Flipkart, Meesho, etc."
            value={input.shopping.onlineOrdersPerMonth}
            onChange={(value) =>
              updateNumber(["shopping", "onlineOrdersPerMonth"], value)
            }
          />
          <NumberField
            label="Electronics per year"
            name="electronicsPerYear"
            hint="Phones, laptops, appliances"
            value={input.shopping.electronicsPerYear}
            onChange={(value) =>
              updateNumber(["shopping", "electronicsPerYear"], value)
            }
          />
        </div>
      </fieldset>

      {/* ── waste ─────────────────────────────────────────────────────── */}
      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-lg font-semibold text-slate-950">
          Waste habits
        </legend>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Plastic usage level
          <select
            name="plasticUsage"
            id="plasticUsage"
            autoComplete="off"
            value={input.waste.plasticUsage}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                waste: {
                  ...current.waste,
                  plasticUsage: event.target
                    .value as FootprintInput["waste"]["plasticUsage"],
                },
              }))
            }
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <option value="low">Low (reusable bags, minimal packaging)</option>
            <option value="medium">Medium (some single-use plastic)</option>
            <option value="high">High (frequent single-use plastic)</option>
          </select>
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              name="recycles"
              id="recycles"
              checked={input.waste.recycles}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  waste: { ...current.waste, recycles: event.target.checked },
                }))
              }
              className="size-5 rounded border-slate-300 text-emerald-700"
            />
            Separates and recycles dry waste
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              name="composts"
              id="composts"
              checked={input.waste.composts}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  waste: { ...current.waste, composts: event.target.checked },
                }))
              }
              className="size-5 rounded border-slate-300 text-emerald-700"
            />
            Composts food scraps
          </label>
        </div>
      </fieldset>

      {/* ── submit ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          id="btn-calculate"
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Calculate and view dashboard
        </button>
      </div>
    </form>
  );
}

// ── sub-component ─────────────────────────────────────────────────────────────

type NumberFieldProps = {
  label: string;
  name: string;
  hint?: string;
  value: number;
  onChange: (value: string) => void;
};

function NumberField({ label, name, hint, value, onChange }: NumberFieldProps) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-800">
      {label}
      {hint && (
        <span className="text-xs font-normal text-slate-500">{hint}</span>
      )}
      <input
        type="number"
        name={name}
        id={name}
        autoComplete="off"
        min={0}
        step="any"
        value={numberValue(value)}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      />
    </label>
  );
}
