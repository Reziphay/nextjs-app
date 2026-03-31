import type { CSSProperties } from "react";

export const primaryColors = ["#f5f5f4", "#e5e6e4", "#e13434", "#e13434", "#f6efeb", "#eee7df", "#f6f4ea", "#eceae2"]

export const blackColors = [
  "#131316",
  "#1c1c21",
  "#26262c",
  "#2f3037",
  "#393a41",
  "#4b4c52",
  "#5b5c62",
  "#6a6b70",
] as const;

export const whiteColors = [
  "#fff",
  "#fff",
  "#fff",
  "#fff",
  "#fff",
  "#fff",
  "#fff",
  "#fff",
] as const;

export const errorColors = ["#880d1e", "#dd2d4a", "#f26a8d", "#f49cbb"] as const;

export const warnColors = ["#f7b267", "#f79d65", "#f4845f", "#f27059"] as const;

export const successColors = ["#073b3a", "#0b6e4f", "#08a045", "#6bbf59"] as const;

function hexToRgbChannels(hex: string) {
  const normalized = hex.replace("#", "");
  const fullHex =
    normalized.length === 3
      ? normalized
        .split("")
        .map((value) => `${value}${value}`)
        .join("")
      : normalized;

  const parsed = Number.parseInt(fullHex, 16);
  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;

  return `${red} ${green} ${blue}`;
}

function withAlpha(color: string, alpha: number) {
  return `rgb(${hexToRgbChannels(color)} / ${alpha})`;
}

const semanticColors = {
  "app-bg-canvas": whiteColors[2],
  "app-bg-subtle": whiteColors[7],
  "app-bg-surface": whiteColors[3],
  "app-bg-surface-strong": whiteColors[0],
  "app-bg-surface-muted": whiteColors[5],
  "app-bg-primary-soft": withAlpha(primaryColors[6], 0.18),
  "app-bg-code": withAlpha(primaryColors[2], 0.08),
  "app-bg-overlay-strong": withAlpha(whiteColors[2], 0.48),
  "app-bg-overlay-soft": withAlpha(whiteColors[2], 0.16),
  "app-text-strong": blackColors[0],
  "app-text-base": blackColors[2],
  "app-text-muted": blackColors[5],
  "app-text-subtle": blackColors[7],
  "app-text-inverse": whiteColors[2],
  "app-border-soft": withAlpha(blackColors[0], 0.1),
  "app-border-strong": withAlpha(blackColors[0], 0.16),
  "app-border-primary-soft": withAlpha(primaryColors[3], 0.12),
  "app-border-primary-strong": withAlpha(primaryColors[3], 0.24),
  "app-primary": primaryColors[3],
  "app-primary-strong": primaryColors[2],
  "app-primary-soft": primaryColors[6],
  "app-primary-faint": primaryColors[7],
  "app-focus-ring": withAlpha(primaryColors[5], 0.28),
  "app-shadow-color": withAlpha(blackColors[0], 0.14),
  "app-shadow-color-strong": withAlpha(blackColors[0], 0.18),
  "app-shadow-primary-soft": withAlpha(primaryColors[3], 0.18),
  "app-shadow-primary-faint": withAlpha(primaryColors[3], 0.12),
  "app-shadow-card-soft": withAlpha(blackColors[0], 0.04),
  "app-glow-primary-soft": withAlpha(primaryColors[7], 0.22),
  "app-glow-primary-strong": withAlpha(primaryColors[4], 0.22),
  "app-error": errorColors[1],
  "app-error-strong": errorColors[0],
  "app-error-soft": errorColors[2],
  "app-error-faint": errorColors[3],
  "app-error-bg": withAlpha(errorColors[2], 0.14),
  "app-error-border": withAlpha(errorColors[1], 0.24),
  "app-warning": warnColors[2],
  "app-warning-strong": warnColors[3],
  "app-warning-soft": warnColors[1],
  "app-warning-faint": warnColors[0],
  "app-warning-bg": withAlpha(warnColors[0], 0.16),
  "app-warning-border": withAlpha(warnColors[2], 0.24),
  "app-success": successColors[2],
  "app-success-strong": successColors[1],
  "app-success-soft": successColors[3],
  "app-success-faint": successColors[0],
  "app-success-bg": withAlpha(successColors[3], 0.14),
  "app-success-border": withAlpha(successColors[2], 0.24),
} as const;

function createScaleVariables(
  scaleName: string,
  colors: readonly string[],
): Record<`--color-${string}`, string> {
  return Object.fromEntries(
    colors.map((color, index) => [`--color-${scaleName}-${index + 1}`, color]),
  ) as Record<`--color-${string}`, string>;
}

function createSemanticVariables(
  tokens: Record<string, string>,
): Record<`--${string}`, string> {
  return Object.fromEntries(
    Object.entries(tokens).map(([token, value]) => [`--${token}`, value]),
  ) as Record<`--${string}`, string>;
}

export const lightTheme = {
  name: "light",
  palette: {
    primary: primaryColors,
    black: blackColors,
    error: errorColors,
    warn: warnColors,
    success: successColors,
    white: whiteColors,
  },
  semantic: semanticColors,
} as const;

export const lightThemeVariables = {
  ...createScaleVariables("primary", lightTheme.palette.primary),
  ...createScaleVariables("black", lightTheme.palette.black),
  ...createScaleVariables("error", lightTheme.palette.error),
  ...createScaleVariables("warn", lightTheme.palette.warn),
  ...createScaleVariables("success", lightTheme.palette.success),
  ...createScaleVariables("white", lightTheme.palette.white),
  ...createSemanticVariables(lightTheme.semantic),
} satisfies Record<`--${string}`, string>;

export const lightThemeStyle = lightThemeVariables as CSSProperties;
