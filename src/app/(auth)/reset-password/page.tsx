import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthHeading } from "@/components/auth/auth-heading";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
};

export default function ResetPasswordPage() {
  return (
    <>
      <AuthHeading eyebrow="My Account" title="Choose a new password">
        You&apos;ll be signed out on every device once it&apos;s changed.
      </AuthHeading>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
