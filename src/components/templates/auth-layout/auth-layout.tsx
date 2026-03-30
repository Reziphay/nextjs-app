import type { ReactNode } from "react";
import { AuthHeader } from "@/components/organisms";
import styles from "./auth-layout.module.css";

type AuthLayoutTemplateProps = {
  children: ReactNode;
};

export function AuthLayoutTemplate({ children }: AuthLayoutTemplateProps) {
  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <AuthHeader />
      </div>

      <section className={styles.content}>
        <div className={styles.shell}>{children}</div>
      </section>
    </main>
  );
}
