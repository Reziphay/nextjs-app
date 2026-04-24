"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  applyThemeToDocument,
  defaultThemePreference,
  getResolvedTheme,
  resolveThemePreference,
  themeStorageKey,
  type ResolvedTheme,
  type ThemePreference,
} from "@/theme/theme-config";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

type ThemeSnapshot = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
};

const defaultResolvedTheme = getResolvedTheme(defaultThemePreference, false);
const defaultThemeSnapshot: ThemeSnapshot = {
  theme: defaultThemePreference,
  resolvedTheme: defaultResolvedTheme,
};

let themeSnapshot = defaultThemeSnapshot;
const themeStoreListeners = new Set<() => void>();

function getSystemPrefersDark() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getDocumentThemeSnapshot() {
  if (typeof document === "undefined") {
    return defaultThemeSnapshot;
  }

  const nextSnapshot: ThemeSnapshot = {
    theme: resolveThemePreference(document.documentElement.dataset.themePreference),
    resolvedTheme: document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  };

  if (
    nextSnapshot.theme !== themeSnapshot.theme ||
    nextSnapshot.resolvedTheme !== themeSnapshot.resolvedTheme
  ) {
    themeSnapshot = nextSnapshot;
  }

  return themeSnapshot;
}

function getServerThemeSnapshot() {
  return defaultThemeSnapshot;
}

function subscribeToThemeStore(listener: () => void) {
  themeStoreListeners.add(listener);

  return () => {
    themeStoreListeners.delete(listener);
  };
}

function notifyThemeStoreListeners() {
  themeStoreListeners.forEach((listener) => {
    listener();
  });
}

function persistThemePreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(themeStorageKey, preference);
  } catch {}
}

function applyThemePreference(preference: ThemePreference) {
  const resolvedTheme = getResolvedTheme(preference, getSystemPrefersDark());

  themeSnapshot = {
    theme: preference,
    resolvedTheme,
  };
  applyThemeToDocument(document.documentElement, preference, resolvedTheme);
  persistThemePreference(preference);
  notifyThemeStoreListeners();
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, resolvedTheme } = useSyncExternalStore(
    subscribeToThemeStore,
    getDocumentThemeSnapshot,
    getServerThemeSnapshot,
  );

  useEffect(() => {
    if (theme !== "system") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyThemePreference("system");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  function setTheme(nextTheme: ThemePreference) {
    applyThemePreference(nextTheme);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
