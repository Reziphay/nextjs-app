import type { CSSProperties } from "react";

// Midnight Purple Sun
const palette = [
  "#000000", "#333333", "#555555",
  "#1f2041", "#4b3f72", "#ffc857",
  "#bbbbbb", "#dddddd", "#eeeeee",
];
// Blushing Fiery Cinnamon Toast
const palette5 = [
  "#8c1c13", "#8c1c13", "#8c1c13",
  "#bf4342", "#bf4342", "#bf4342",
  "#e7d7c1", "#e7d7c1", "#e7d7c1",
];
// Sweet Peachy Cream
const palette4 = [
  "#773344", "#773344", "#773344",
  "#e3b5a4", "#e3b5a4", "#e3b5a4",
  "#f5e9e2", "#f5e9e2", "#f5e9e2",
];

// Ocean Blue Serenity
const palette3 = [
  "#000000", "#333333", "#555555",
  "#427aa1", "#064789", "#ebf2fa",
  "#bbbbbb", "#dddddd", "#eeeeee",
];

const palette2 = [
  "#000000", "#333333", "#555555",
  "#156064", "#00c49a", "#f8e16c",
  "#bbbbbb", "#dddddd", "#eeeeee",
];

const palette1 = [
  "#2e3532", "#2e3532", "#2e3532",
  "#8b2635", "#8b2635", "#8b2635",
  "#e0e2db", "#e0e2db", "#e0e2db",
]



// palette[0–2]: near-black → text range (darkest, near-neutral)
export const blackColors = [palette[0], palette[1], palette[2]] as const;
// palette[3–5]: mid-tones → accent/primary range (buttons, links, active states, focus rings)
export const primaryColors = [palette[3], palette[4], palette[5]] as const;
// palette[6–8]: near-white → borders, dividers, hover tints; always alpha-over-white for large fills
export const whiteColors = [palette[6], palette[7], palette[8]] as const;

export const errorColors = [
  "#880d1e",
  "#dd2d4a",
  "#f26a8d",
  "#f49cbb",
  "#fbe1e8",
] as const;

export const warnColors = [
  "#f7b267",
  "#f79d65",
  "#f4845f",
  "#f27059",
  "#fce3cf",
] as const;

export const successColors = [
  "#073b3a",
  "#0b6e4f",
  "#08a045",
  "#6bbf59",
  "#ddf3e3",
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
  // Background — all large surfaces must be white or palette[8] at very low alpha
  // canvas: pure white — base document layer; no hue leakage on the widest surface
  "app-bg-canvas": whiteColors[1],
  // subtle: palette[8] (#ecf9ff) @ 30% — barely-there tint for inset / alternating sections
  "app-bg-subtle": withAlpha(whiteColors[2], 0.3),
  // surface: pure white — cards, panels, modals
  "app-bg-surface": "#ffffff",
  // surface-strong: pure white — elevation is expressed via shadow, not a different blue shade
  "app-bg-surface-strong": "#ffffff",
  // surface-muted: palette[8] (#ecf9ff) @ 40% — de-emphasized surface; never use palette[6/7] solidly
  "app-bg-surface-muted": withAlpha(whiteColors[2], 0.4),
  // sidebar: pure white — largest structural chrome; must have no blue saturation
  "app-bg-sidebar": "#ffffff",
  // primary-soft bg: palette[5] (#00b0fc) @ 12% — tinted well behind primary badges / selected rows
  "app-bg-primary-soft": withAlpha(primaryColors[2], 0.12),
  // code bg: palette[4] (#0286df) @ 6% — faint tint for inline code; subtle, not distracting
  "app-bg-code": withAlpha(primaryColors[1], 0.06),
  // overlay-strong: palette[8] (#ecf9ff) @ 80% — frosted-glass backdrop behind drawers / sheets
  "app-bg-overlay-strong": withAlpha(whiteColors[2], 0.8),
  // overlay-soft: palette[8] (#ecf9ff) @ 30% — soft hint behind modals; palette[8] is less saturated than palette[7]
  "app-bg-overlay-soft": withAlpha(whiteColors[2], 0.3),
  // Text — only the dark end of the ramp; text must never be a mid-tone blue
  // strong: palette[0] (#09152b) — near-black; headings, primary labels
  "app-text-strong": blackColors[0],
  // base: palette[1] (#082751) — standard body text
  "app-text-base": blackColors[1],
  // muted: palette[2] (#063977) — secondary text, captions, metadata
  "app-text-muted": blackColors[2],
  // subtle: palette[2] (#063977) @ 70% — placeholders, de-emphasized hints
  "app-text-subtle": withAlpha(blackColors[2], 0.7),
  // inverse: palette[8] (#ecf9ff) — near-white text on dark / primary-filled backgrounds
  "app-text-inverse": whiteColors[2],
  // Border — palette[6] is the designated border shade; dark-end at low alpha for neutral borders
  // soft: palette[2] (#063977) @ 14% — hairline dividers, table rows
  "app-border-soft": withAlpha(blackColors[2], 0.14),
  // strong: palette[1] (#082751) @ 22% — card strokes, input outlines
  "app-border-strong": withAlpha(blackColors[1], 0.22),
  // primary-soft: palette[6] (#76d5fe) @ 35% — border on tinted primary surfaces; lighter than palette[5]
  "app-border-primary-soft": withAlpha(primaryColors[0], 0.1),
  // primary-strong: palette[4] (#0286df) @ 34% — border on focused / active primary elements
  "app-border-primary-strong": withAlpha(primaryColors[1], 0.34),
  // Primary — restricted to actual accent usage: buttons, links, active nav, focus rings, key icons
  // deep: palette[3] (#035cc2) — pressed / hover state; darkest accent
  "app-primary-deep": primaryColors[0],
  // primary: palette[4] (#0286df) — base accent; primary buttons, links, active nav indicator
  "app-primary": primaryColors[1],
  // strong: palette[3] (#035cc2) — same as deep; high-contrast accent variant
  "app-primary-strong": primaryColors[0],
  // soft: palette[5] (#00b0fc) — lighter accent; icon fills, inline highlights, progress fill
  "app-primary-soft": primaryColors[2],
  // faint: palette[5] (#00b0fc) @ 14% — hover-state tint behind primary-adjacent elements
  "app-primary-faint": withAlpha(primaryColors[2], 0.14),
  // Focus
  // focus-ring: palette[4] (#0286df) @ 28% — keyboard focus ring; visible but not glaring
  "app-focus-ring": withAlpha(primaryColors[1], 0.28),
  // Shadow — always palette[0] (near-black) or palette[4] at low alpha; color at low alpha reads neutral
  // shadow-color: palette[0] (#09152b) @ 10% — default drop shadow
  "app-shadow-color": withAlpha(blackColors[0], 0.1),
  // shadow-color-strong: palette[0] (#09152b) @ 16% — elevated panel shadow
  "app-shadow-color-strong": withAlpha(blackColors[0], 0.16),
  // shadow-primary-soft: palette[4] (#0286df) @ 14% — colored halo on primary buttons
  "app-shadow-primary-soft": withAlpha(primaryColors[1], 0.14),
  // shadow-primary-faint: palette[5] (#00b0fc) @ 8% — ambient glow ring; barely perceptible
  "app-shadow-primary-faint": withAlpha(primaryColors[2], 0.08),
  // shadow-card-soft: palette[2] (#063977) @ 6% — card resting-state shadow
  "app-shadow-card-soft": withAlpha(blackColors[2], 0.06),
  // Glow
  // glow-primary-soft: palette[5] (#00b0fc) @ 16% — ambient glow on primary elements
  "app-glow-primary-soft": withAlpha(primaryColors[2], 0.16),
  // glow-primary-strong: palette[4] (#0286df) @ 22% — stronger glow on hover / focus states
  "app-glow-primary-strong": withAlpha(primaryColors[1], 0.22),
  // Error
  "app-error": errorColors[1],
  "app-error-strong": errorColors[0],
  "app-error-soft": errorColors[2],
  "app-error-faint": errorColors[3],
  "app-error-bg": withAlpha(errorColors[2], 0.14),
  "app-error-border": withAlpha(errorColors[1], 0.24),
  // Warning
  "app-warning": warnColors[2],
  "app-warning-strong": warnColors[3],
  "app-warning-soft": warnColors[1],
  "app-warning-faint": warnColors[0],
  "app-warning-bg": withAlpha(warnColors[0], 0.16),
  "app-warning-border": withAlpha(warnColors[2], 0.24),
  // Success
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
