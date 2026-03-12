# Reziphay Website

Marketing, SEO, and lead-capture website for `Reziphay.com`, built with Next.js App Router.

## Project overview

This project is the public growth surface for the Reziphay product. It is intentionally separate from the mobile reservation experience.

What the website does:

- explains the product clearly
- captures provider and customer intent
- routes users toward app download and deep-link flows
- provides SEO-ready category, city, FAQ, and blog surfaces
- leaves a hidden admin gateway foundation for future internal tooling

What the website does not do:

- it does not implement a full web reservation engine
- it does not collect payments, deposits, or refunds
- it does not present availability as a hard-locked slot system

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- React Hook Form + Zod
- shadcn-style UI primitives
- Vitest + Testing Library

## Main routes

- `/`
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
- `/api/contact`
- `/api/provider-interest`
- `/api/track`

## Folder structure

```txt
src/
  app/
    (marketing)/
    admin/
    api/
    app-link/
    download/
  components/
    layout/
    marketing/
    providers/
    sections/
    ui/
  config/
  content/
  features/
    analytics/
    forms/
    seo/
  lib/
  types/
```

## Setup

```bash
npm install
npm run dev
```

The local dev server starts on the default Next.js port unless overridden.

## Environment variables

See `.env.example`.

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_STORE_URL`
- `NEXT_PUBLIC_PLAY_STORE_URL`
- `NEXT_PUBLIC_APP_DEEP_LINK`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npm run start
```

## SEO strategy

- App Router metadata helpers are centralized in `src/features/seo/metadata.ts`.
- `robots.ts`, `sitemap.ts`, Open Graph image generation, and Twitter image generation are included.
- Structured data is used for `Organization`, `WebSite`, `MobileApplication`, `FAQPage`, `BreadcrumbList`, and `Article`.
- Category, city, blog, and FAQ surfaces are designed for scalable content expansion.
- Canonical URLs are derived from `NEXT_PUBLIC_SITE_URL`.

## Analytics strategy

Analytics is centralized through a typed event map in [events.ts](/Users/vugarsafarzada/Developer/MyProjects/Reziphay/website/src/features/analytics/events.ts) and a shared tracker in [track.ts](/Users/vugarsafarzada/Developer/MyProjects/Reziphay/website/src/features/analytics/track.ts).

Current event coverage:

- `page_view`
- `hero_cta_click`
- `app_store_click`
- `play_store_click`
- `provider_interest_submit`
- `contact_submit`
- `faq_expand`
- `pricing_or_visibility_interest_click`
- `download_section_interaction`
- `category_page_view`
- `city_page_view`
- `blog_article_view`
- `navigation_click`
- `app_link_attempt`

CTA components do not call vendors directly. Client events post to `/api/track`, with optional `gtag` passthrough when available.

## Forms strategy

- Contact and provider-interest forms use React Hook Form and Zod.
- Client and server validation are both enabled.
- A honeypot field is included as basic spam protection.
- Server routes return the same `{ success, data, meta }` and `{ success, error }` wrapper shape used elsewhere in the project context.
- Current storage is placeholder-only and logs submissions in non-production environments.

## Testing strategy

Vitest covers the critical regressions requested in the TODO:

- hero CTA rendering
- navigation rendering
- contact form validation
- provider-interest form validation
- metadata helper behavior
- analytics payload mapping
- FAQ interaction tracking

## Admin hidden route note

`/admin/hidden/login` exists as a distinct visual and layout foundation for future internal auth and operations tooling. It is intentionally isolated from the public marketing layout.

## Known limitations

- Contact and provider-interest submissions are not yet persisted to a real backend, CRM, or email provider.
- App Store and Google Play links depend on environment configuration and may still point to fallback flows before launch.
- Blog content is file-backed config content, not CMS-driven yet.
- Navigation link tracking is only wired for the main CTA surfaces, not every passive nav link.

## Future improvements

- connect forms to backend persistence or CRM delivery
- add CMS or MDX-backed blog authoring
- add richer provider or category content modules
- add full campaign parameter propagation for download flows
- expand UI primitives with tabs, chips, drawers, toasts, and avatars where needed
- add deeper accessibility and visual regression coverage
