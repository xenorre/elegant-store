"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { FormError } from "@/components/auth/form-status";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email"));

    setPending(true);
    setError(null);

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    setSentTo(email);
  };

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col gap-6">
        <p className="text-body-lg">
          If an account exists for <strong className="font-medium">{sentTo}</strong>, you&apos;ll
          receive a link to reset your password shortly.
        </p>
        <Link href="/sign-in" className="btn btn-secondary self-start">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {error && (
        <FormError>
          <p>{error}</p>
        </FormError>
      )}

      <AuthField label="Email" type="email" name="email" autoComplete="email" required />

      <button type="submit" disabled={pending} className="btn btn-primary btn-block">
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <Link href="/sign-in" className="text-body link-muted self-start">
        Back to sign in
      </Link>
    </form>
  );
}
