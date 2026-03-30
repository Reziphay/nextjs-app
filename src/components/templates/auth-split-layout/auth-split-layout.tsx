import type { ReactNode } from "react";
import { AuthHeader, AuthShowcasePanel } from "@/components/organisms";
import styles from "./auth-split-layout.module.css";

type AuthSplitLayoutTemplateProps = {
  children: ReactNode;
};

export function AuthSplitLayoutTemplate({
  children,
}: AuthSplitLayoutTemplateProps) {
  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <AuthHeader />
      </div>

      <section className={styles.content}>
        <div className={styles.frame}>
          <div className={styles.visualPane}>
            <AuthShowcasePanel />
          </div>

          <div className={styles.formPane}>
            <div className={styles.formPaneInner}>{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
