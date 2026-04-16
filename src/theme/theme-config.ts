import { darkThemeVariables } from "./dark-theme";
import { lightThemeVariables } from "./light-theme";

export const themeStorageKey = "reziphay-theme";
export const defaultThemePreference = "system";
export const themePreferences = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof themePreferences)[number];
export type ResolvedTheme = Exclude<ThemePreference, "system">;

export function resolveThemePreference(
  value?: string | null,
): ThemePreference {
  return themePreferences.includes(value as ThemePreference)
    ? (value as ThemePreference)
    : defaultThemePreference;
}

export function getResolvedTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return preference;
}

export function applyThemeToDocument(
  root: HTMLElement,
  preference: ThemePreference,
  resolvedTheme: ResolvedTheme,
) {
  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = preference;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
}

function serializeThemeVariables(
  selector: string,
  variables: Record<`--${string}`, string>,
) {
  const declarations = Object.entries(variables)
    .map(([property, value]) => `${property}: ${value};`)
    .join("");

  return `${selector}{${declarations}}`;
}

export const themeStylesheet = [
  serializeThemeVariables(":root, [data-theme=\"light\"]", lightThemeVariables),
  serializeThemeVariables("[data-theme=\"dark\"]", darkThemeVariables),
].join("\n");

export const themeInitializationScript = `(() => {
  const storageKey = ${JSON.stringify(themeStorageKey)};
  const root = document.documentElement;
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  let storedPreference = null;

  try {
    storedPreference = window.localStorage.getItem(storageKey);
  } catch {}

  const preference =
    storedPreference === "light" ||
    storedPreference === "dark" ||
    storedPreference === "system"
      ? storedPreference
      : ${JSON.stringify(defaultThemePreference)};

  const resolvedTheme =
    preference === "system"
      ? mediaQuery.matches
        ? "dark"
        : "light"
      : preference;

  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = preference;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;

  if (storedPreference !== preference) {
    try {
      window.localStorage.setItem(storageKey, preference);
    } catch {}
  }
})();`;
