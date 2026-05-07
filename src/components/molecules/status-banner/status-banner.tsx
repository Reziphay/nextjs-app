import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/icon";
import styles from "./status-banner.module.css";

export type StatusBannerVariant = "success" | "warning" | "error" | "info" | "muted";

type StatusBannerProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  children: ReactNode;
  icon?: string;
  variant?: StatusBannerVariant;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function StatusBanner({
  children,
  className,
  icon,
  role,
  variant = "info",
  ...props
}: StatusBannerProps) {
  return (
    <div
      role={role ?? (variant === "error" ? "alert" : "status")}
      className={joinClassNames(styles.banner, styles[variant], className)}
      {...props}
    >
      {icon ? (
        <Icon icon={icon} size={15} color="current" className={styles.icon} />
      ) : null}
      <span>{children}</span>
    </div>
  );
}
