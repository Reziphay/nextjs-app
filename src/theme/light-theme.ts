import type { CSSProperties } from "react";


// Neutral Light
// Near-black charcoal buttons, clean white surfaces, sky-blue accent for focus/highlights only
const palette = [
  "#080808", "#1c1c1c", "#6b6b6b",  // blacks: richest dark → body text → muted
  "#000000", "#141414", "#0ea5e9",  // primaries: pressed black → charcoal button → sky accent
  "#ffffff", "#f0f0f0", "#f8f8f8",  // whites: surface white → canvas gray → input/hover bg
];

// palette[0–2]: text ramp
export const blackColors = [palette[0], palette[1], palette[2]] as const;
// palette[3–5]: primary ramp — pressed → button → sky accent
export const primaryColors = [palette[3], palette[4], palette[5]] as const;
// palette[6–8]: surface ramp — white → canvas → hover
export const whiteColors = [palette[6], palette[7], palette[8]] as const;

export const errorColors = [
  "#881337",
  "#e11d48",
  "#fb7185",
  "#fda4af",
  "#ffe4e6",
] as const;

export const warnColors = [
  "#92400e",
  "#b45309",
  "#d97706",
  "#fbbf24",
  "#fef3c7",
] as const;

export const successColors = [
  "#064e3b",
  "#065f46",
  "#059669",
  "#6ee7b7",
  "#d1fae5",
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

// sky accent used for focus, highlights, selection — NOT for buttons
const accent = primaryColors[2]; // #0ea5e9

const semanticColors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────────
  "app-bg-canvas": whiteColors[1],
  "app-bg-subtle": whiteColors[2],
  "app-bg-surface": whiteColors[0],
  "app-bg-surface-strong": whiteColors[2],
  "app-bg-surface-muted": withAlpha(blackColors[2], 0.06),
  "app-bg-sidebar": whiteColors[0],
  "app-bg-primary-soft": withAlpha(accent, 0.08),
  "app-bg-code": withAlpha(accent, 0.06),
  "app-bg-overlay-strong": withAlpha(whiteColors[0], 0.94),
  "app-bg-overlay-soft": withAlpha(whiteColors[0], 0.6),

  // ── Text ─────────────────────────────────────────────────────────────────────
  "app-text-strong": blackColors[0],
  "app-text-base": blackColors[1],
  "app-text-muted": blackColors[2],
  "app-text-subtle": withAlpha(blackColors[2], 0.65),
  "app-text-inverse": "#ffffff",

  // ── Borders ──────────────────────────────────────────────────────────────────
  "app-border-soft": withAlpha(blackColors[1], 0.14),
  "app-border-strong": withAlpha(blackColors[1], 0.26),
  "app-border-primary-soft": withAlpha(accent, 0.25),
  "app-border-primary-strong": withAlpha(accent, 0.5),

  // ── Primary ───────────────────────────────────────────────────────────────────
  "app-primary-deep": primaryColors[0],
  "app-primary": primaryColors[1],
  "app-primary-strong": primaryColors[0],
  "app-primary-soft": accent,
  "app-primary-faint": withAlpha(accent, 0.1),

  // ── Focus ────────────────────────────────────────────────────────────────────
  "app-focus-ring": withAlpha(accent, 0.35),

  // ── Shadows ──────────────────────────────────────────────────────────────────
  "app-shadow-color": withAlpha(blackColors[0], 0.07),
  "app-shadow-color-strong": withAlpha(blackColors[0], 0.13),
  "app-shadow-primary-soft": withAlpha(accent, 0.14),
  "app-shadow-primary-faint": withAlpha(accent, 0.07),
  "app-shadow-card-soft": withAlpha(blackColors[1], 0.09),

  // ── Glow ─────────────────────────────────────────────────────────────────────
  "app-glow-primary-soft": withAlpha(accent, 0.14),
  "app-glow-primary-strong": withAlpha(accent, 0.26),

  // ── Semantic states ───────────────────────────────────────────────────────────
  "app-error": errorColors[1],
  "app-error-strong": errorColors[0],
  "app-error-soft": errorColors[2],
  "app-error-faint": errorColors[3],
  "app-error-bg": withAlpha(errorColors[2], 0.12),
  "app-error-border": withAlpha(errorColors[1], 0.22),

  "app-warning": warnColors[2],
  "app-warning-strong": warnColors[1],
  "app-warning-soft": warnColors[3],
  "app-warning-faint": warnColors[4],
  "app-warning-bg": withAlpha(warnColors[3], 0.18),
  "app-warning-border": withAlpha(warnColors[2], 0.28),

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
