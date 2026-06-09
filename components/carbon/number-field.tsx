type NumberFieldProps = {
  label: string;
  name: string;
  hint?: string;
  value: number;
  onChange: (value: string) => void;
  error?: string;
};

function numberValue(value: number | boolean | string): number | string {
  return typeof value === "number" ? value : String(value);
}

export function NumberField({ label, name, hint, value, onChange, error }: NumberFieldProps) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-800">
      {label}
      {hint && <span className="text-xs font-normal text-slate-500">{hint}</span>}
      <input
        type="number"
        name={name}
        id={name}
        autoComplete="off"
        min={0}
        step="any"
        value={numberValue(value)}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-11 rounded-md border px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-emerald-500"
        }`}
      />
      {error && (
        <span className="text-xs font-medium text-red-600" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
