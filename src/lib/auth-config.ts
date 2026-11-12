import type { BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";

// Options shared by the runtime instance (auth.ts) and the schema CLI
// (auth.cli.ts). Anything that changes the database schema, such as plugins,
// belongs here so `pnpm auth:generate` sees it. Keep this file free of
// `server-only` imports: the CLI cannot load them.
export const authConfig = {
  appName: "Elegant",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      // "admin" grants /admin. input: false keeps sign-up and update-user from
      // setting it; it's changed only by `pnpm admin:grant`.
      role: { type: "string", required: false, defaultValue: "user", input: false },
    },
  },
  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  rateLimit: {
    // In-memory limits reset per serverless instance, so persist them.
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
  // nextCookies must stay last so it sees cookies set by earlier plugins.
  plugins: [nextCookies()],
} satisfies BetterAuthOptions;
