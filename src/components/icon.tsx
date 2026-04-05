import type { CSSProperties } from "react";

type IconColor =
  | "primary"
  | "white"
  | "black"
  | "success"
  | "warn"
  | "error"
  | "errror"
  | "current";

type IconProps = {
  icon: string;
  size?: number;
  color?: IconColor;
  fill?: boolean;
  className?: string;
};

const iconColorMap: Record<IconColor, string> = {
  primary: "var(--app-primary)",
  white: "var(--color-white-3)",
  black: "var(--color-black-1)",
  success: "var(--app-success)",
  warn: "var(--app-warning)",
  error: "var(--app-error)",
  errror: "var(--app-error)",
  current: "currentColor",
};

export function Icon({
  icon,
  size = 16,
  color = "black",
  fill = false,
  className,
}: IconProps) {
  const resolvedSize = Math.max(12, Math.round(size * 0.85));

  const style = {
    fontSize: `${resolvedSize}px`,
    color: iconColorMap[color],
    fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${Math.max(20, resolvedSize)}`,
  } satisfies CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={`material-symbols-rounded iconGlyph${className ? ` ${className}` : ""}`}
      style={style}
    >
      {icon}
    </span>
  );
}
