import type { CSSProperties } from "react";

type IconColor = "primary" | "white" | "black" | "success" | "warn" | "error" | "errror";

type IconProps = {
  icon: string;
  size?: number;
  color?: IconColor;
  fill?: boolean;
};

const iconColorMap: Record<IconColor, string> = {
  primary: "var(--app-primary)",
  white: "var(--color-white-3)",
  black: "var(--color-black-1)",
  success: "var(--app-success)",
  warn: "var(--app-warning)",
  error: "var(--app-error)",
  errror: "var(--app-error)",
};

export function Icon({
  icon,
  size = 24,
  color = "black",
  fill = false,
}: IconProps) {
  const style = {
    fontSize: `${size}px`,
    color: iconColorMap[color],
    fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${Math.max(20, Math.round(size))}`,
  } satisfies CSSProperties;

  return (
    <span
      aria-hidden="true"
      className="material-symbols-rounded iconGlyph"
      style={style}
    >
      {icon}
    </span>
  );
}
