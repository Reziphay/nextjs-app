"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
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

function getSystemPrefersDark() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getInitialThemePreference(): ThemePreference {
  if (typeof document !== "undefined") {
    return resolveThemePreference(document.documentElement.dataset.themePreference);
  }

  return defaultThemePreference;
}

function getInitialResolvedTheme(): ResolvedTheme {
  if (typeof document !== "undefined") {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }

  return getResolvedTheme(defaultThemePreference, false);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(getInitialThemePreference);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(getInitialResolvedTheme);

  const syncThemeToDocument = useEffectEvent((preference: ThemePreference) => {
    const resolved = getResolvedTheme(preference, getSystemPrefersDark());

    setResolvedTheme(resolved);
    applyThemeToDocument(document.documentElement, preference, resolved);
  });

  useEffect(() => {
    syncThemeToDocument(theme);

    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {}

    if (theme !== "system") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      syncThemeToDocument("system");
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  function setTheme(nextTheme: ThemePreference) {
    startTransition(() => {
      setThemeState(nextTheme);
    });
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
