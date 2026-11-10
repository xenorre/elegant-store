// Config for the Better Auth CLI only (`pnpm auth:generate`). The CLI cannot
// load `server-only`, which auth.ts and src/db/index.ts import, so this builds
// its own Drizzle client. Never import this file from app code.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/neon-http";

import { authConfig } from "./auth-config";

export const auth = betterAuth({
  ...authConfig,
  database: drizzleAdapter(drizzle(process.env.DATABASE_URL!), {
    provider: "pg",
  }),
});
