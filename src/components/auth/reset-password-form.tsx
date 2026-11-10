"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { FormError } from "@/components/auth/form-status";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Better Auth redirects here with ?error=INVALID_TOKEN for expired or used links.
  if (!token || searchParams.get("error")) {
    return (
      <div className="flex flex-col gap-6">
        <FormError>
          <p>This reset link has expired or has already been used.</p>
        </FormError>
        <Link href="/forgot-password" className="btn btn-primary self-start">
          Request a new link
        </Link>
      </div>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("password"));

    if (newPassword !== form.get("confirmPassword")) {
      setError("The passwords don't match.");
      return;
    }

    setPending(true);
    setError(null);

    const { error } = await authClient.resetPassword({ newPassword, token });

    if (error) {
      setPending(false);
      setError(authErrorMessage(error));
      return;
    }
    router.push("/sign-in?reset=success");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {error && (
        <FormError>
          <p>{error}</p>
        </FormError>
      )}

      <AuthField
        label="New password"
        type="password"
        name="password"
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

      <button type="submit" disabled={pending} className="btn btn-primary btn-block">
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
