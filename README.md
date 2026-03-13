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

Remote mode is now a first-class path for the backend contracts that already exist today:

- `/admin/reports`
- `/admin/reports/:id/resolve`
- `/admin/users/:id/suspend`
- `/admin/users/:id/close`
- `/admin/visibility-labels`
- `/admin/visibility-labels/:id/assign`
- `/admin/analytics/overview`

Every admin read and mutation path is now configurable through `.env.local`, so the web app does not depend on a single hardcoded backend route layout. The defaults still point at the current `/admin/...` contract, but paths such as `ADMIN_REPORT_ACTION_PATH`, `ADMIN_USER_ADMIN_DETAIL_PATH`, `ADMIN_VISIBILITY_LABELS_PATH`, and `ADMIN_SPONSORED_VISIBILITY_PATH` can be remapped to the real backend when needed.

Server-side admin data reads now also forward the remote admin access token when one exists in the session cookie, and expired sessions are rejected at the cookie and guard layer. Composite detail pages can consume dedicated backend detail endpoints such as `/admin/users/:id/detail`, `/admin/brands/:id/detail`, and `/admin/services/:id/detail`, with automatic fallback to base entity routes or synthesized context when those detail routes are not available yet.

The web admin now standardizes these fallback rules:

- reports detail falls back from `/admin/reports/:id` to the reports collection
- overview falls back from `/admin/overview` to synthesized analytics, report, and visibility data
- activity falls back from `/admin/activity` to synthesized moderation and visibility events
- brand and service detail fall back to public `/brands` and `/services` routes when admin read routes are missing
- user detail surfaces an explicit contract-limited state when the backend does not expose admin user reads

Collection adapters accept either bare arrays or keyed collections such as `items`, `reports`, `labels`, `assignments`, `campaigns`, or `activity`, so the web app can tolerate small backend response-shape variation while the contract is being finalized.

## Admin Mutations

The admin forms now submit through internal API routes that can run in mock mode or proxy to remote admin endpoints:

- `/api/admin/report-actions`
- `/api/admin/user-actions`
- `/api/admin/visibility-labels`
- `/api/admin/sponsorships`

Successful admin mutations trigger a route refresh so server-rendered operations pages can immediately reflect backend state.

Current remote mutation standardization:

- report moderation only submits `resolve` or `dismiss`
- user actions only submit `suspend` or `close`
- visibility label actions create the label if needed, then assign it in a second backend call
- sponsored visibility stays gracefully unsupported until a backend route exists

## Admin Settings Diagnostics

The hidden admin `Settings` page now exposes:

- current auth mode and data mode
- current session mode and access token presence
- configured backend endpoint templates
- cutover warnings for hybrid or incomplete remote setups

This makes it easier to validate `.env.local` before switching the admin panel onto live backend contracts.

When remote data mode is enabled, the same page now runs read-only readiness probes against the configured backend query endpoints and classifies them as `ready`, `unauthorized`, `missing`, `failing`, or `skipped`. This gives the ops surface a quick pre-cutover check without triggering write routes.

## Validation

```bash
pnpm lint
pnpm test
pnpm build
```

## Current Scope

- Public pages: landing, download, for-businesses, about, FAQ, contact, legal, SEO template
- Hidden admin pages: login, overview, reports, users, brands, services, visibility labels, sponsored visibility, analytics, activity, settings
- Local typed mock mode for product/UI development
- Remote admin adapters aligned to current backend contracts for reports, moderation, analytics, and visibility labels
- Local API placeholders for contact and provider inquiry handling

## Known Backend-Limited Areas

The web app now handles these gaps explicitly instead of assuming they exist:

- dedicated admin overview endpoint
- dedicated admin activity feed endpoint
- dedicated sponsored visibility endpoints
- full admin user read/list endpoints
- dedicated report detail endpoint
- backend admin auth is only available if the configured auth routes are implemented
