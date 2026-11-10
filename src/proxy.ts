import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: it sees whether a session cookie exists, not whether
// it's valid. Protected pages still call requireUser() from src/lib/session.ts.
export function proxy(request: NextRequest) {
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

export const config = {
  matcher: ["/account/:path*"],
};
