import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/icon";
import styles from "./button.module.css";

type ButtonVariant =
  | "primary"
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link"
  | "icon";

type ButtonSize = "small" | "medium" | "large";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  size?: ButtonSize;
  icon?: string;
  variant?: ButtonVariant;
  isLoading?: boolean;
};

const buttonIconSizes: Record<ButtonSize, number> = {
  small: 16,
  medium: 18,
  large: 20,
};

function getButtonClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  hasOnlyIcon: boolean,
  className?: string,
) {
  return [
    styles.button,
    styles[variant],
    styles[size],
    hasOnlyIcon ? styles.iconOnly : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  children,
  size = "medium",
  icon,
  variant = "default",
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const hasOnlyIcon = variant === "icon" && !children;
  const iconName = isLoading ? "progress_activity" : icon;
  const iconSize = buttonIconSizes[size];
  const isDisabled = disabled || isLoading;

  return (
    <button
      type="button"
      className={getButtonClassName(variant, size, hasOnlyIcon, className)}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...props}
    >
      <span className={styles.content}>
        {iconName ? (
          <Icon
            icon={iconName}
            size={iconSize}
            color="current"
            fill={isLoading ? false : variant === "icon"}
            className={`${styles.iconGlyph}${isLoading ? ` ${styles.spinning}` : ""}`}
          />
        ) : null}
        {children ? (
          <span className={variant === "link" ? styles.linkContent : undefined}>
            {children}
          </span>
        ) : null}
      </span>
    </button>
  );
}
