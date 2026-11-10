import type { ComponentProps } from "react";

type AuthFieldProps = ComponentProps<"input"> & {
  label: string;
  hint?: string;
};

export function AuthField({ label, hint, id, name, ...props }: AuthFieldProps) {
  const inputId = id ?? name;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="eyebrow text-muted">
        {label}
      </label>
      <input id={inputId} name={name} aria-describedby={hintId} className="field" {...props} />
      {hint && (
        <p id={hintId} className="text-body-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
