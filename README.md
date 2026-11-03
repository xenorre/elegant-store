# Elegant Store

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Better Auth · Drizzle ORM · Neon Postgres

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in DATABASE_URL and BETTER_AUTH_SECRET
pnpm dev
```

## Project structure

```
src/
  app/
    api/auth/[...all]/route.ts  # Better Auth route handler
  db/
    index.ts                    # Drizzle client (Neon HTTP driver)
    schema.ts                   # Drizzle schema (empty)
  lib/
    auth.ts                     # Better Auth server instance
    auth-client.ts              # Better Auth React client
drizzle.config.ts               # drizzle-kit config
```

## Scripts

| Script               | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `pnpm dev`           | Start the dev server                                     |
| `pnpm build`         | Production build (requires `DATABASE_URL`)               |
| `pnpm lint`          | Run ESLint                                               |
| `pnpm typecheck`     | Run the TypeScript compiler                              |
| `pnpm auth:generate` | Generate Better Auth tables into `src/db/auth-schema.ts` |
| `pnpm db:generate`   | Generate SQL migrations from the schema                  |
| `pnpm db:migrate`    | Apply migrations                                         |
| `pnpm db:push`       | Push the schema directly (prototyping)                   |
| `pnpm db:studio`     | Open Drizzle Studio                                      |

## Database setup (when ready)

1. `pnpm auth:generate`
2. Add `export * from "./auth-schema";` to `src/db/schema.ts`
3. `pnpm db:generate && pnpm db:migrate`
