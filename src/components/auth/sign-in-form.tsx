"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthField } from "@/components/auth/auth-field";
import { FormError, FormNotice } from "@/components/auth/form-status";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { safeRedirect } from "@/lib/auth-redirect";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirectTo"));

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "invalid_token"
      ? "That confirmation link has expired. Sign in to receive a new one."
      : null,
  );
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const passwordReset = searchParams.get("reset") === "success";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));

    setPending(true);
    setError(null);
    setUnverifiedEmail(null);
    setResent(false);

    const { error } = await authClient.signIn.email({
      email,
      password: String(form.get("password")),
      callbackURL: redirectTo,
    });

    if (error) {
      setPending(false);
      setError(authErrorMessage(error));
      if (error.code === "EMAIL_NOT_VERIFIED") setUnverifiedEmail(email);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const resendVerification = async () => {
    if (!unverifiedEmail) return;
    setPending(true);
    const { error } = await authClient.sendVerificationEmail({
      email: unverifiedEmail,
      callbackURL: redirectTo,
    });
    setPending(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    setResent(true);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      {passwordReset && !error && (
        <FormNotice>Your password has been changed. Sign in with your new password.</FormNotice>
      )}
      {error && (
        <FormError>
          <p>{error}</p>
          {unverifiedEmail && !resent && (
            <p className="mt-2">
              Didn&apos;t get the email?{" "}
              <button
                type="button"
                onClick={resendVerification}
                disabled={pending}
                className="link cursor-pointer disabled:cursor-not-allowed"
              >
                Send a new confirmation link
              </button>
            </p>
          )}
          {resent && <p className="mt-2">Sent. Please check your inbox.</p>}
        </FormError>
      )}

      <AuthField
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        required
      />
      <div className="flex flex-col gap-3">
        <AuthField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
        <Link href="/forgot-password" className="self-end text-body-sm link-muted">
          Forgot your password?
        </Link>
      </div>

      <button type="submit" disabled={pending} className="btn btn-primary btn-block">
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-body text-muted">
        New to Elegant?{" "}
        <Link
          href={redirectTo === "/account" ? "/sign-up" : `/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="link text-ink"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
