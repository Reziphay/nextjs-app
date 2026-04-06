"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { selectAuthSession } from "@/store/auth";
import { useLocale } from "@/components/providers/locale-provider";
import { Icon } from "@/components/icon";
import styles from "./home-dashboard-panel.module.css";

export function HomeDashboardPanel() {
  const session = useAppSelector(selectAuthSession);
  const { messages } = useLocale();
  const db = messages.dashboard;
  const p = messages.profile;
  const user = session.user;

  const quickCards = [
    {
      href: "/home/profile",
      icon: "person",
      title: db.profile,
      description: p.description,
    },
    {
      href: "/home/settings",
      icon: "settings",
      title: db.settings,
      description: p.accountInfo,
    },
    {
      href: "/contact",
      icon: "help",
      title: db.support,
      description: p.personalInfo,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>
          {db.greeting}
          {user ? `, ${user.first_name}` : ""}
        </h1>
      </div>

      <div className={styles.cardRow}>
        {quickCards.map((card) => (
          <Link key={card.href} href={card.href} className={styles.card}>
            <Icon icon={card.icon} size={16} color="current" className={styles.cardIcon} />
            <div className={styles.cardBody}>
              <p className={styles.cardTitle}>{card.title}</p>
              <p className={styles.cardSub}>{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.contentArea} />
    </div>
  );
}
