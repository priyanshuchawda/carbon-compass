import type { ReactNode } from "react";

const inputClassName =
  "min-h-11 rounded-md border border-slate-300 px-3 py-2 text-base text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";

type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type SelectFieldProps<T extends string> = {
  id: string;
  name?: string;
  label: string;
  value: T;
  options: readonly SelectOption<T>[];
  onChange: (value: string) => void;
  className?: string;
  error?: string;
};

export function SelectField<T extends string>({
  id,
  name = id,
  label,
  value,
  options,
  onChange,
  className = "",
  error,
}: SelectFieldProps<T>) {
  return (
    <label className={`grid gap-2 text-sm font-medium text-slate-800 ${className}`}>
      {label}
      <select
        name={name}
        id={id}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs font-medium text-red-600" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

type CheckboxFieldProps = {
  id: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
};

export function CheckboxField({
  id,
  name = id,
  checked,
  onChange,
  children,
  className = "",
}: CheckboxFieldProps) {
  return (
    <label className={`flex items-center gap-3 text-sm font-medium text-slate-800 ${className}`}>
      <input
        type="checkbox"
        name={name}
        id={id}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 rounded border-slate-300 text-emerald-700"
      />
      {children}
    </label>
  );
}
