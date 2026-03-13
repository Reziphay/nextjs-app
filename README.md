# Reziphay Web

Next.js web MVP for Reziphay. The project is split into:

- Public marketing and SEO pages
- Hidden admin and operations pages behind a configurable route segment

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- React Hook Form + Zod
- Vitest + Testing Library

## Run

1. Copy `.env.example` to `.env.local`.
2. Install dependencies:

```bash
pnpm install
```

3. Start the dev server:

```bash
pnpm dev
```

4. Open `http://localhost:3000`.

## Hidden Admin

- The admin route is controlled by `ADMIN_ROUTE_SEGMENT`.
- The auth adapter mode is controlled by `ADMIN_AUTH_MODE`.
- Default local route from `.env.example`: `/operator`
- Default local credentials from `.env.example`:
  - `ops@reziphay.local`
  - `reziphay-admin`

In `mock` mode, the internal API route validates those credentials and stores a typed session cookie. In `remote` mode, the same route proxies to the configured backend auth paths.

## Data Source

- `NEXT_PUBLIC_USE_MOCK_DATA=true` keeps the app on local typed mock data.
- Set `NEXT_PUBLIC_USE_MOCK_DATA=false` to use the remote REST adapter at `NEXT_PUBLIC_API_BASE_URL`.
- Set `ADMIN_AUTH_MODE=remote` to switch admin login/logout to backend auth endpoints.

The remote adapter already expects admin endpoints such as `/admin/reports`, `/admin/users`, `/admin/brands`, `/admin/services`, and `/admin/analytics/overview`.

## Validation

```bash
pnpm lint
pnpm test
pnpm build
```

## Current Scope

- Public pages: landing, download, for-businesses, about, FAQ, contact, legal, SEO template
- Hidden admin pages: login, overview, reports, users, brands, services, visibility labels, sponsored visibility, analytics, activity, settings
- Typed mock admin data layer and local API placeholders for contact and admin auth
