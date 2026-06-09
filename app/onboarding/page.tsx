import { OnboardingForm } from "@/components/carbon/onboarding-form";

export default function OnboardingPage() {
  return (
    <main id="main-content" className="min-h-[70vh] bg-[#f6fbf8]">
      <section className="mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:px-10">
        <p className="mb-4 w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-800">
          Step 1
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Set your Carbon Compass context
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
          Tell Carbon Compass your city, household size, routine, and main goal so later
          recommendations can match an urban Indian student or young professional lifestyle.
        </p>
        <OnboardingForm />
      </section>
    </main>
  );
}
