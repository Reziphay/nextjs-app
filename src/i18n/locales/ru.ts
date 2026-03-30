import type { Messages } from "../types";

export const ruMessages: Messages = {
  metadata: {
    title: "Reziphay Next App",
    description:
      "Многоязычный стартовый проект Next.js с азербайджанским языком по умолчанию и готовым Axios-клиентом.",
  },
  languageSwitcherAriaLabel: "Переключение языка",
  auth: {
    login: {
      title: "Войдите в аккаунт",
      description: "Введите свой email ниже, чтобы войти в аккаунт",
      emailLabel: "Email",
      emailPlaceholder: "m@example.com",
      passwordLabel: "Пароль",
      forgotPassword: "Забыли пароль?",
      submit: "Войти",
      continueWithGoogle: "Войти через Google",
      noAccount: "Нет аккаунта?",
      signUp: "Регистрация",
    },
  },
  hero: {
    eyebrow: "Мультиязычный Next.js starter",
    title: "Reziphay Next App",
    description:
      "Проект теперь поддерживает азербайджанский, английский и русский языки. Азербайджанский язык используется по умолчанию, а маршруты без локали автоматически перенаправляются на префикс /az.",
  },
  api: {
    badge: "API",
    title: "Axios уже настроен",
    description:
      "Общий клиент `api` настроен на базе `API_URL`. То же значение доступно на клиенте через `NEXT_PUBLIC_API_URL`.",
    missingBaseUrl: "API_URL не найден",
  },
  example: {
    badge: "Пример",
    title: "Готовый helper для запросов",
    description:
      "Можно использовать общий instance `api` напрямую или generic helper `apiRequest` для типизированных запросов.",
  },
};
