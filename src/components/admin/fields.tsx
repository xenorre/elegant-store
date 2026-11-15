import type { ComponentProps, ReactNode } from "react";

// Labelled form controls for admin forms. Like AuthField, plus an error message
// that marks the control invalid and is announced with it.

type FieldShellProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: (describedBy: string | undefined) => ReactNode;
};

function FieldShell({ id, label, hint, error, children }: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="eyebrow text-muted">
        {label}
      </label>
      {children(describedBy)}
      {hint && (
        <p id={hintId} className="text-body-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-body-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

type Common = { label: string; hint?: ReactNode; error?: string };

export function Field({ label, hint, error, id, name, ...props }: ComponentProps<"input"> & Common) {
  const inputId = id ?? name ?? label;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error}>
      {(describedBy) => (
        <input
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="field"
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  id,
  name,
  rows = 4,
  ...props
}: ComponentProps<"textarea"> & Common) {
  const inputId = id ?? name ?? label;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error}>
      {(describedBy) => (
        <textarea
          id={inputId}
          name={name}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="field resize-y"
          {...props}
        />
      )}
    </FieldShell>
  );
}

export const selectClass =
  "h-11 border border-line bg-paper px-2 text-body-sm text-ink hover:border-ink focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ink disabled:text-subtle aria-invalid:border-danger";

export function Select({
  label,
  hint,
  error,
  id,
  name,
  children,
  ...props
}: ComponentProps<"select"> & Common) {
  const inputId = id ?? name ?? label;
  return (
    <FieldShell id={inputId} label={label} hint={hint} error={error}>
      {(describedBy) => (
        <select
          id={inputId}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={selectClass}
          {...props}
        >
          {children}
        </select>
      )}
    </FieldShell>
  );
}
