import type { HTMLAttributes } from "react";
import { Icon } from "@/components/icon";
import styles from "./badge.module.css";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
type BadgeIconPosition = "inline-start" | "inline-end";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  icon?: string;
  iconPosition?: BadgeIconPosition;
  variant?: BadgeVariant;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function Badge({
  children,
  className,
  icon,
  iconPosition = "inline-start",
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      data-icon={icon ? iconPosition : undefined}
      className={joinClassNames(styles.badge, styles[variant], className)}
      {...props}
    >
      {icon ? (
        <Icon
          icon={icon}
          size={14}
          color="current"
          className={styles.iconGlyph}
        />
      ) : null}
      <span>{children}</span>
    </span>
  );
}
