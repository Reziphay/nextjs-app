import type { ReactNode } from "react";
import styles from "./form-footer.module.css";

type FormFooterProps = {
  children: ReactNode;
  layout?: "default" | "aside";
  className?: string;
};

type FormFooterSectionProps = {
  children: ReactNode;
};

function joinClassNames(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(" ");
}

export function FormFooter({ children, layout = "default", className }: FormFooterProps) {
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

export function FormFooterSpacer() {
  return <div className={styles.spacer} />;
}

export function FormFooterDanger({ children }: FormFooterSectionProps) {
  return <div className={styles.danger}>{children}</div>;
}
