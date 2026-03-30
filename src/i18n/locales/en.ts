import type { Messages } from "../types";

export const enMessages: Messages = {
  metadata: {
    title: "Reziphay Next App",
    description:
      "A multilingual Next.js starter with Azerbaijani as the default language and Axios ready for API requests.",
  },
  languageSwitcherAriaLabel: "Language switcher",
  auth: {
    login: {
      title: "Login to your account",
      description: "Enter your email below to login to your account",
      emailLabel: "Email",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Password",
      forgotPassword: "Forgot your password?",
      submit: "Login",
      continueWithGoogle: "Login with Google",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
    },
  },
  hero: {
    eyebrow: "Multilingual Next.js starter",
    title: "Reziphay Next App",
    description:
      "The project now supports Azerbaijani, English, and Russian. Azerbaijani is the default locale, and non-localized routes automatically redirect to the /az prefix.",
  },
  api: {
    badge: "API",
    title: "Axios is ready to use",
    description:
      "A reusable `api` client is configured with `API_URL`. The same value is exposed to the browser through `NEXT_PUBLIC_API_URL`.",
    missingBaseUrl: "API_URL is missing",
  },
  example: {
    badge: "Usage",
    title: "Request helper included",
    description:
      "You can use the shared `api` instance directly or call the generic `apiRequest` helper for typed requests.",
  },
};
