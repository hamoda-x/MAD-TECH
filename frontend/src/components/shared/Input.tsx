import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = "", id, ...props }: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-mad-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-mad-border bg-mad-bg px-4 py-2.5 text-mad-text placeholder:text-mad-muted/60 focus:border-mad-accent focus:outline-none focus:ring-1 focus:ring-mad-accent ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {helperText && !error && <p className="text-xs text-mad-muted">{helperText}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-mad-muted">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-lg border border-mad-border bg-mad-bg px-4 py-2.5 text-mad-text placeholder:text-mad-muted/60 focus:border-mad-accent focus:outline-none focus:ring-1 focus:ring-mad-accent ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  label,
  error,
  options,
  className = "",
  id,
  ...props
}: SelectProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-mad-muted">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full rounded-lg border border-mad-border bg-mad-bg px-4 py-2.5 text-mad-text focus:border-mad-accent focus:outline-none focus:ring-1 focus:ring-mad-accent ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
