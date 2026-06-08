"use client";

export function OnboardingForm() {
  return (
    <form className="mt-8 grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          City
          <input
            name="city"
            autoComplete="address-level2"
            defaultValue="Pune"
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Country
          <input
            name="country"
            autoComplete="country-name"
            defaultValue="India"
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Household size
          <input
            name="householdSize"
            type="number"
            autoComplete="off"
            min={1}
            max={20}
            defaultValue={1}
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Persona
          <select
            name="persona"
            autoComplete="off"
            defaultValue="student"
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <option value="student">Student</option>
            <option value="working">Working professional</option>
            <option value="family">Family</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Main transport mode
          <select
            name="mainTransportMode"
            autoComplete="off"
            defaultValue="two-wheeler"
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <option value="two-wheeler">Bike or scooter</option>
            <option value="metro-bus">Metro or bus</option>
            <option value="cab-auto">Cab or auto</option>
            <option value="car">Car</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-800">
          Main goal
          <select
            name="mainGoal"
            autoComplete="off"
            defaultValue="reduce_carbon"
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <option value="reduce_carbon">Reduce carbon</option>
            <option value="save_money">Save money</option>
            <option value="learn">Learn climate impact</option>
            <option value="habit_building">Build habits</option>
          </select>
        </label>
      </div>
      <p className="text-sm leading-6 text-slate-600">
        Exact address is not needed. Carbon Compass uses city-level context and
        approximate lifestyle data only.
      </p>
    </form>
  );
}
