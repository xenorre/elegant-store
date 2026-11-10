import type { Metadata } from "next";
import { Suspense } from "react";

import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <main className="section flex-1">
      <div className="container-reading">
        <div className="mb-12 flex flex-col gap-3">
          <p className="eyebrow text-muted">My Account</p>
          <h1 className="text-heading">Your details</h1>
        </div>
        <Suspense fallback={<AccountSkeleton />}>
          <AccountDetails />
        </Suspense>
      </div>
    </main>
  );
}

async function AccountDetails() {
  const user = await requireUser("/account");

  return (
    <div className="flex flex-col gap-16">
      <section aria-labelledby="profile-heading" className="flex flex-col gap-6">
        <h2 id="profile-heading" className="eyebrow">
          Profile
        </h2>
        <dl className="hairline grid grid-cols-1 gap-x-8 gap-y-4 pt-6 sm:grid-cols-[10rem_1fr]">
          <dt className="text-body-sm text-muted">Name</dt>
          <dd className="text-body-lg">{user.name}</dd>
          <dt className="text-body-sm text-muted">Email</dt>
          <dd className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-lg">
            <span className="break-all">{user.email}</span>
            {user.emailVerified && <span className="eyebrow text-success">Verified</span>}
          </dd>
        </dl>
      </section>

      <section aria-labelledby="password-heading" className="flex flex-col gap-6">
        <h2 id="password-heading" className="eyebrow">
          Change password
        </h2>
        <div className="hairline pt-6 sm:max-w-form">
          <ChangePasswordForm />
        </div>
      </section>

      <div className="hairline pt-6">
        <SignOutButton />
      </div>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-6">
      <div className="h-4 w-24 bg-surface" />
      <div className="h-24 w-full bg-surface" />
    </div>
  );
}
