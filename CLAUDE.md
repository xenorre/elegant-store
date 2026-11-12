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

Environment variables live in `.env.local` (copy from `.env.example`): `DATABASE_URL` (Neon **pooled** connection string), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM` (a sender on a domain verified in Resend), `STRIPE_SECRET_KEY` (a restricted `rk_` key from a Stripe sandbox in development), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. `src/lib/email.ts` throws at import without the Resend variables, and `src/lib/stripe.ts` without `STRIPE_SECRET_KEY`, so the build needs them too. `drizzle.config.ts` loads `.env.local` explicitly through dotenv.

## Architecture

- **Path alias**: `@/*` → `src/*`.
- **Database** (`src/db/`): `index.ts` exports a single `db` built with the `drizzle-orm/neon-http` driver (HTTP, so no interactive transactions). `schema.ts` is the single schema entry point used by both drizzle-kit and the runtime client, so every table module must be re-exported from it.
- **Catalogue** (`src/db/catalog-schema.ts`): `categories`, `products` (price in integer `price_cents`, `details` text[], `gallery` jsonb, `department` of `women` | `men` | `unisex`; unisex pieces appear in both departments) and `stock` (one row per size, or a single row with `size = null` for one-size products; unique on `(product_id, size)` NULLS NOT DISTINCT). There are no variants yet. Better Auth's `user`, `session`, `account`, `verification` and `rate_limit` tables sit alongside it.
- **Catalogue reads** (`src/lib/products.ts`, server-only): cached query functions (`"use cache"`, `cacheLife("minutes")`, `cacheTag("products")`) that map rows to the `Product` type in `src/lib/catalog.ts`. That file holds the shared types and helpers plus static marketing content (hero, collections, curated homepage slug lists). Call `updateTag("products")` after writing catalogue data.
- **Editorial collections** (`/collections/[slug]`): seasonal campaigns are typed config objects in `src/lib/editorial-collections.ts`, rendered by the template in `src/components/editorial-collection.tsx` (hero, statement, alternating chapters, curated products by slug). To launch one, add an entry and link to it. The same route falls back to database categories, and an editorial slug wins on a clash.
- **Route groups**: storefront routes live in `src/app/(store)/`, whose layout renders the site header and footer. The root layout only holds `<html>`, fonts and `globals.css`, and the root `not-found.tsx` renders the store chrome itself.
- **Department pages** (`/women`, `/men`): both are thin pages over `src/components/department-landing.tsx`. It renders a static hero from `departments` in `catalog.ts`, then category filter chips (`?category=`) and the grid behind Suspense, using `getDepartmentProducts()`.
- **Auth** (`src/lib/`): email and password only, with required email verification and password reset (emails go through Resend in `email.ts`, sent with `after()` so timing doesn't reveal accounts). Rate limits are stored in the database and only active in production.
  - `auth-config.ts`: the options shared by the runtime and the CLI. Put anything that affects the schema here, including plugins, and keep `nextCookies()` last.
  - `auth.ts`: the server instance (Drizzle adapter, email callbacks).
  - `auth.cli.ts`: used only by `pnpm auth:generate`, because the CLI cannot load `server-only`.
  - `auth-client.ts`: the React client. It has no `baseURL`, so it calls `/api/auth` on the page's own origin.
  - **Base URL**: in development, `auth.ts` uses a dynamic `baseURL` that accepts `localhost:*` and this machine's LAN IPs (`src/lib/lan-addresses.ts`, shared with `allowedDevOrigins`), so auth works from other devices. In production it uses `BETTER_AUTH_URL`.
  - The catch-all route `src/app/api/auth/[...all]/route.ts` mounts the handler.
- **Sessions in pages**: `src/lib/session.ts` has `getCurrentUser()` (memoized per request) and `requireUser(path)`, which redirects to `/sign-in?redirectTo=`. These read the request, so render callers inside `<Suspense>`. `src/proxy.ts` is only an optimistic cookie check for `/account/*`; pages must still call `requireUser`.
- **404 status for unknown slugs**: `/collections/[slug]` and `/products/[slug]` call `notFound()` inside Suspense, which can only return a 200 (with `noindex`), and `dynamicParams` isn't available with Cache Components. So `src/proxy.ts` also checks slugs against `getRouteSlugs()` (`src/lib/route-slugs.ts`: editorial collections plus categories and products, cached in memory for 60s and failing open). Unknown slugs are rewritten to a non-existent path to get a real 404. New catalogue rows can 404 for up to a minute. Validate any `redirectTo` with `safeRedirect()` from `src/lib/auth-redirect.ts`.
- **Auth UI**: pages live in `src/app/(store)/(auth)/` (sign-in, sign-up, forgot-password, reset-password) and `src/app/(store)/account/`. Client forms are in `src/components/auth/`, and error copy is in `src/lib/auth-errors.ts`.
- **Bag and orders** (`src/db/commerce-schema.ts`): `carts` and `cart_items` (one row per product and size, unique on `(cart_id, product_id, size)` NULLS NOT DISTINCT; they reference products rather than `stock` rows because the seed replaces stock), plus `orders` and `order_items` (price snapshots) for the Stripe checkout. The bag is identified by the httpOnly `cart_id` cookie. `src/lib/cart.ts` reads it: `getCart()` reads the cookie (so render it inside `<Suspense>`) and passes the id to a `"use cache"` lookup tagged `cart-<id>` and `products`. Keep it cached: the header bag count renders in every prefetched App Shell, and uncached I/O there is aborted when the prefetch render ends. The Server Actions in `src/lib/cart-actions.ts` call `updateTag(cartTag(id))`.
- **Stripe** (`src/lib/stripe.ts`, server-only): one `Stripe` client pinned to the SDK's API version. Never pass `payment_method_types`; payment methods come from the Dashboard.
- **Checkout**: embedded Stripe Checkout (`ui_mode: "embedded_page"`) on `/checkout`. The client form (`src/components/checkout-form.tsx`) calls the `startCheckout` Server Action (`src/lib/checkout-actions.ts`) on mount, never during render, so prefetches hold no stock. It prices lines from the database, creates a pending order and holds its stock in one conditional statement (`src/lib/orders.ts`), then creates the Checkout Session; an open session for an unchanged bag is reused. Countries, shipping rates and the hold time live in `src/lib/checkout-config.ts`. Tax isn't collected yet: don't enable `automatic_tax` until there's an active Stripe Tax registration.
- **Fulfillment** happens in the webhook (`src/app/api/stripe/webhook/route.ts`), not on `/checkout/return`, which only reports the session state. It handles `checkout.session.completed` and `async_payment_succeeded` (paid only when `payment_status` isn't `unpaid`), `async_payment_failed` and `expired` (both return held stock). Order transitions are conditional updates on `status = 'pending'`, so every handler is idempotent. Locally, run `stripe listen --forward-to localhost:3000/api/stripe/webhook` and use the `whsec_` it prints as `STRIPE_WEBHOOK_SECRET`.
- **Server-only boundary**: `src/db/index.ts`, `src/lib/auth.ts`, `src/lib/session.ts`, `src/lib/email.ts`, `src/lib/cart.ts` and `src/lib/stripe.ts` import `server-only`. Never import them from Client Components; use `authClient` there instead.
- **Auth schema**: `src/db/auth-schema.ts` is generated, so don't edit it by hand. After changing Better Auth plugins or schema options, run `pnpm auth:generate && pnpm db:generate && pnpm db:migrate`.
- **Next config** (`next.config.ts`): `cacheComponents` and `partialPrefetching` are enabled, so data fetching and caching follow the Cache Components model (`"use cache"`, Suspense boundaries for dynamic data). See the Next docs before adding caching or dynamic APIs.
- **Styling**: Tailwind v4 runs through the `@tailwindcss/turbopack` loader configured in `next.config.ts`; there is no PostCSS config. Theme tokens are defined with `@theme inline` in `src/app/globals.css`.
- **Typed route props**: layouts and pages use Next's global generated types (e.g. `LayoutProps<"/">`, `PageProps<"/path">`).
