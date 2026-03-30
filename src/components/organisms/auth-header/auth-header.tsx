"use client";

import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/molecules";
import styles from "./auth-header.module.css";

export function AuthHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Logo size={28} />
      </div>

      <LanguageSwitcher className={styles.switcher} variant="segmented" />
    </header>
  );
}
