import type { CSSProperties } from "react";

// Neutral Dark
// Near-white buttons, clearly separated dark surfaces, sky-blue accent for focus/highlights only
const palette = [
  "#0a0a0a", "#1c1c1c", "#2b2b2b",  // blacks: deepest canvas → card/panel → inner surface / hover
  "#d4d4d4", "#f5f5f5", "#38bdf8",  // primaries: pressed off-white → near-white button → sky accent
  "#6b6b6b", "#a3a3a3", "#e5e5e5",  // whites: muted text → base text → strong text
];

// palette[0–2]: background ramp
export const blackColors = [palette[0], palette[1], palette[2]] as const;
// palette[3–5]: primary ramp — pressed off-white → near-white button → sky accent
export const primaryColors = [palette[3], palette[4], palette[5]] as const;
// palette[6–8]: text ramp — muted → base → strong
export const whiteColors = [palette[6], palette[7], palette[8]] as const;

export const errorColors = [
  "#7f1d1d",
  "#ef4444",
  "#f87171",
  "#fca5a5",
  "#fee2e2",
] as const;

export const warnColors = [
  "#7c2d12",
  "#c2410c",
  "#f97316",
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

// sky accent used for focus, highlights, selection — NOT for buttons
const accent = primaryColors[2]; // #38bdf8

const semanticColors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────────
  "app-bg-canvas": blackColors[0],
  "app-bg-subtle": withAlpha(whiteColors[0], 0.04),
  "app-bg-surface": blackColors[1],
  "app-bg-surface-strong": blackColors[2],
  "app-bg-surface-muted": withAlpha(whiteColors[0], 0.06),
  "app-bg-sidebar": "#050505",
  "app-bg-primary-soft": withAlpha(accent, 0.1),
  "app-bg-code": withAlpha(accent, 0.07),
  "app-bg-overlay-strong": withAlpha(blackColors[0], 0.92),
  "app-bg-overlay-soft": withAlpha(blackColors[1], 0.78),

  // ── Text ─────────────────────────────────────────────────────────────────────
  "app-text-strong": whiteColors[2],
  "app-text-base": whiteColors[1],
  "app-text-muted": whiteColors[0],
  "app-text-subtle": withAlpha(whiteColors[0], 0.55),
  "app-text-inverse": "#0a0a0a",

  // ── Borders ──────────────────────────────────────────────────────────────────
  "app-border-soft": withAlpha(whiteColors[1], 0.16),
  "app-border-strong": withAlpha(whiteColors[1], 0.28),
  "app-border-primary-soft": withAlpha(accent, 0.22),
  "app-border-primary-strong": withAlpha(accent, 0.45),

  // ── Primary ───────────────────────────────────────────────────────────────────
  "app-primary-deep": primaryColors[0],
  "app-primary": primaryColors[1],
  "app-primary-strong": primaryColors[1],
  "app-primary-soft": accent,
  "app-primary-faint": withAlpha(accent, 0.12),

  // ── Focus ────────────────────────────────────────────────────────────────────
  "app-focus-ring": withAlpha(accent, 0.4),

  // ── Shadows ──────────────────────────────────────────────────────────────────
  "app-shadow-color": withAlpha(blackColors[0], 0.6),
  "app-shadow-color-strong": withAlpha(blackColors[0], 0.8),
  "app-shadow-primary-soft": withAlpha(accent, 0.16),
  "app-shadow-primary-faint": withAlpha(accent, 0.08),
  "app-shadow-card-soft": withAlpha(blackColors[0], 0.5),

  // ── Glow ─────────────────────────────────────────────────────────────────────
  "app-glow-primary-soft": withAlpha(accent, 0.18),
  "app-glow-primary-strong": withAlpha(accent, 0.32),

  // ── Semantic states ───────────────────────────────────────────────────────────
  "app-error": errorColors[1],
  "app-error-strong": errorColors[2],
  "app-error-soft": errorColors[3],
  "app-error-faint": errorColors[4],
  "app-error-bg": withAlpha(errorColors[1], 0.15),
  "app-error-border": withAlpha(errorColors[2], 0.26),

  "app-warning": warnColors[2],
  "app-warning-strong": warnColors[3],
  "app-warning-soft": warnColors[3],
  "app-warning-faint": warnColors[4],
  "app-warning-bg": withAlpha(warnColors[2], 0.15),
  "app-warning-border": withAlpha(warnColors[2], 0.28),

  "app-success": successColors[2],
  "app-success-strong": successColors[3],
  "app-success-soft": successColors[3],
  "app-success-faint": successColors[4],
  "app-success-bg": withAlpha(successColors[2], 0.15),
  "app-success-border": withAlpha(successColors[2], 0.26),
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
