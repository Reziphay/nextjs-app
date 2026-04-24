"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import { createApiClient } from "@/lib/api";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/auth-flow-errors";
import { getAuthFlowMessages } from "@/lib/auth-flow-messages";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAuthenticatedSession,
  selectAuthSession,
} from "@/store/auth";
import type { ApiSuccessResponse } from "@/types";
import styles from "../auth-panel.module.css";

type AuthEmailVerificationPanelProps = {
  initialToken?: string;
};

type VerificationState =
  | "idle"
  | "verifying"
  | "verified"
  | "invalid"
  | "already-verified";

export function AuthEmailVerificationPanel({
  initialToken = "",
}: AuthEmailVerificationPanelProps) {
  const dispatch = useAppDispatch();
  const { locale, messages } = useLocale();
  const copy = getAuthFlowMessages(locale).verifyEmail;
  const session = useAppSelector(selectAuthSession);
  const token = initialToken.trim();
  const verificationAttemptedRef = useRef(false);
  const [state, setState] = useState<VerificationState>(() => {
    if (token) {
      return "verifying";
    }

    if (session.user?.email_verified) {
      return "already-verified";
    }

    return "idle";
  });
  const [resendFeedback, setResendFeedback] = useState<{
    title: string;
    description: string;
    variant: "success" | "destructive";
  } | null>(null);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token || verificationAttemptedRef.current) {
      return;
    }

    verificationAttemptedRef.current = true;

    async function verifyToken() {
      setState("verifying");

      try {
        await createApiClient({ locale }).request<ApiSuccessResponse>({
          url: "/auth/email-verification/verify",
          method: "POST",
          data: {
            token,
          },
        });

        if (session.accessToken) {
          await dispatch(fetchAuthenticatedSession({ locale })).unwrap();
        }

        setState("verified");
      } catch {
        if (session.user?.email_verified) {
          setState("already-verified");
          return;
        }

        setState("invalid");
      }
    }

    void verifyToken();
  }, [dispatch, locale, session.accessToken, session.user?.email_verified, token]);

  async function handleResend() {
    if (!session.accessToken) {
      return;
    }

    setIsResending(true);
    setResendFeedback(null);

    try {
      await createApiClient({
        accessToken: session.accessToken,
        locale,
      }).request<ApiSuccessResponse>({
        url: "/auth/email-verification/resend",
        method: "POST",
      });
      setResendFeedback({
        title: copy.resendSuccessTitle,
        description: copy.resendSuccessDescription,
        variant: "success",
      });
    } catch (error) {
      const status = getApiErrorStatus(error);

      if (status === 409) {
        setState("already-verified");
        await dispatch(fetchAuthenticatedSession({ locale }));
      } else {
        setResendFeedback({
          title: copy.resendErrorTitle,
          description: getApiErrorMessage(
            error,
            messages.backendErrors,
            copy.invalidDescription,
          ),
          variant: "destructive",
        });
      }
    } finally {
      setIsResending(false);
    }
  }

  const showResendAction = Boolean(session.accessToken && !session.user?.email_verified);

  if (state === "verifying") {
    return (
      <section className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>{copy.verifyingTitle}</h1>
            <p>{copy.verifyingDescription}</p>
          </div>
        </div>
      </section>
    );
  }

  const heading =
    state === "verified"
      ? copy.successTitle
      : state === "already-verified"
        ? copy.alreadyVerifiedTitle
        : state === "invalid"
          ? copy.invalidTitle
          : copy.idleTitle;

  const description =
    state === "verified"
      ? copy.successDescription
      : state === "already-verified"
        ? copy.alreadyVerifiedDescription
        : state === "invalid"
          ? copy.invalidDescription
          : copy.idleDescription;

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>{heading}</h1>
          <p>{description}</p>
        </div>

        <Alert
          variant={
            state === "verified" || state === "already-verified"
              ? "success"
              : state === "invalid"
                ? "warning"
                : "default"
          }
          icon={
            state === "verified" || state === "already-verified"
              ? "verified"
              : state === "invalid"
                ? "warning"
                : "help"
          }
        >
          <AlertTitle>{heading}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>

        {resendFeedback ? (
          <Alert
            className={styles.feedback}
            variant={resendFeedback.variant}
            icon={resendFeedback.variant === "success" ? "verified" : "error"}
          >
            <AlertTitle>{resendFeedback.title}</AlertTitle>
            <AlertDescription>{resendFeedback.description}</AlertDescription>
          </Alert>
        ) : null}

        <div className={styles.actionRow}>
          {showResendAction ? (
            <Button
              variant="primary"
              type="button"
              isLoading={isResending}
              onClick={handleResend}
            >
              {isResending ? copy.resending : copy.resend}
            </Button>
          ) : null}

          {session.accessToken ? (
            <Link className={styles.footerLink} href="/settings">
              {copy.openSettings}
            </Link>
          ) : (
            <Link className={styles.footerLink} href="/auth/login">
              {copy.goToLogin}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
