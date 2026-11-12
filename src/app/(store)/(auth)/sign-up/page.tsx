import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthHeading } from "@/components/auth/auth-heading";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignUpPage() {
  return (
    <>
      <AuthHeading eyebrow="My Account" title="Create an account">
        Save your details for a faster checkout and keep track of your orders.
      </AuthHeading>
      <Suspense>
        <SignUpForm />
      </Suspense>
    </>
  );
}
