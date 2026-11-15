// Grants or revokes /admin access: `pnpm admin:grant <email> [--revoke]`.
// Revoking also signs the user out everywhere, so access ends immediately.
//
// Builds its own client rather than importing `./index`, which is server-only.

import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";
import { session, user } from "./schema";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const db = drizzle(process.env.DATABASE_URL, { schema });

async function main() {
  const args = process.argv.slice(2);
  const revoke = args.includes("--revoke");
  const email = args.find((arg) => !arg.startsWith("--"))?.toLowerCase();
  if (!email) {
    throw new Error("Usage: pnpm admin:grant <email> [--revoke]");
  }

  const [updated] = await db
    .update(user)
    .set({ role: revoke ? "user" : "admin" })
    .where(eq(user.email, email))
    .returning({ id: user.id, emailVerified: user.emailVerified });
  if (!updated) {
    throw new Error(`No user with email ${email}`);
  }

  if (revoke) {
    await db.delete(session).where(eq(session.userId, updated.id));
    console.log(`Revoked admin access for ${email} and signed them out.`);
    return;
  }

  console.log(`Granted admin access to ${email}.`);
  if (!updated.emailVerified) {
    console.warn("Their email isn't verified yet; /admin stays closed until it is.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
