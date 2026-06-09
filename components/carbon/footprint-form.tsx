"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  EnergyFields,
  FoodFields,
  ShoppingFields,
  TransportFields,
  WasteFields,
} from "@/components/carbon/footprint-form-sections";
import {
  EMPTY_FOOTPRINT_INPUT,
  PUNE_STUDENT_DEMO,
  PUNE_STUDENT_PROFILE,
  type NumberPath,
} from "@/components/carbon/footprint-form-data";
import { saveSessionFootprint, saveSessionProfile } from "@/lib/carbon/session";
import type { FootprintInput } from "@/lib/carbon/types";
import { footprintInputSchema } from "@/lib/validation/schemas";

export function FootprintForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [input, setInput] = useState<FootprintInput>(EMPTY_FOOTPRINT_INPUT);

  function updateNumber(path: NumberPath, value: string) {
    const [section, field] = path;
    const num = value === "" ? 0 : Number(value);
    if (isNaN(num)) return;

    setInput((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: num,
      },
    }));
  }

  function handleDemoFill() {
    setInput(PUNE_STUDENT_DEMO);
    const saveResult = saveSessionProfile(PUNE_STUDENT_PROFILE);
    if (!saveResult.ok) {
      setErrors({ form: "Failed to save profile: " + saveResult.reason });
      return;
    }
    setErrors({});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = footprintInputSchema.safeParse(input);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const fieldName = issue.path[issue.path.length - 1] as string;
        nextErrors[fieldName] = issue.message;
      }
      setErrors(nextErrors);

      const firstErrorField = parsed.error.issues[0]?.path[
        parsed.error.issues[0].path.length - 1
      ] as string;
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        document.getElementById(firstErrorField)?.focus();
      }
      return;
    }

    const saveResult = saveSessionFootprint(parsed.data);
    if (!saveResult.ok) {
      setErrors({ form: "Failed to save footprint data: " + saveResult.reason });
      return;
    }

    setErrors({});
    router.push("/dashboard");
  }

  return (
    <form
      className="mt-8 grid gap-6"
      onSubmit={handleSubmit}
      aria-label="Carbon footprint calculator"
    >
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
          onClick={() => {
            setInput(EMPTY_FOOTPRINT_INPUT);
            setErrors({});
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Clear
        </button>
      </div>

      {errors.form && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors.form}
        </p>
      )}

      <TransportFields
        input={input}
        errors={errors}
        updateNumber={updateNumber}
        setInput={setInput}
      />
      <EnergyFields input={input} errors={errors} updateNumber={updateNumber} setInput={setInput} />
      <FoodFields input={input} errors={errors} updateNumber={updateNumber} setInput={setInput} />
      <ShoppingFields
        input={input}
        errors={errors}
        updateNumber={updateNumber}
        setInput={setInput}
      />
      <WasteFields input={input} errors={errors} updateNumber={updateNumber} setInput={setInput} />

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
