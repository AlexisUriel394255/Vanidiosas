import type { ChangeEvent } from "react";

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  error?: string;
  autoComplete?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

// Reusable field: label + input + error message
export default function Field({
  id,
  label,
  type = "text",
  value,
  error,
  autoComplete,
  onChange,
}: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs uppercase tracking-[0.2em]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : undefined}
        className={`w-full border bg-white px-4 py-3 text-base outline-none transition-colors focus:border-ink ${
          error ? "border-red-600" : "border-[#EADFC9]"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-[13px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}