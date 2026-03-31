"use client";

import { useLocale } from "@/components/providers/locale-provider";
import type { UserProfile } from "@/types";
import styles from "./user-profile-panel.module.css";

type UserProfilePanelProps = {
  user: UserProfile;
};

function formatDate(value: string | Date, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(locale === "az" ? "az-Latn-AZ" : locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function UserProfilePanel({ user }: UserProfilePanelProps) {
  const { messages, locale } = useLocale();
  const p = messages.profile;

  const typeLabel: Record<string, string> = {
    uso: p.typeUso,
    ucr: p.typeUcr,
    admin: p.typeAdmin,
  };

  const initials = `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <span className={styles.avatarLarge}>{initials}</span>
        <div className={styles.heroText}>
          <h1 className={styles.fullName}>
            {user.first_name} {user.last_name}
          </h1>
          <p className={styles.heroEmail}>{user.email}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{p.personalInfo}</h2>
          <dl className={styles.list}>
            <div className={styles.row}>
              <dt className={styles.label}>{p.firstName}</dt>
              <dd className={styles.value}>{user.first_name}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{p.lastName}</dt>
              <dd className={styles.value}>{user.last_name}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{p.email}</dt>
              <dd className={styles.value}>{user.email}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{p.birthday}</dt>
              <dd className={styles.value}>{formatDate(user.birthday, locale)}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{p.country}</dt>
              <dd className={styles.value}>{user.country}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{p.phone}</dt>
              <dd className={`${styles.value} ${!user.phone ? styles.valueMuted : ""}`}>
                {user.phone ?? p.phoneMissing}
              </dd>
            </div>
          </dl>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{p.accountInfo}</h2>
          <dl className={styles.list}>
            <div className={styles.row}>
              <dt className={styles.label}>{p.userType}</dt>
              <dd className={styles.value}>
                <span className={styles.typeBadge}>{typeLabel[user.type] ?? user.type}</span>
              </dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{p.email}</dt>
              <dd className={styles.value}>
                <span
                  className={`${styles.verifiedBadge} ${user.email_verified ? styles.verifiedBadgeYes : styles.verifiedBadgeNo}`}
                >
                  {user.email_verified ? p.emailVerified : p.emailNotVerified}
                </span>
              </dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{p.memberSince}</dt>
              <dd className={styles.value}>{formatDate(user.created_at, locale)}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
