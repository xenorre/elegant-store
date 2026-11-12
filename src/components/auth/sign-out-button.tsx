"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button type="button" onClick={signOut} disabled={pending} className="btn btn-secondary">
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
