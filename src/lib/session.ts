import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
};

// Reads the request, so callers must render inside <Suspense>. Memoized per
// request so several components can ask without repeating the lookup.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const { id, name, email, emailVerified } = session.user;
  return { id, name, email, emailVerified };
});

// The authoritative check for protected pages; src/proxy.ts only looks for a cookie.
export async function requireUser(redirectTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}
