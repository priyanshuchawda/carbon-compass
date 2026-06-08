"use client";

import { useState } from "react";
import type { FootprintInput } from "@/lib/carbon/types";

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

const puneStudentDemo: FootprintInput = {
  transport: {
    twoWheelerKmPerWeek: 120,
    carKmPerWeek: 0,
    publicTransportTripsPerWeek: 4,
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
    onlineOrdersPerMonth: 5,
    electronicsPerYear: 1,
  },
  waste: {
    recycles: false,
    composts: false,
    plasticUsage: "medium",
  },
};

type NumberPath =
  | ["transport", keyof FootprintInput["transport"]]
  | ["energy", keyof FootprintInput["energy"]]
  | ["food", keyof FootprintInput["food"]]
  | ["shopping", keyof FootprintInput["shopping"]];

function numberValue(value: number | boolean | string): number | string {
  return typeof value === "number" ? value : String(value);
}

export function FootprintForm() {
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

  return (
    <form className="mt-8 grid gap-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setInput(puneStudentDemo)}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Use Pune student demo data
        </button>
      </div>

      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-lg font-semibold text-slate-950">
          Transport
        </legend>
        <NumberField
          label="Two-wheeler km per week"
          value={input.transport.twoWheelerKmPerWeek}
          onChange={(value) => updateNumber(["transport", "twoWheelerKmPerWeek"], value)}
        />
        <NumberField
          label="Car km per week"
          value={input.transport.carKmPerWeek}
          onChange={(value) => updateNumber(["transport", "carKmPerWeek"], value)}
        />
        <NumberField
          label="Public transport trips per week"
          value={input.transport.publicTransportTripsPerWeek}
          onChange={(value) =>
            updateNumber(["transport", "publicTransportTripsPerWeek"], value)
          }
        />
        <NumberField
          label="Cab or auto trips per week"
          value={input.transport.cabAutoTripsPerWeek}
          onChange={(value) => updateNumber(["transport", "cabAutoTripsPerWeek"], value)}
        />
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-lg font-semibold text-slate-950">
          Home energy
        </legend>
        <NumberField
          label="Monthly electricity kWh"
          value={input.energy.monthlyElectricityKWh}
          onChange={(value) => updateNumber(["energy", "monthlyElectricityKWh"], value)}
        />
        <NumberField
          label="LPG cylinders per month"
          value={input.energy.lpgCylindersPerMonth}
          onChange={(value) => updateNumber(["energy", "lpgCylindersPerMonth"], value)}
        />
        <NumberField
          label="AC hours per day"
          value={input.energy.acHoursPerDay}
          onChange={(value) => updateNumber(["energy", "acHoursPerDay"], value)}
        />
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-lg font-semibold text-slate-950">
          Food
        </legend>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Diet type
          <select
            value={input.food.dietType}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                food: {
                  ...current.food,
                  dietType: event.target.value as FootprintInput["food"]["dietType"],
                },
              }))
            }
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <option value="vegan">Vegan</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="mixed">Mixed</option>
            <option value="meat_heavy">Meat heavy</option>
          </select>
        </label>
        <NumberField
          label="Food delivery per week"
          value={input.food.foodDeliveryPerWeek}
          onChange={(value) => updateNumber(["food", "foodDeliveryPerWeek"], value)}
        />
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-lg font-semibold text-slate-950">
          Shopping
        </legend>
        <NumberField
          label="Clothes bought per month"
          value={input.shopping.clothesPerMonth}
          onChange={(value) => updateNumber(["shopping", "clothesPerMonth"], value)}
        />
        <NumberField
          label="Online orders per month"
          value={input.shopping.onlineOrdersPerMonth}
          onChange={(value) => updateNumber(["shopping", "onlineOrdersPerMonth"], value)}
        />
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-lg font-semibold text-slate-950">
          Waste
        </legend>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={input.waste.recycles}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                waste: { ...current.waste, recycles: event.target.checked },
              }))
            }
            className="size-5 rounded border-slate-300 text-emerald-700"
          />
          Recycles dry waste
        </label>
      </fieldset>
    </form>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: string) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      {label}
      <input
        type="number"
        min={0}
        value={numberValue(value)}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
      />
    </label>
  );
}
