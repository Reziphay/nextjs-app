"use client";

import Link from "next/link";
import { isAxiosError } from "axios";
import { useState, type FormEvent } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import { createApiClient } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/auth-flow-errors";
import { getAuthFlowMessages } from "@/lib/auth-flow-messages";
import type { ApiSuccessResponse } from "@/types";
import styles from "../auth-panel.module.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForgotPasswordPanel() {
  const { locale, messages } = useLocale();
  const copy = getAuthFlowMessages(locale).forgotPassword;
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    title: string;
    description: string;
    variant: "success" | "destructive";
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailError(null);
    setFeedback(null);

    const nextEmail = email.trim().toLowerCase();

    if (!emailPattern.test(nextEmail)) {
      setEmailError(copy.validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await createApiClient({ locale }).request<ApiSuccessResponse>({
        url: "/auth/password/forgot",
        method: "POST",
        data: {
          email: nextEmail,
        },
      });
      setFeedback({
        title: copy.successTitle,
        description: copy.successDescription,
        variant: "success",
      });
    } catch (error) {
      const description = getApiErrorMessage(
        error,
        messages.backendErrors,
        copy.errorTitle,
      );

      setFeedback({
        title: copy.errorTitle,
        description,
        variant: "destructive",
      });

      if (isAxiosError(error) && !error.response?.status) {
        setFeedback({
          title: copy.errorTitle,
          description: messages.auth.login.networkErrorDescription,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>

        {feedback ? (
          <Alert
            className={styles.feedback}
            variant={feedback.variant}
            icon={feedback.variant === "success" ? "verified" : "error"}
          >
            <AlertTitle>{feedback.title}</AlertTitle>
            <AlertDescription>{feedback.description}</AlertDescription>
          </Alert>
        ) : null}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <Field
            className={styles.fieldFull}
            data-invalid={emailError ? "" : undefined}
          >
            <FieldLabel htmlFor="forgot_password_email" required>
              {copy.emailLabel}
            </FieldLabel>
            <Input
              id="forgot_password_email"
              type="email"
              value={email}
              placeholder={copy.emailPlaceholder}
              aria-invalid={emailError ? "true" : undefined}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
            />
            {emailError ? (
              <FieldDescription>{emailError}</FieldDescription>
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
