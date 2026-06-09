"use client";

import type { Dispatch, SetStateAction } from "react";
import { NumberField } from "@/components/carbon/number-field";
import {
  parseDairyFrequency,
  parseDietType,
  parsePlasticUsage,
  parseWasteLevel,
  type NumberPath,
} from "@/components/carbon/footprint-form-data";
import type { FootprintInput } from "@/lib/carbon/types";

type FormErrors = Record<string, string>;
type UpdateNumber = (path: NumberPath, value: string) => void;
type SetFootprintInput = Dispatch<SetStateAction<FootprintInput>>;

type SectionProps = {
  input: FootprintInput;
  errors: FormErrors;
  updateNumber: UpdateNumber;
  setInput: SetFootprintInput;
};

export function TransportFields({ input, errors, updateNumber }: SectionProps) {
  return (
    <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <legend className="px-1 text-lg font-semibold text-slate-950">Transport</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Two-wheeler km per week"
          name="twoWheelerKmPerWeek"
          hint="Bike or scooter daily commute"
          value={input.transport.twoWheelerKmPerWeek}
          onChange={(value) => updateNumber(["transport", "twoWheelerKmPerWeek"], value)}
          error={errors.twoWheelerKmPerWeek}
        />
        <NumberField
          label="Car km per week"
          name="carKmPerWeek"
          hint="Personal car travel"
          value={input.transport.carKmPerWeek}
          onChange={(value) => updateNumber(["transport", "carKmPerWeek"], value)}
          error={errors.carKmPerWeek}
        />
        <NumberField
          label="Public transport trips per week"
          name="publicTransportTripsPerWeek"
          hint="Metro, bus, local train"
          value={input.transport.publicTransportTripsPerWeek}
          onChange={(value) => updateNumber(["transport", "publicTransportTripsPerWeek"], value)}
          error={errors.publicTransportTripsPerWeek}
        />
        <NumberField
          label="Cab or auto trips per week"
          name="cabAutoTripsPerWeek"
          hint="Ola, Uber, auto-rickshaw"
          value={input.transport.cabAutoTripsPerWeek}
          onChange={(value) => updateNumber(["transport", "cabAutoTripsPerWeek"], value)}
          error={errors.cabAutoTripsPerWeek}
        />
        <NumberField
          label="Domestic flights per year"
          name="flightsPerYear"
          hint="One-way flights"
          value={input.transport.flightsPerYear}
          onChange={(value) => updateNumber(["transport", "flightsPerYear"], value)}
          error={errors.flightsPerYear}
        />
      </div>
    </fieldset>
  );
}

export function EnergyFields({ input, errors, updateNumber, setInput }: SectionProps) {
  return (
    <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <legend className="px-1 text-lg font-semibold text-slate-950">Home energy</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Monthly electricity (kWh)"
          name="monthlyElectricityKWh"
          hint="Check your electricity bill"
          value={input.energy.monthlyElectricityKWh}
          onChange={(value) => updateNumber(["energy", "monthlyElectricityKWh"], value)}
          error={errors.monthlyElectricityKWh}
        />
        <NumberField
          label="LPG cylinders per month"
          name="lpgCylindersPerMonth"
          hint="Cooking gas usage"
          value={input.energy.lpgCylindersPerMonth}
          onChange={(value) => updateNumber(["energy", "lpgCylindersPerMonth"], value)}
          error={errors.lpgCylindersPerMonth}
        />
        <NumberField
          label="AC hours per day"
          name="acHoursPerDay"
          hint="Average daily air conditioning use"
          value={input.energy.acHoursPerDay}
          onChange={(value) => updateNumber(["energy", "acHoursPerDay"], value)}
          error={errors.acHoursPerDay}
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
  );
}

export function FoodFields({ input, errors, updateNumber, setInput }: SectionProps) {
  return (
    <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <legend className="px-1 text-lg font-semibold text-slate-950">Food</legend>
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
                  dietType: parseDietType(event.target.value),
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
          onChange={(value) => updateNumber(["food", "meatMealsPerWeek"], value)}
          error={errors.meatMealsPerWeek}
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
                  dairyFrequency: parseDairyFrequency(event.target.value),
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
          onChange={(value) => updateNumber(["food", "foodDeliveryPerWeek"], value)}
          error={errors.foodDeliveryPerWeek}
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
                  foodWasteLevel: parseWasteLevel(event.target.value),
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
  );
}

export function ShoppingFields({ input, errors, updateNumber }: SectionProps) {
  return (
    <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <legend className="px-1 text-lg font-semibold text-slate-950">Shopping</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Clothes bought per month"
          name="clothesPerMonth"
          hint="New garments, shoes, accessories"
          value={input.shopping.clothesPerMonth}
          onChange={(value) => updateNumber(["shopping", "clothesPerMonth"], value)}
          error={errors.clothesPerMonth}
        />
        <NumberField
          label="Online orders per month"
          name="onlineOrdersPerMonth"
          hint="Amazon, Flipkart, Meesho, etc."
          value={input.shopping.onlineOrdersPerMonth}
          onChange={(value) => updateNumber(["shopping", "onlineOrdersPerMonth"], value)}
          error={errors.onlineOrdersPerMonth}
        />
        <NumberField
          label="Electronics per year"
          name="electronicsPerYear"
          hint="Phones, laptops, appliances"
          value={input.shopping.electronicsPerYear}
          onChange={(value) => updateNumber(["shopping", "electronicsPerYear"], value)}
          error={errors.electronicsPerYear}
        />
      </div>
    </fieldset>
  );
}

export function WasteFields({ input, setInput }: SectionProps) {
  return (
    <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <legend className="px-1 text-lg font-semibold text-slate-950">Waste habits</legend>
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
                plasticUsage: parsePlasticUsage(event.target.value),
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
  );
}
