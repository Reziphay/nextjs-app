"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { selectAuthSession } from "@/store/auth";
import { useLocale } from "@/components/providers/locale-provider";
import type { Messages } from "@/i18n/config";
import styles from "./home-dashboard-panel.module.css";

type HomeDashboardPanelProps = {
  messages: Messages;
};

export function HomeDashboardPanel({ messages }: HomeDashboardPanelProps) {
  const session = useAppSelector(selectAuthSession);
  const { messages: clientMessages } = useLocale();
  const db = clientMessages.dashboard;
  const user = session.user;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>
          {db.greeting},{" "}
          <span className={styles.name}>{user?.first_name ?? ""}</span>
        </h1>
      </div>

      <div className={styles.cards}>
        <Link href="/home/profile" className={styles.card}>
          <span className={`${styles.cardIcon} material-symbols-rounded`}>person</span>
          <div>
            <p className={styles.cardTitle}>{db.profile}</p>
            <p className={styles.cardSub}>{clientMessages.profile.description}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
