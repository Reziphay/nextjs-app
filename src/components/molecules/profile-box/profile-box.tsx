"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./profile-box.module.css";

type ProfileBoxProps = {
  userId?: string;
  name: string;
  avatar: string;
  label?: string;
  subtitle?: string;
  className?: string;
};

export function ProfileBox({
  userId,
  name,
  avatar,
  label,
  subtitle,
  className,
}: ProfileBoxProps) {
  const href = userId ? `/account?id=${userId}` : null;
  const content = (
    <>
      <Image
        src={avatar}
        alt={name}
        width={48}
        height={48}
        className={styles.avatar}
      />
      <div className={styles.meta}>
        {label ? <span className={styles.label}>{label}</span> : null}
        <span className={styles.name}>{name}</span>
        {subtitle ? <span className={styles.subtitle}>{subtitle}</span> : null}
      </div>
    </>
  );

  if (!href) {
    return <div className={`${styles.box} ${className ?? ""}`.trim()}>{content}</div>;
  }

  return (
    <Link
      href={href}
      className={`${styles.box} ${styles.clickable} ${className ?? ""}`.trim()}
      onClick={(event) => {
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
      }}
      title={name}
    >
      {content}
    </Link>
  );
}
