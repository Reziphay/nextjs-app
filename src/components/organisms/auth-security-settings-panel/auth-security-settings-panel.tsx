"use client";

import Link from "next/link";
import { useState } from "react";
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
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "@/lib/auth-flow-errors";
import { getAuthFlowMessages } from "@/lib/auth-flow-messages";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAuthenticatedSession,
  selectAuthSession,
  selectRestrictionState,
} from "@/store/auth";
import type {
  ApiSuccessResponse,
  PhoneVerificationChallenge,
  TwoFactorEnrollmentResponseData,
} from "@/types";
import styles from "./auth-security-settings-panel.module.css";

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AuthSecuritySettingsPanel() {
  const dispatch = useAppDispatch();
  const { locale, messages } = useLocale();
  const copy = getAuthFlowMessages(locale).security;
  const session = useAppSelector(selectAuthSession);
  const restrictionState = useAppSelector(selectRestrictionState);
  const accessToken = session.accessToken;
  const user = session.user;
  const [feedback, setFeedback] = useState<{
    title: string;
    description: string;
    variant: "success" | "destructive";
  } | null>(null);
  const [phoneChallenge, setPhoneChallenge] =
    useState<PhoneVerificationChallenge | null>(null);
  const [phoneCode, setPhoneCode] = useState("");
  const [enrollment, setEnrollment] =
    useState<TwoFactorEnrollmentResponseData | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loadingState, setLoadingState] = useState<
    | null
    | "email"
    | "phone-request"
    | "phone-verify"
    | "2fa-start"
    | "2fa-confirm"
    | "2fa-disable"
    | "refresh"
  >(null);

  async function refreshSession() {
    if (!accessToken) {
      return;
    }

    setLoadingState("refresh");

    try {
      await dispatch(fetchAuthenticatedSession({ locale })).unwrap();
      setFeedback(null);
    } finally {
      setLoadingState(null);
    }
  }

  function buildClient() {
    return createApiClient({
      accessToken: accessToken ?? undefined,
      locale,
    });
  }

  function handleError(error: unknown, title: string, fallback: string) {
    setFeedback({
      title,
      description: getApiErrorMessage(error, messages.backendErrors, fallback),
      variant: "destructive",
    });
  }

  async function handleResendEmail() {
    if (!accessToken) {
      return;
    }

    setLoadingState("email");
    setFeedback(null);

    try {
      await buildClient().request<ApiSuccessResponse>({
        url: "/auth/email-verification/resend",
        method: "POST",
      });
      setFeedback({
        title: messages.auth.register.successTitle,
        description: getAuthFlowMessages(locale).verifyEmail.resendSuccessDescription,
        variant: "success",
      });
    } catch (error) {
      const status = getApiErrorStatus(error);

      if (status === 409) {
        await dispatch(fetchAuthenticatedSession({ locale }));
      }

      handleError(
        error,
        getAuthFlowMessages(locale).verifyEmail.resendErrorTitle,
        messages.auth.login.errorDescription,
      );
    } finally {
      setLoadingState(null);
    }
  }

  async function handleRequestPhone() {
    if (!accessToken) {
      return;
    }

    setLoadingState("phone-request");
    setFeedback(null);

    try {
      const response = await buildClient().request<
        ApiSuccessResponse<PhoneVerificationChallenge>
      >({
        url: "/auth/phone-verification/request",
        method: "POST",
      });

      if (!response.data?.data?.challenge_id || !response.data.data.expires_at) {
        throw new Error(messages.auth.login.errorDescription);
      }

      setPhoneChallenge(response.data.data);
      setFeedback({
        title: copy.challengeActive,
        description: `${copy.challengeExpires}: ${formatDateTime(
          response.data.data.expires_at,
          locale,
        )}`,
        variant: "success",
      });
    } catch (error) {
      handleError(
        error,
        copy.requestOtp,
        messages.auth.login.errorDescription,
      );
    } finally {
      setLoadingState(null);
    }
  }

  async function handleVerifyPhone() {
    if (!accessToken || !phoneChallenge) {
      return;
    }

    const nextCode = phoneCode.trim();

    if (!/^\d{6}$/.test(nextCode)) {
      setFeedback({
        title: copy.verifyPhone,
        description:
          messages.backendErrors["auth.invalid_otp"] ??
          messages.auth.login.validationErrorDescription,
        variant: "destructive",
      });
      return;
    }

    setLoadingState("phone-verify");
    setFeedback(null);

    try {
      await buildClient().request<ApiSuccessResponse>({
        url: "/auth/phone-verification/verify",
        method: "POST",
        data: {
          challenge_id: phoneChallenge.challenge_id,
          code: nextCode,
        },
      });
      setPhoneChallenge(null);
      setPhoneCode("");
      await dispatch(fetchAuthenticatedSession({ locale })).unwrap();
      setFeedback({
        title: copy.phoneVerified,
        description: copy.verificationDescription,
        variant: "success",
      });
    } catch (error) {
      handleError(
        error,
        copy.verifyPhone,
        messages.auth.login.errorDescription,
      );
    } finally {
      setLoadingState(null);
    }
  }

  async function handleStartTwoFactor() {
    if (!accessToken) {
      return;
    }

    setLoadingState("2fa-start");
    setFeedback(null);

    try {
      const response = await buildClient().request<
        ApiSuccessResponse<TwoFactorEnrollmentResponseData>
      >({
        url: "/auth/2fa/enroll",
        method: "POST",
      });

      if (!response.data?.data?.secret || !response.data.data.otp_auth_url) {
        throw new Error(messages.auth.login.errorDescription);
      }

      setEnrollment(response.data.data);
    } catch (error) {
      handleError(
        error,
        copy.twoFactorTitle,
        copy.verifyBeforeTwoFactor,
      );
    } finally {
      setLoadingState(null);
    }
  }

  async function handleConfirmTwoFactor() {
    if (!accessToken) {
      return;
    }

    if (!/^\d{6}$/.test(twoFactorCode.trim())) {
      setFeedback({
        title: copy.confirmTwoFactor,
        description:
          messages.backendErrors["auth.invalid_two_factor_code"] ??
          messages.auth.login.validationErrorDescription,
        variant: "destructive",
      });
      return;
    }

    setLoadingState("2fa-confirm");
    setFeedback(null);

    try {
      await buildClient().request<ApiSuccessResponse>({
        url: "/auth/2fa/confirm",
        method: "POST",
        data: {
          code: twoFactorCode.trim(),
        },
      });
      setEnrollment(null);
      setTwoFactorCode("");
      await dispatch(fetchAuthenticatedSession({ locale })).unwrap();
      setFeedback({
        title: copy.twoFactorEnabled,
        description: copy.twoFactorDescription,
        variant: "success",
      });
    } catch (error) {
      handleError(
        error,
        copy.confirmTwoFactor,
        messages.auth.login.errorDescription,
      );
    } finally {
      setLoadingState(null);
    }
  }

  async function handleDisableTwoFactor() {
    if (!accessToken) {
      return;
    }

    if (!/^\d{6}$/.test(twoFactorCode.trim())) {
      setFeedback({
        title: copy.disableTwoFactor,
        description:
          messages.backendErrors["auth.invalid_two_factor_code"] ??
          messages.auth.login.validationErrorDescription,
        variant: "destructive",
      });
      return;
    }

    setLoadingState("2fa-disable");
    setFeedback(null);

    try {
      await buildClient().request<ApiSuccessResponse>({
        url: "/auth/2fa/disable",
        method: "POST",
        data: {
          code: twoFactorCode.trim(),
        },
      });
      setTwoFactorCode("");
      await dispatch(fetchAuthenticatedSession({ locale })).unwrap();
      setFeedback({
        title: copy.twoFactorDisabled,
        description: copy.twoFactorDescription,
        variant: "success",
      });
    } catch (error) {
      handleError(
        error,
        copy.disableTwoFactor,
        messages.auth.login.errorDescription,
      );
    } finally {
      setLoadingState(null);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.hero}>
        <h1>{copy.pageTitle}</h1>
        <p>{copy.pageDescription}</p>
      </div>

      {restrictionState?.is_restricted ? (
        <Alert variant="warning" icon="warning">
          <AlertTitle>{copy.verificationTitle}</AlertTitle>
          <AlertDescription>{copy.verificationDescription}</AlertDescription>
        </Alert>
      ) : null}

      {feedback ? (
        <Alert
          variant={feedback.variant}
          icon={feedback.variant === "success" ? "verified" : "error"}
        >
          <AlertTitle>{feedback.title}</AlertTitle>
          <AlertDescription>{feedback.description}</AlertDescription>
        </Alert>
      ) : null}

      <div className={styles.grid}>
        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>{copy.verificationTitle}</h2>
            <p>{copy.verificationDescription}</p>
          </header>

          <div className={styles.statusRow}>
            <span
              className={styles.statusPill}
              data-tone={user?.email_verified ? "success" : "warning"}
            >
              {user?.email_verified ? copy.emailVerified : copy.emailPending}
            </span>
            <span
              className={styles.statusPill}
              data-tone={user?.phone_verified ? "success" : "warning"}
            >
              {user?.phone_verified ? copy.phoneVerified : copy.phonePending}
            </span>
          </div>

          {!user?.email_verified ? (
            <div className={styles.actions}>
              <Button
                variant="primary"
                type="button"
                isLoading={loadingState === "email"}
                onClick={handleResendEmail}
              >
                {copy.resendEmail}
              </Button>
            </div>
          ) : null}

          {user?.phone ? (
            <>
              {!user.phone_verified ? (
                <div className={styles.actions}>
                  <Button
                    variant="outline"
                    type="button"
                    isLoading={loadingState === "phone-request"}
                    onClick={handleRequestPhone}
                  >
                    {copy.requestOtp}
                  </Button>
                </div>
              ) : null}

              {phoneChallenge ? (
                <>
                  <div className={styles.meta}>
                    <span className={styles.metaLabel}>{copy.challengeExpires}</span>
                    <span className={styles.metaValue}>
                      {formatDateTime(phoneChallenge.expires_at, locale)}
                    </span>
                  </div>

                  <div className={styles.form}>
                    <Field>
                      <FieldLabel htmlFor="phone_otp_code" required>
                        {copy.phoneCodeLabel}
                      </FieldLabel>
                      <Input
                        id="phone_otp_code"
                        inputMode="numeric"
                        pattern="\d{6}"
                        value={phoneCode}
                        placeholder={copy.phoneCodePlaceholder}
                        onChange={(event) => {
                          setPhoneCode(
                            event.target.value.replace(/[^\d]/g, "").slice(0, 6),
                          );
                        }}
                      />
                      <FieldDescription>{copy.challengeActive}</FieldDescription>
                    </Field>

                    <Button
                      variant="primary"
                      type="button"
                      isLoading={loadingState === "phone-verify"}
                      onClick={handleVerifyPhone}
                    >
                      {copy.verifyPhone}
                    </Button>
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className={styles.actions}>
              <span>{copy.phoneNoNumber}</span>
              <Link className={styles.linkAction} href="/account">
                {copy.openAccount}
              </Link>
            </div>
          )}
        </article>

        <article className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>{copy.twoFactorTitle}</h2>
            <p>{copy.twoFactorDescription}</p>
          </header>

          <div className={styles.statusRow}>
            <span
              className={styles.statusPill}
              data-tone={user?.two_factor_enabled ? "success" : "warning"}
            >
              {user?.two_factor_enabled
                ? copy.twoFactorEnabled
                : copy.twoFactorDisabled}
            </span>
          </div>

          {enrollment ? (
            <>
              <div className={styles.meta}>
                <span className={styles.metaLabel}>{copy.secretLabel}</span>
                <span className={styles.metaValue}>{enrollment.secret}</span>
              </div>
              <div className={styles.meta}>
                <span className={styles.metaLabel}>{copy.otpAuthUrlLabel}</span>
                <span className={styles.metaValue}>{enrollment.otp_auth_url}</span>
              </div>
              <div className={styles.meta}>
                <span className={styles.metaLabel}>{copy.challengeExpires}</span>
                <span className={styles.metaValue}>
                  {formatDateTime(enrollment.expires_at, locale)}
                </span>
              </div>
            </>
          ) : null}

          <div className={styles.form}>
            <Field>
              <FieldLabel htmlFor="two_factor_code" required>
                {copy.twoFactorCodeLabel}
              </FieldLabel>
              <Input
                id="two_factor_code"
                inputMode="numeric"
                pattern="\d{6}"
                value={twoFactorCode}
                placeholder={copy.twoFactorCodePlaceholder}
                onChange={(event) => {
                  setTwoFactorCode(
                    event.target.value.replace(/[^\d]/g, "").slice(0, 6),
                  );
                }}
              />
            </Field>
          </div>

          <div className={styles.actions}>
            {!user?.two_factor_enabled ? (
              <>
                <Button
                  variant="outline"
                  type="button"
                  isLoading={loadingState === "2fa-start"}
                  onClick={handleStartTwoFactor}
                >
                  {copy.enableTwoFactor}
                </Button>
                {enrollment ? (
                  <Button
                    variant="primary"
                    type="button"
                    isLoading={loadingState === "2fa-confirm"}
                    onClick={handleConfirmTwoFactor}
                  >
                    {copy.confirmTwoFactor}
                  </Button>
                ) : null}
              </>
            ) : (
              <Button
                variant="destructive"
                type="button"
                isLoading={loadingState === "2fa-disable"}
                onClick={handleDisableTwoFactor}
              >
                {copy.disableTwoFactor}
              </Button>
            )}

            <Button
              variant="ghost"
              type="button"
              isLoading={loadingState === "refresh"}
              onClick={refreshSession}
            >
              {copy.refreshSession}
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}
