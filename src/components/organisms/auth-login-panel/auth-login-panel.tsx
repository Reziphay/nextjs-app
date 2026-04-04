"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type FormEvent } from "react";
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
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectIsAuthenticated,
  selectAuthSession,
  selectLoginState,
  setLoginField,
  submitLogin,
} from "@/store/auth";
import { getDefaultAppRouteForUserType } from "@/lib/app-routes";
import styles from "../auth-panel.module.css";

export function AuthLoginPanel() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { locale, messages } = useLocale();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const session = useAppSelector(selectAuthSession);
  const { errors, feedback, status, values } = useAppSelector(selectLoginState);
  const login = messages.auth.login;
  const isSubmitting = status === "loading";
  const defaultAppHref = getDefaultAppRouteForUserType(session.user?.type);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(defaultAppHref);
    }
  }, [defaultAppHref, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const payload = await dispatch(submitLogin({ locale })).unwrap();
      router.replace(getDefaultAppRouteForUserType(payload.user.type));
    } catch {
      return;
    }
  }

  if (isAuthenticated) {
    return null;
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

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
              <Button variant="link" type="button">
                {login.forgotPassword}
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              value={values.password}
              placeholder={login.passwordPlaceholder}
              aria-invalid={errors.password ? "true" : undefined}
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
