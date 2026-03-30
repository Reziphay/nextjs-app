"use client";

import { Logo } from "@/components/logo";
import styles from "./auth-showcase-panel.module.css";

export function AuthShowcasePanel() {
  return (
    <section className={styles.panel}>
      <div className={styles.logoWrap}>
        <Logo priority size={148} />
      </div>
    </section>
  );
}
