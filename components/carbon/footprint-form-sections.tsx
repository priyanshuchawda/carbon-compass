"use client";

import type { Dispatch, SetStateAction } from "react";
import { CheckboxField, SelectField } from "@/components/carbon/form-controls";
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

const DIET_OPTIONS = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "mixed", label: "Mixed (occasional meat)" },
  { value: "meat_heavy", label: "Meat-heavy (daily meat)" },
] as const;

const DAIRY_OPTIONS = [
  { value: "low", label: "Low (rarely)" },
  { value: "medium", label: "Medium (daily chai / curd)" },
  { value: "high", label: "High (multiple times daily)" },
] as const;

const WASTE_LEVEL_OPTIONS = [
  { value: "low", label: "Low (rarely waste food)" },
  { value: "medium", label: "Medium (some waste weekly)" },
  { value: "high", label: "High (frequent spoilage)" },
] as const;

const PLASTIC_USAGE_OPTIONS = [
  { value: "low", label: "Low (reusable bags, minimal packaging)" },
  { value: "medium", label: "Medium (some single-use plastic)" },
  { value: "high", label: "High (frequent single-use plastic)" },
] as const;

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
        <CheckboxField
          id="renewableEnergy"
          checked={input.energy.renewableEnergy}
          onChange={(checked) =>
            setInput((current) => ({
              ...current,
              energy: {
                ...current.energy,
                renewableEnergy: checked,
              },
            }))
          }
          className="self-end pb-1"
        >
          Using rooftop solar or green tariff
        </CheckboxField>
      </div>
    </fieldset>
  );
}

export function FoodFields({ input, errors, updateNumber, setInput }: SectionProps) {
  return (
    <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <legend className="px-1 text-lg font-semibold text-slate-950">Food</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="dietType"
          label="Diet type"
          value={input.food.dietType}
          options={DIET_OPTIONS}
          onChange={(value) =>
            setInput((current) => ({
              ...current,
              food: {
                ...current.food,
                dietType: parseDietType(value),
              },
            }))
          }
        />

        <NumberField
          label="Meat meals per week"
          name="meatMealsPerWeek"
          hint="Including chicken, fish, mutton, eggs"
          value={input.food.meatMealsPerWeek}
          onChange={(value) => updateNumber(["food", "meatMealsPerWeek"], value)}
          error={errors.meatMealsPerWeek}
        />

        <SelectField
          id="dairyFrequency"
          label="Dairy frequency"
          value={input.food.dairyFrequency}
          options={DAIRY_OPTIONS}
          onChange={(value) =>
            setInput((current) => ({
              ...current,
              food: {
                ...current.food,
                dairyFrequency: parseDairyFrequency(value),
              },
            }))
          }
        />

        <NumberField
          label="Food delivery orders per week"
          name="foodDeliveryPerWeek"
          hint="Swiggy, Zomato, or similar"
          value={input.food.foodDeliveryPerWeek}
          onChange={(value) => updateNumber(["food", "foodDeliveryPerWeek"], value)}
          error={errors.foodDeliveryPerWeek}
        />

        <SelectField
          id="foodWasteLevel"
          label="Food waste level"
          value={input.food.foodWasteLevel}
          options={WASTE_LEVEL_OPTIONS}
          onChange={(value) =>
            setInput((current) => ({
              ...current,
              food: {
                ...current.food,
                foodWasteLevel: parseWasteLevel(value),
              },
            }))
          }
        />
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
      <SelectField
        id="plasticUsage"
        label="Plastic usage level"
        value={input.waste.plasticUsage}
        options={PLASTIC_USAGE_OPTIONS}
        onChange={(value) =>
          setInput((current) => ({
            ...current,
            waste: {
              ...current.waste,
              plasticUsage: parsePlasticUsage(value),
            },
          }))
        }
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <CheckboxField
          id="recycles"
          checked={input.waste.recycles}
          onChange={(checked) =>
            setInput((current) => ({
              ...current,
              waste: { ...current.waste, recycles: checked },
            }))
          }
        >
          Separates and recycles dry waste
        </CheckboxField>
        <CheckboxField
          id="composts"
          checked={input.waste.composts}
          onChange={(checked) =>
            setInput((current) => ({
              ...current,
              waste: { ...current.waste, composts: checked },
            }))
          }
        >
          Composts food scraps
        </CheckboxField>
      </div>
    </fieldset>
  );
}
