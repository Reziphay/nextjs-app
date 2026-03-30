import type { Messages } from "../types";

export const azMessages: Messages = {
  metadata: {
    title: "Reziphay Next App",
    description:
      "Azərbaycan dili default olan, çoxdilli və Axios ilə hazır Next.js başlanğıc layihəsi.",
  },
  languageSwitcherAriaLabel: "Dil seçimi",
  auth: {
    login: {
      title: "Hesabınıza daxil olun",
      description:
        "Hesabınıza daxil olmaq üçün email ünvanınızı aşağıya yazın",
      emailLabel: "Email",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Şifrə",
      forgotPassword: "Şifrənizi unutmusunuz?",
      submit: "Daxil ol",
      continueWithGoogle: "Google ilə daxil ol",
      noAccount: "Hesabınız yoxdur?",
      signUp: "Qeydiyyat",
    },
  },
  hero: {
    eyebrow: "Çoxdilli Next.js starter",
    title: "Reziphay Next App",
    description:
      "Layihə artıq Azərbaycan, English və Русский dilləri ilə işləyir. Default dil Azərbaycan dilidir və locale olmayan route-lar avtomatik olaraq /az prefiksinə yönləndirilir.",
  },
  api: {
    badge: "API",
    title: "Axios inteqrasiyası hazırdır",
    description:
      "Hazır `api` client `API_URL` bazası ilə quruldu. Eyni dəyər `NEXT_PUBLIC_API_URL` üzərindən client tərəfdə də əlçatandır.",
    missingBaseUrl: "API_URL tapılmadı",
  },
  example: {
    badge: "İstifadə",
    title: "Sorğu göndərməyə hazır helper",
    description:
      "Birbaşa `api` instance istifadə edə və ya generik `apiRequest` helper ilə typed request yaza bilərsiniz.",
  },
};
