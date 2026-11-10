"use client";

import { useState, type FormEvent } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { FormError, FormNotice } from "@/components/auth/form-status";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

export function ChangePasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const newPassword = String(form.get("newPassword"));

    setSaved(false);
    if (newPassword !== form.get("confirmPassword")) {
      setError("The new passwords don't match.");
      return;
    }

    setPending(true);
    setError(null);

    const { error } = await authClient.changePassword({
      currentPassword: String(form.get("currentPassword")),
      newPassword,
      // Sign out every other device; this one gets a fresh session.
      revokeOtherSessions: true,
    });

    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    formElement.reset();
    setSaved(true);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {error && (
        <FormError>
          <p>{error}</p>
        </FormError>
      )}
      {saved && (
        <FormNotice>Your password has been changed. Other devices have been signed out.</FormNotice>
      )}

      <AuthField
        label="Current password"
        type="password"
        name="currentPassword"
        autoComplete="current-password"
        required
      />
      <AuthField
        label="New password"
        type="password"
        name="newPassword"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        hint="At least 8 characters."
        required
      />
      <AuthField
        label="Confirm new password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        required
      />

      <button type="submit" disabled={pending} className="btn btn-secondary self-start">
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
