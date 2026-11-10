import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthHeading } from "@/components/auth/auth-heading";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <>
      <AuthHeading eyebrow="My Account" title="Sign in">
        Sign in to manage your account and orders.
      </AuthHeading>
      <Suspense>
        <SignInForm />
      </Suspense>
    </>
  );
}
