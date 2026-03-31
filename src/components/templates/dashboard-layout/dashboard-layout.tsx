import type { ReactNode } from "react";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import styles from "./dashboard-layout.module.css";

type DashboardLayoutTemplateProps = {
  children: ReactNode;
};

export function DashboardLayoutTemplate({ children }: DashboardLayoutTemplateProps) {
  return (
    <div className={styles.layout}>
      <AppSidebar />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
