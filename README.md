# Reziphay Website

Marketing and SEO website for `Reziphay.com`, built with Next.js App Router.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- React Hook Form + Zod
- shadcn-style UI primitives

## Routes

- `/` landing page
- `/features`
- `/for-customers`
- `/for-providers`
- `/how-it-works`
- `/categories/[slug]`
- `/cities/[slug]`
- `/faq`
- `/contact`
- `/about`
- `/privacy`
- `/terms`
- `/blog`
- `/blog/[slug]`
- `/download`
- `/app-link`
- `/admin/hidden/login`

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Environment

See `.env.example` for:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_STORE_URL`
- `NEXT_PUBLIC_PLAY_STORE_URL`
- `NEXT_PUBLIC_APP_DEEP_LINK`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Notes

- The website is intentionally marketing-first. It does not implement a full web booking engine.
- Contact and provider-interest forms validate on both client and server.
- CTA interactions emit lightweight analytics events to `/api/track`.
- Store links are environment-driven so launch fallbacks can still capture demand when app-store URLs are not live yet.
