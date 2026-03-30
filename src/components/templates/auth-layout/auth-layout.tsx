import type { ReactNode } from "react";
import { AuthHeader } from "@/components/organisms";
import styles from "./auth-layout.module.css";

type AuthLayoutTemplateProps = {
  children: ReactNode;
  shellVariant?: "default" | "wide";
};

export function AuthLayoutTemplate({
  children,
  shellVariant = "default",
}: AuthLayoutTemplateProps) {
  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <AuthHeader />
      </div>

      <section className={styles.content}>
        <div
          className={`${styles.shell} ${
            shellVariant === "wide" ? styles.shellWide : ""
          }`}
        >
          {children}
        </div>
      </section>
    </main>
  );
}
