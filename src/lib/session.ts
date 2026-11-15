import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
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

// Skips the session cookie cache, so a revoked role or session takes effect on
// the next request rather than up to five minutes later. That makes it a
// database query, which connection() keeps out of the per-session App Shell
// prerender, where uncached I/O is aborted when the prerender ends.
const getAdminSession = cache(async () => {
  await connection();
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session) return { user: null, isAdmin: false };

  const { id, name, email, emailVerified, role } = session.user;
  return {
    user: { id, name, email, emailVerified } satisfies CurrentUser,
    isAdmin: role === "admin" && emailVerified,
  };
});

// For admin pages. Renders a 404 for signed-in non-admins so the area isn't
// advertised. Call inside <Suspense>, like requireUser.
export async function requireAdmin(redirectTo: string): Promise<CurrentUser> {
  const { user, isAdmin } = await getAdminSession();
  if (!user) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  if (!isAdmin) notFound();
  return user;
}

// For admin Server Actions and route handlers: they can be called directly,
// so a check on the page that renders them is not enough.
export async function assertAdmin(): Promise<CurrentUser> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) throw new Error("Unauthorized");
  return user;
}
