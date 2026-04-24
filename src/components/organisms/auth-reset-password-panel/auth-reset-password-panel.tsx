"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  PasswordInput,
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import { createApiClient } from "@/lib/api";
import { getApiErrorStatus } from "@/lib/auth-flow-errors";
import { getAuthFlowMessages } from "@/lib/auth-flow-messages";
import type { ApiSuccessResponse } from "@/types";
import styles from "../auth-panel.module.css";

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,72}$/;

type AuthResetPasswordPanelProps = {
  initialToken?: string;
};

export function AuthResetPasswordPanel({
  initialToken = "",
}: AuthResetPasswordPanelProps) {
  const { locale, messages } = useLocale();
  const copy = getAuthFlowMessages(locale).resetPassword;
  const token = useMemo(() => initialToken.trim(), [initialToken]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [state, setState] = useState<"form" | "success" | "invalid">(
    token ? "form" : "invalid",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setConfirmError(null);

    if (!passwordPattern.test(password)) {
      setPasswordError(copy.passwordHint);
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError(copy.mismatch);
      return;
    }

    setIsSubmitting(true);

    try {
      await createApiClient({ locale }).request<ApiSuccessResponse>({
        url: "/auth/password/reset",
        method: "POST",
        data: {
          token,
          password,
        },
      });
      setState("success");
    } catch (error) {
      const status = getApiErrorStatus(error);
      if (status === 401 || status === 400) {
        setState("invalid");
      } else {
        setPasswordError(messages.auth.login.errorDescription);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (state === "success") {
    return (
      <section className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>{copy.successTitle}</h1>
            <p>{copy.successDescription}</p>
          </div>

          <Alert variant="success" icon="verified">
            <AlertTitle>{copy.successTitle}</AlertTitle>
            <AlertDescription>{copy.successDescription}</AlertDescription>
          </Alert>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              <Link className={styles.footerLink} href="/auth/login">
                {copy.backToLogin}
              </Link>
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (state === "invalid") {
    return (
      <section className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>{copy.invalidTitle}</h1>
            <p>{copy.invalidDescription}</p>
          </div>

          <Alert variant="warning" icon="warning">
            <AlertTitle>{copy.invalidTitle}</AlertTitle>
            <AlertDescription>{copy.invalidDescription}</AlertDescription>
          </Alert>

          <div className={styles.actionRow}>
            <Link className={styles.footerLink} href="/auth/forgot-password">
              {messages.auth.login.forgotPassword}
            </Link>
            <Link className={styles.footerLink} href="/auth/login">
              {copy.backToLogin}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Field
            className={styles.fieldFull}
            data-invalid={passwordError ? "" : undefined}
          >
            <FieldLabel htmlFor="reset_password" required>
              {copy.passwordLabel}
            </FieldLabel>
            <PasswordInput
              id="reset_password"
              value={password}
              placeholder={copy.passwordPlaceholder}
              aria-invalid={passwordError ? "true" : undefined}
              showPasswordLabel={messages.auth.register.showPasswordLabel}
              hidePasswordLabel={messages.auth.register.hidePasswordLabel}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
            <FieldDescription>
              {passwordError ?? copy.passwordHint}
            </FieldDescription>
          </Field>

          <Field
            className={styles.fieldFull}
            data-invalid={confirmError ? "" : undefined}
          >
            <FieldLabel htmlFor="reset_password_confirm" required>
              {copy.confirmPasswordLabel}
            </FieldLabel>
            <PasswordInput
              id="reset_password_confirm"
              value={confirmPassword}
              placeholder={copy.confirmPasswordPlaceholder}
              aria-invalid={confirmError ? "true" : undefined}
              showPasswordLabel={messages.auth.register.showPasswordLabel}
              hidePasswordLabel={messages.auth.register.hidePasswordLabel}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
            />
            {confirmError ? (
              <FieldDescription>{confirmError}</FieldDescription>
            ) : null}
          </Field>

          <Button
            className={styles.submitButton}
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
          >
            {isSubmitting ? copy.submitting : copy.submit}
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            <Link className={styles.footerLink} href="/auth/login">
              {copy.backToLogin}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
