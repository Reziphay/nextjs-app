"use client";

import Link from "next/link";
import {
  Button,
  Field,
  FieldLabel,
  Input,
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import styles from "../auth-panel.module.css";

export function AuthLoginPanel() {
  const { messages } = useLocale();
  const login = messages.auth.login;

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>{login.title}</h1>
          <p>{login.description}</p>
        </div>

        <form className={styles.form}>
          <Field className={styles.fieldFull}>
            <FieldLabel htmlFor="email">{login.emailLabel}</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder={login.emailPlaceholder}
              autoComplete="email"
            />
          </Field>

          <Field className={styles.fieldFull}>
            <div className={styles.labelRow}>
              <FieldLabel htmlFor="password">{login.passwordLabel}</FieldLabel>
              <Button variant="link" type="button">
                {login.forgotPassword}
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder=""
              autoComplete="current-password"
            />
          </Field>

          <Button className={styles.submitButton} variant="primary">
            {login.submit}
          </Button>

          <Button className={styles.submitButton} variant="outline" type="button">
            {login.continueWithGoogle}
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {login.noAccount}
            <Link className={styles.footerLink} href="/auth/register">
              {login.signUp}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
