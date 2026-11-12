"use client";

import { useId, useRef, useState, useTransition, type ReactNode } from "react";

import type { AdminActionResult } from "@/lib/admin/action-result";

type ConfirmActionProps = {
  /** Button text, e.g. "Archive". */
  label: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  action: () => Promise<AdminActionResult>;
  /** Shown after a successful run, when the page stays where it is. */
  successMessage?: string;
  className?: string;
};

// A button that asks before running a Server Action, in a native <dialog>
// like the menu drawer. Errors and success notes appear next to the button.
export function ConfirmAction({
  label,
  title,
  description,
  confirmLabel,
  action,
  successMessage,
  className = "btn btn-sm btn-secondary",
}: ConfirmActionProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const titleId = useId();

  const confirm = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      dialogRef.current?.close();
      if (!result.ok) setMessage({ ok: false, text: result.error });
      else if (result.message ?? successMessage) {
        setMessage({ ok: true, text: result.message ?? successMessage ?? "" });
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        className={className}
        disabled={pending}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>
      <p
        role="status"
        className={`text-body-sm empty:hidden ${message?.ok ? "text-success" : "text-danger"}`}
      >
        {message?.text}
      </p>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget && !pending) dialogRef.current?.close();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md bg-paper p-8 text-ink backdrop:bg-overlay"
      >
        <div className="flex flex-col gap-6">
          <h2 id={titleId} className="text-title">
            {title}
          </h2>
          <div className="text-body text-muted">{description}</div>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              className="btn btn-sm btn-secondary [--btn-border:var(--line)]"
              disabled={pending}
              onClick={() => dialogRef.current?.close()}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-sm btn-primary" disabled={pending} onClick={confirm}>
              {pending ? "Working…" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
