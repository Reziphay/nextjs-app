import type { ReactNode } from "react";
import styles from "./form-actions.module.css";

type FormActionsProps = {
  children: ReactNode;
  layout?: "default" | "aside";
  className?: string;
};

type FormActionsSectionProps = {
  children: ReactNode;
};

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

export function FormActions({ children, layout = "default", className }: FormActionsProps) {
  return (
    <div
      className={joinClassNames(
        styles.footer,
        layout === "aside" && styles.aside,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FormActionsSpacer() {
  return <div className={styles.spacer} />;
}

export function FormActionsDanger({ children }: FormActionsSectionProps) {
  return <div className={styles.danger}>{children}</div>;
}
