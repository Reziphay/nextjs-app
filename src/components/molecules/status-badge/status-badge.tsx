import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/icon";
import styles from "./status-badge.module.css";

export type StatusBadgeTone = "success" | "warning" | "error" | "info" | "muted";
type StatusBadgeAppearance = "soft" | "solid" | "overlay";

type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  appearance?: StatusBadgeAppearance;
  children: ReactNode;
  icon?: string;
  tone?: StatusBadgeTone;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function StatusBadge({
  appearance = "soft",
  children,
  className,
  icon,
  tone = "info",
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={joinClassNames(styles.badge, styles[tone], styles[appearance], className)}
      {...props}
    >
      {icon ? <Icon icon={icon} size={12} color="current" className={styles.icon} /> : null}
      <span>{children}</span>
    </span>
  );
}
