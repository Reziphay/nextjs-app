# Reziphay Next App

## Tech Stack

- Next.js 16.2.1
- React 19.2.4
- TypeScript 5
- ESLint 9
- Axios 1.14.0

## Features

- Locale routing for `az`, `en`, and `ru`
- Default locale redirect to `az`
- Ready-to-use Axios client powered by `API_URL`

## Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Environment

The development and production server port is read from `APP_PORT` in `.env`.

`NEXT_PUBLIC_API_URL` mirrors `API_URL` so the shared Axios client can work in both server and client code.

## Project Structure

- `src/app/[locale]/page.tsx` - localized home page
- `src/i18n/config.ts` - locale config and translations
- `src/lib/api.ts` - Axios client and request helper
- `src/proxy.ts` - default locale redirect

## Author

Vugar Safarzada
