import type { ReactNode } from "react";
import { Button } from "@/components/atoms/button";
import styles from "./page-surface-header.module.css";

type PageSurfaceHeaderProps = {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  titleAddon?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

export function PageSurfaceHeader({
  title,
  onBack,
  backLabel,
  titleAddon,
  subtitle,
  actions,
  className,
}: PageSurfaceHeaderProps) {
  return (
    <header className={joinClassNames(styles.header, className)}>
      {onBack ? (
        <Button
          variant="ghost"
          size="small"
          icon="arrow_back"
          onClick={onBack}
          aria-label={backLabel ?? title}
          className={styles.backButton}
        />
      ) : null}

      <div className={styles.meta}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {titleAddon ? <div className={styles.titleAddon}>{titleAddon}</div> : null}
        </div>
        {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      </div>

      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
