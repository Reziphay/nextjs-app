import type { CSSProperties } from "react";

const palette = [
  "#00111c", "hsla(210, 11%, 14%, 1.00)", "#212529",
  "#eff6ff", "#f5b82e", "#f5b82e",
  "#dbeafe", "#eff6ff", "#f8fbff",
];

export const blackColors = [palette[0], palette[1], palette[2]] as const;
export const primaryColors = [palette[3], palette[4], palette[5]] as const;
export const whiteColors = [palette[6], palette[7], palette[8]] as const;

export const errorColors = [
  "#7f1d1d",
  "#ef4444",
  "#f87171",
  "#fca5a5",
  "#fee2e2",
] as const;

export const warnColors = [
  "#9a3412",
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#ffedd5",
] as const;

export const successColors = [
  "#14532d",
  "#16a34a",
  "#22c55e",
  "#4ade80",
  "#dcfce7",
] as const;

function hexToRgb(hex: string) {
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

  return [red, green, blue] as const;
}

function hexToRgbChannels(hex: string) {
  const [red, green, blue] = hexToRgb(hex);
  return `${red} ${green} ${blue}`;
}

function withAlpha(color: string, alpha: number) {
  return `rgb(${hexToRgbChannels(color)} / ${alpha})`;
}

const semanticColors = {
  "app-bg-canvas": blackColors[0],
  "app-bg-subtle": withAlpha(whiteColors[0], 0.05),
  "app-bg-surface": blackColors[1],
  "app-bg-surface-strong": blackColors[2],
  "app-bg-surface-muted": withAlpha(whiteColors[0], 0.08),
  "app-bg-sidebar": "#08111f",
  "app-bg-primary-soft": withAlpha(primaryColors[1], 0.18),
  "app-bg-code": withAlpha(primaryColors[2], 0.12),
  "app-bg-overlay-strong": withAlpha(blackColors[0], 0.88),
  "app-bg-overlay-soft": withAlpha(blackColors[1], 0.72),
  "app-text-strong": whiteColors[2],
  "app-text-base": whiteColors[1],
  "app-text-muted": withAlpha(whiteColors[0], 0.84),
  "app-text-subtle": withAlpha(whiteColors[0], 0.62),
  "app-text-inverse": blackColors[0],
  "app-border-soft": withAlpha(whiteColors[1], 0.12),
  "app-border-strong": withAlpha(whiteColors[1], 0.22),
  "app-border-primary-soft": withAlpha(primaryColors[1], 0.22),
  "app-border-primary-strong": withAlpha(primaryColors[2], 0.42),
  "app-primary-deep": primaryColors[0],
  "app-primary": primaryColors[1],
  "app-primary-strong": primaryColors[2],
  "app-primary-soft": primaryColors[2],
  "app-primary-faint": withAlpha(primaryColors[2], 0.16),
  "app-focus-ring": withAlpha(primaryColors[2], 0.34),
  "app-shadow-color": withAlpha(blackColors[0], 0.42),
  "app-shadow-color-strong": withAlpha(blackColors[0], 0.62),
  "app-shadow-primary-soft": withAlpha(primaryColors[1], 0.22),
  "app-shadow-primary-faint": withAlpha(primaryColors[2], 0.14),
  "app-shadow-card-soft": withAlpha(blackColors[0], 0.36),
  "app-glow-primary-soft": withAlpha(primaryColors[1], 0.22),
  "app-glow-primary-strong": withAlpha(primaryColors[2], 0.34),
  "app-error": errorColors[1],
  "app-error-strong": errorColors[2],
  "app-error-soft": errorColors[3],
  "app-error-faint": errorColors[4],
  "app-error-bg": withAlpha(errorColors[1], 0.16),
  "app-error-border": withAlpha(errorColors[2], 0.28),
  "app-warning": warnColors[1],
  "app-warning-strong": warnColors[2],
  "app-warning-soft": warnColors[3],
  "app-warning-faint": warnColors[4],
  "app-warning-bg": withAlpha(warnColors[1], 0.16),
  "app-warning-border": withAlpha(warnColors[2], 0.3),
  "app-success": successColors[1],
  "app-success-strong": successColors[2],
  "app-success-soft": successColors[3],
  "app-success-faint": successColors[4],
  "app-success-bg": withAlpha(successColors[1], 0.16),
  "app-success-border": withAlpha(successColors[2], 0.28),
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

export const darkTheme = {
  name: "dark",
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

export const darkThemeVariables = {
  ...createScaleVariables("primary", darkTheme.palette.primary),
  ...createScaleVariables("black", darkTheme.palette.black),
  ...createScaleVariables("error", darkTheme.palette.error),
  ...createScaleVariables("warn", darkTheme.palette.warn),
  ...createScaleVariables("success", darkTheme.palette.success),
  ...createScaleVariables("white", darkTheme.palette.white),
  ...createSemanticVariables(darkTheme.semantic),
} satisfies Record<`--${string}`, string>;

export const darkThemeStyle = darkThemeVariables as CSSProperties;
