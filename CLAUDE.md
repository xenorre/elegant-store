# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Better Auth · Drizzle ORM · Neon Postgres. Package manager is **pnpm**.

Next.js 16 differs from older versions. Before writing Next-specific code, check the bundled docs in `node_modules/next/dist/docs/` (`01-app/` covers the App Router).

## Commands

```bash
pnpm dev              # dev server
pnpm build            # production build (needs a migrated and seeded DATABASE_URL: src/db/index.ts throws without it, and generateStaticParams must return at least one product)
pnpm lint             # ESLint (flat config, eslint-config-next core-web-vitals + typescript)
pnpm typecheck        # tsc --noEmit
pnpm auth:generate    # generate Better Auth tables into src/db/auth-schema.ts (reads src/lib/auth.cli.ts)
pnpm db:generate      # drizzle-kit: SQL migrations from schema into ./drizzle
pnpm db:migrate       # apply migrations
pnpm db:push          # push schema directly (prototyping)
pnpm db:studio        # Drizzle Studio
pnpm db:seed          # upsert the initial catalogue (src/db/seed-data.ts); safe to re-run
```

There is no test runner set up yet.

Environment variables live in `.env.local` (copy from `.env.example`): `DATABASE_URL` (Neon **pooled** connection string), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM` (a sender on a domain verified in Resend). `src/lib/email.ts` throws at import without the Resend variables, so the build needs them too. `drizzle.config.ts` loads `.env.local` explicitly through dotenv.

## Architecture

- **Path alias**: `@/*` → `src/*`.
- **Database** (`src/db/`): `index.ts` exports a single `db` built with the `drizzle-orm/neon-http` driver (HTTP, so no interactive transactions). `schema.ts` is the single schema entry point used by both drizzle-kit and the runtime client, so every table module must be re-exported from it.
- **Catalogue** (`src/db/catalog-schema.ts`): `categories`, `products` (price in integer `price_cents`, `details` text[], `gallery` jsonb) and `stock` (one row per size, or a single row with `size = null` for one-size products; unique on `(product_id, size)` NULLS NOT DISTINCT). There are no carts, orders or variants yet. Better Auth's `user`, `session`, `account`, `verification` and `rate_limit` tables sit alongside it.
- **Catalogue reads** (`src/lib/products.ts`, server-only): cached query functions (`"use cache"`, `cacheLife("minutes")`, `cacheTag("products")`) that map rows to the `Product` type in `src/lib/catalog.ts`. That file holds the shared types and helpers plus static marketing content (hero, collections, curated homepage slug lists). Call `updateTag("products")` after writing catalogue data.
- **Auth** (`src/lib/`): email and password only, with required email verification and password reset (emails go through Resend in `email.ts`, sent with `after()` so timing doesn't reveal accounts). Rate limits are stored in the database and only active in production.
  - `auth-config.ts`: the options shared by the runtime and the CLI. Put anything that affects the schema here, including plugins, and keep `nextCookies()` last.
  - `auth.ts`: the server instance (Drizzle adapter, email callbacks).
  - `auth.cli.ts`: used only by `pnpm auth:generate`, because the CLI cannot load `server-only`.
  - `auth-client.ts`: the React client. It has no `baseURL`, so it calls `/api/auth` on the page's own origin.
  - **Base URL**: in development, `auth.ts` uses a dynamic `baseURL` that accepts `localhost:*` and this machine's LAN IPs (`src/lib/lan-addresses.ts`, shared with `allowedDevOrigins`), so auth works from other devices. In production it uses `BETTER_AUTH_URL`.
  - The catch-all route `src/app/api/auth/[...all]/route.ts` mounts the handler.
- **Sessions in pages**: `src/lib/session.ts` has `getCurrentUser()` (memoized per request) and `requireUser(path)`, which redirects to `/sign-in?redirectTo=`. These read the request, so render callers inside `<Suspense>`. `src/proxy.ts` is only an optimistic cookie check for `/account/*`; pages must still call `requireUser`. Validate any `redirectTo` with `safeRedirect()` from `src/lib/auth-redirect.ts`.
- **Auth UI**: pages live in `src/app/(auth)/` (sign-in, sign-up, forgot-password, reset-password) and `src/app/account/`. Client forms are in `src/components/auth/`, and error copy is in `src/lib/auth-errors.ts`.
- **Server-only boundary**: `src/db/index.ts`, `src/lib/auth.ts`, `src/lib/session.ts` and `src/lib/email.ts` import `server-only`. Never import them from Client Components; use `authClient` there instead.
- **Auth schema**: `src/db/auth-schema.ts` is generated, so don't edit it by hand. After changing Better Auth plugins or schema options, run `pnpm auth:generate && pnpm db:generate && pnpm db:migrate`.
- **Next config** (`next.config.ts`): `cacheComponents` and `partialPrefetching` are enabled, so data fetching and caching follow the Cache Components model (`"use cache"`, Suspense boundaries for dynamic data). See the Next docs before adding caching or dynamic APIs.
- **Styling**: Tailwind v4 runs through the `@tailwindcss/turbopack` loader configured in `next.config.ts`; there is no PostCSS config. Theme tokens are defined with `@theme inline` in `src/app/globals.css`.
- **Typed route props**: layouts and pages use Next's global generated types (e.g. `LayoutProps<"/">`, `PageProps<"/path">`).
