"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { FormError } from "@/components/auth/form-status";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { safeRedirect } from "@/lib/auth-redirect";

export function SignUpForm() {
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirectTo"));

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    if (password !== form.get("confirmPassword")) {
      setError("The passwords don't match.");
      return;
    }

    setPending(true);
    setError(null);

    const { error } = await authClient.signUp.email({
      name: String(form.get("name")).trim(),
      email,
      password,
      // Where the confirmation link lands once the email is verified.
      callbackURL: redirectTo,
    });

    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    // Shown for new and existing emails alike, so it never reveals an account.
    setSentTo(email);
  };

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col gap-6">
        <p className="text-body-lg">
          We&apos;ve sent a confirmation link to <strong className="font-medium">{sentTo}</strong>.
          Open it to finish creating your account.
        </p>
        <p className="text-body text-muted">
          Can&apos;t find it? Check your spam folder, or{" "}
          <Link href="/sign-in" className="link text-ink">
            sign in
          </Link>{" "}
          to receive a new link.
        </p>
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

      <AuthField label="Full name" name="name" autoComplete="name" required />
      <AuthField label="Email" type="email" name="email" autoComplete="email" required />
      <AuthField
        label="Password"
        type="password"
        name="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        hint="At least 8 characters."
        required
      />
      <AuthField
        label="Confirm password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        required
      />

      <button type="submit" disabled={pending} className="btn btn-primary btn-block">
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-body text-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="link text-ink">
          Sign in
        </Link>
      </p>
    </form>
  );
}
