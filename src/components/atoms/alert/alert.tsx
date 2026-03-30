import type { HTMLAttributes } from "react";
import { Icon } from "@/components/icon";
import styles from "./alert.module.css";

type AlertVariant = "default" | "destructive" | "warning";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  icon?: string;
  variant?: AlertVariant;
};

type AlertTitleProps = HTMLAttributes<HTMLDivElement>;

type AlertDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function Alert({
  children,
  className,
  icon,
  role = "alert",
  variant = "default",
  ...props
}: AlertProps) {
  return (
    <div
      role={role}
      className={joinClassNames(styles.alert, styles[variant], className)}
      {...props}
    >
      {icon ? (
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon
            icon={icon}
            size={18}
            color="current"
            className={styles.iconGlyph}
          />
        </span>
      ) : null}

      <div className={styles.content}>{children}</div>
    </div>
  );
}

export function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <div className={joinClassNames(styles.title, className)} {...props} />
  );
}

export function AlertDescription({
  className,
  ...props
}: AlertDescriptionProps) {
  return (
    <p className={joinClassNames(styles.description, className)} {...props} />
  );
}
