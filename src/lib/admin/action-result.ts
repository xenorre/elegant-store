// Result of an admin Server Action, matching CartActionResult. Form actions
// also return per-field errors, keyed by the input's name.
export type AdminActionResult = { ok: true; message?: string } | { ok: false; error: string };

export type AdminFormState =
  | { status: "idle" }
  | { status: "saved"; message: string }
  | { status: "error"; error: string; fieldErrors?: Record<string, string> };

export const idleFormState: AdminFormState = { status: "idle" };
