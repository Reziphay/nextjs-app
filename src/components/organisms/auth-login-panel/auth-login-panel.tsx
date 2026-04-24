"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  GoogleIcon,
  Input,
  PasswordInput,
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import {
  clearAuthCookies,
  getStoredAccessToken,
  getStoredRefreshToken,
  isStoredAccessTokenExpired,
} from "@/lib/auth-cookies";
import { getAuthFlowMessages } from "@/lib/auth-flow-messages";
import { executeRecaptcha, getRecaptchaMode } from "@/lib/recaptcha";
import { getDefaultAppRouteForUserType } from "@/lib/app-routes";
import { translateBackendErrorMessage } from "@/lib/backend-errors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearLoginChallenge,
  refreshAuthToken,
  selectAuthHydrated,
  selectIsAuthenticated,
  selectAuthSession,
  selectLoginState,
  setLoginField,
  signOut,
  submitLogin,
  submitLoginTwoFactor,
} from "@/store/auth";
import styles from "../auth-panel.module.css";

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AuthLoginPanel() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { locale, messages } = useLocale();
  const authFlow = getAuthFlowMessages(locale);
  const hydrated = useAppSelector(selectAuthHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const session = useAppSelector(selectAuthSession);
  const { challenge, errors, feedback, status, values } =
    useAppSelector(selectLoginState);
  const login = messages.auth.login;
  const loginFlow = authFlow.login;
  const recaptchaMode = getRecaptchaMode();
  const isSubmitting = status === "loading";
  const defaultAppHref = getDefaultAppRouteForUserType(session.user?.type);
  const refreshingRef = useRef(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !hydrated ||
      !isAuthenticated ||
      !session.accessToken ||
      !session.refreshToken
    ) {
      return;
    }

    if (
      getStoredAccessToken() !== session.accessToken ||
      getStoredRefreshToken() !== session.refreshToken
    ) {
      return;
    }

    if (isStoredAccessTokenExpired()) {
      if (refreshingRef.current) {
        return;
      }

      refreshingRef.current = true;
      dispatch(refreshAuthToken())
        .unwrap()
        .then(() => {
          router.replace(defaultAppHref);
        })
        .catch(() => {
          clearAuthCookies();
          dispatch(signOut());
        })
        .finally(() => {
          refreshingRef.current = false;
        });
      return;
    }

    router.replace(defaultAppHref);
  }, [
    defaultAppHref,
    dispatch,
    hydrated,
    isAuthenticated,
    router,
    session.accessToken,
    session.refreshToken,
  ]);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecaptchaError(null);

    try {
      const recaptchaToken = await executeRecaptcha("login");
      const payload = await dispatch(
        submitLogin({ locale, recaptchaToken }),
      ).unwrap();

      if (payload.kind === "authenticated") {
        router.replace(getDefaultAppRouteForUserType(payload.session.user.type));
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "RECAPTCHA_UNAVAILABLE"
      ) {
        setRecaptchaError(loginFlow.recaptchaError);
      }
    }
  }

  async function handleTwoFactorSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!challenge) {
      return;
    }

    const nextCode = twoFactorCode.trim();

    if (!/^\d{6}$/.test(nextCode)) {
      setTwoFactorError(
        translateBackendErrorMessage(
          "auth.invalid_two_factor_code",
          messages.backendErrors,
        ) ?? loginFlow.twoFactorHelp,
      );
      return;
    }

    setTwoFactorError(null);

    try {
      const payload = await dispatch(
        submitLoginTwoFactor({
          locale,
          challengeId: challenge.challengeId,
          code: nextCode,
        }),
      ).unwrap();
      router.replace(getDefaultAppRouteForUserType(payload.user.type));
    } catch {
      return;
    }
  }

  if (isAuthenticated) {
    return null;
  }

  const recaptchaDescription =
    recaptchaMode === "live"
      ? authFlow.recaptcha.live
      : recaptchaMode === "development-bypass"
        ? authFlow.recaptcha.developmentBypass
        : authFlow.recaptcha.unavailable;

  if (challenge) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>{loginFlow.twoFactorTitle}</h1>
            <p>{loginFlow.twoFactorDescription}</p>
          </div>

          {feedback ? (
            <Alert
              className={styles.feedback}
              variant={feedback.variant}
              icon="error"
            >
              <AlertTitle>{feedback.title}</AlertTitle>
              <AlertDescription>{feedback.description}</AlertDescription>
            </Alert>
          ) : null}

          <form className={styles.form} onSubmit={handleTwoFactorSubmit} noValidate>
            <Field
              className={styles.fieldFull}
              data-invalid={twoFactorError ? "" : undefined}
            >
              <FieldLabel htmlFor="two_factor_code" required>
                {loginFlow.twoFactorCodeLabel}
              </FieldLabel>
              <Input
                key={challenge.challengeId}
                id="two_factor_code"
                inputMode="numeric"
                pattern="\d{6}"
                autoComplete="one-time-code"
                value={twoFactorCode}
                placeholder={loginFlow.twoFactorCodePlaceholder}
                aria-invalid={twoFactorError ? "true" : undefined}
                onChange={(event) => {
                  setTwoFactorCode(
                    event.target.value.replace(/[^\d]/g, "").slice(0, 6),
                  );
                }}
              />
              <FieldDescription>
                {twoFactorError ??
                  `${loginFlow.twoFactorHelp} ${formatDateTime(challenge.expiresAt, locale)}`}
              </FieldDescription>
            </Field>

            <Button
              className={styles.submitButton}
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
            >
              {isSubmitting
                ? loginFlow.twoFactorSubmitting
                : loginFlow.twoFactorSubmit}
            </Button>

            <Button
              className={styles.submitButton}
              variant="ghost"
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setTwoFactorCode("");
                setTwoFactorError(null);
                dispatch(clearLoginChallenge());
              }}
            >
              {loginFlow.twoFactorBack}
            </Button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1>{login.title}</h1>
          <p>{login.description}</p>
        </div>

        {feedback ? (
          <Alert
            className={styles.feedback}
            variant={feedback.variant}
            icon="error"
          >
            <AlertTitle>{feedback.title}</AlertTitle>
            <AlertDescription>{feedback.description}</AlertDescription>
          </Alert>
        ) : null}

        {recaptchaError ? (
          <Alert className={styles.feedback} variant="warning" icon="warning">
            <AlertTitle>reCAPTCHA</AlertTitle>
            <AlertDescription>{recaptchaError}</AlertDescription>
          </Alert>
        ) : null}

        <form className={styles.form} onSubmit={handleLoginSubmit} noValidate>
          <Field
            className={styles.fieldFull}
            data-invalid={errors.email ? "" : undefined}
          >
            <FieldLabel htmlFor="email" required>
              {login.emailLabel}
            </FieldLabel>
            <Input
              id="email"
              type="email"
              value={values.email}
              placeholder={login.emailPlaceholder}
              aria-invalid={errors.email ? "true" : undefined}
              onChange={(event) => {
                dispatch(
                  setLoginField({
                    field: "email",
                    value: event.target.value,
                  }),
                );
              }}
            />
            {errors.email ? (
              <FieldDescription>{errors.email}</FieldDescription>
            ) : null}
          </Field>

          <Field
            className={styles.fieldFull}
            data-invalid={errors.password ? "" : undefined}
          >
            <div className={styles.labelRow}>
              <FieldLabel htmlFor="password" required>
                {login.passwordLabel}
              </FieldLabel>
              <Link className={styles.inlineLink} href="/auth/forgot-password">
                {login.forgotPassword}
              </Link>
            </div>
            <PasswordInput
              id="password"
              value={values.password}
              placeholder={login.passwordPlaceholder}
              aria-invalid={errors.password ? "true" : undefined}
              showPasswordLabel={login.showPasswordLabel}
              hidePasswordLabel={login.hidePasswordLabel}
              onChange={(event) => {
                dispatch(
                  setLoginField({
                    field: "password",
                    value: event.target.value,
                  }),
                );
              }}
            />
            {errors.password ? (
              <FieldDescription>{errors.password}</FieldDescription>
            ) : null}
          </Field>

          <Alert className={styles.supportAlert} icon="warning" variant="default">
            <AlertDescription>{recaptchaDescription}</AlertDescription>
          </Alert>

          <Button
            className={styles.submitButton}
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
          >
            {isSubmitting ? login.submitting : login.submit}
          </Button>

          <Button
            className={styles.submitButton}
            variant="outline"
            type="button"
            disabled={isSubmitting}
            iconNode={<GoogleIcon />}
          >
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
