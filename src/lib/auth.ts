import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { after } from "next/server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { authConfig } from "@/lib/auth-config";
import { resetPasswordEmail, sendEmail, verificationEmail } from "@/lib/email";

export const auth = betterAuth({
  ...authConfig,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    ...authConfig.emailAndPassword,
    // Send after the response so timing doesn't reveal whether the account exists.
    sendResetPassword: async ({ user, url }) => {
      after(() => sendEmail(resetPasswordEmail(user.email, url)));
    },
  },
  emailVerification: {
    ...authConfig.emailVerification,
    sendVerificationEmail: async ({ user, url }) => {
      after(() => sendEmail(verificationEmail(user.email, url)));
    },
  },
});

export type Session = typeof auth.$Infer.Session;
