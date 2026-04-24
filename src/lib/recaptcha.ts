declare global {
  interface Window {
    grecaptcha?: {
      ready?: (callback: () => void) => void;
      execute?: (
        siteKey: string,
        options: { action: "login" | "register" },
      ) => Promise<string>;
      enterprise?: {
        ready?: (callback: () => void) => void;
        execute?: (
          siteKey: string,
          options: { action: "login" | "register" },
        ) => Promise<string>;
      };
    };
  }
}

export type RecaptchaAction = "login" | "register";
export type RecaptchaMode = "live" | "development-bypass" | "unavailable";

const recaptchaSiteKey =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";

let recaptchaScriptPromise: Promise<void> | null = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function isDevelopmentBypass() {
  return process.env.NODE_ENV !== "production" && !recaptchaSiteKey;
}

function getRecaptchaClient() {
  return window.grecaptcha?.enterprise ?? window.grecaptcha;
}

function loadRecaptchaScript() {
  if (!isBrowser()) {
    return Promise.resolve();
  }

  if (recaptchaScriptPromise) {
    return recaptchaScriptPromise;
  }

  recaptchaScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-recaptcha="true"]',
    );

    if (existingScript) {
      if (getRecaptchaClient()) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("RECAPTCHA_SCRIPT_FAILED")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://www.google.com/recaptcha/api.js?render=" +
      encodeURIComponent(recaptchaSiteKey);
    script.async = true;
    script.defer = true;
    script.dataset.recaptcha = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("RECAPTCHA_SCRIPT_FAILED")),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return recaptchaScriptPromise;
}

export function getRecaptchaMode(): RecaptchaMode {
  if (recaptchaSiteKey) {
    return "live";
  }

  return isDevelopmentBypass() ? "development-bypass" : "unavailable";
}

export async function executeRecaptcha(action: RecaptchaAction) {
  if (isDevelopmentBypass()) {
    return `dev-bypass-${action}-token`;
  }

  if (!isBrowser() || !recaptchaSiteKey) {
    throw new Error("RECAPTCHA_UNAVAILABLE");
  }

  await loadRecaptchaScript();

  const client = getRecaptchaClient();

  if (!client?.ready || !client.execute) {
    throw new Error("RECAPTCHA_UNAVAILABLE");
  }

  return new Promise<string>((resolve, reject) => {
    client.ready?.(() => {
      client
        .execute?.(recaptchaSiteKey, { action })
        .then((token) => {
          if (!token?.trim()) {
            reject(new Error("RECAPTCHA_UNAVAILABLE"));
            return;
          }

          resolve(token);
        })
        .catch(() => {
          reject(new Error("RECAPTCHA_UNAVAILABLE"));
        });
    });
  });
}
