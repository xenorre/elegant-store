import type { Metadata } from "next";

import { AuthHeading } from "@/components/auth/auth-heading";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeading eyebrow="My Account" title="Forgot your password?">
        Enter your email and we&apos;ll send you a link to choose a new one.
      </AuthHeading>
      <ForgotPasswordForm />
    </>
  );
}
