import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import { getRouteSlugs } from "@/lib/route-slugs";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/account") || pathname.startsWith("/admin")) {
    return requireSessionCookie(request);
  }
  return notFoundForUnknownSlug(request);
}

// Optimistic check only: it sees whether a session cookie exists, not whether
// it's valid. Protected pages still call requireUser() or requireAdmin() from
// src/lib/session.ts.
function requireSessionCookie(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;
  const signIn = new URL("/sign-in", request.url);
  signIn.searchParams.set("redirectTo", pathname);

  // A failed email verification lands on /account?error=…; keep the reason.
  const error = searchParams.get("error");
  if (error) signIn.searchParams.set("error", error);

  return NextResponse.redirect(signIn);
}

// Collection and product pages call notFound() behind Suspense, after the 200
// status is sent. Check the slug here instead, so unknown ones get a real 404.
async function notFoundForUnknownSlug(request: NextRequest) {
  const [, section, slug] = request.nextUrl.pathname.split("/");
  const slugs = await getRouteSlugs();
  // Fail open: if the lookup fails, let the page render its own not-found UI.
  if (!slugs || !slug) return NextResponse.next();

  const known = section === "products" ? slugs.products : slugs.collections;
  if (known.has(decodeURIComponent(slug))) return NextResponse.next();

  // No route matches this path, so Next renders the not-found page with a 404.
  return NextResponse.rewrite(new URL("/_unknown", request.url));
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/collections/:slug", "/products/:slug"],
};
