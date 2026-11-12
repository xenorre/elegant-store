"use client";

import { startTransition, useActionState, useEffect, useRef, type FormEvent } from "react";

import { idleFormState, type AdminFormState } from "@/lib/admin/action-result";

type FormAction = (previous: AdminFormState, form: FormData) => Promise<AdminFormState>;

// useActionState, submitted from onSubmit like the auth forms. Passing the
// action to <form action> would reset every field after each submit, losing
// the admin's input when validation fails. `resetOnSave` clears the form only
// after a successful save, for forms that add things.
export function useFormAction(action: FormAction, options: { resetOnSave?: boolean } = {}) {
  const [state, dispatch, pending] = useActionState(action, idleFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const { resetOnSave } = options;

  useEffect(() => {
    if (resetOnSave && state.status === "saved") formRef.current?.reset();
  }, [resetOnSave, state]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  };

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  return { state, errors, pending, onSubmit, formRef };
}
