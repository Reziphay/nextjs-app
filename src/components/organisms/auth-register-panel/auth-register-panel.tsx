"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Combobox,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  PasswordInput,
  type ComboboxOption,
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import {
  getStoredAccessToken,
  getStoredRefreshToken,
} from "@/lib/auth-cookies";
import { getAuthFlowMessages } from "@/lib/auth-flow-messages";
import { getCountryOptions } from "@/lib/countries";
import { getDefaultAppRouteForUserType } from "@/lib/app-routes";
import { executeRecaptcha, getRecaptchaMode } from "@/lib/recaptcha";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetRegisterState,
  selectAuthHydrated,
  selectAuthSession,
  selectIsAuthenticated,
  selectRegisterState,
  setRegisterField,
  submitRegister,
} from "@/store/auth";
import type { RegisterResponseData } from "@/types";
import sharedStyles from "../auth-panel.module.css";

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

type RegistrationCompletionState = RegisterResponseData & {
  email: string;
  phone: string;
};

export function AuthRegisterPanel() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { locale, messages } = useLocale();
  const authFlow = getAuthFlowMessages(locale);
  const hydrated = useAppSelector(selectAuthHydrated);
  const session = useAppSelector(selectAuthSession);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { errors, feedback, status, values } =
    useAppSelector(selectRegisterState);
  const register = messages.auth.register;
  const registerFlow = authFlow.register;
  const restrictionFlow = authFlow.restriction;
  const recaptchaMode = getRecaptchaMode();
  const isSubmitting = status === "loading";
  const [completion, setCompletion] =
    useState<RegistrationCompletionState | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);

  const userTypeOptions: readonly ComboboxOption[] = useMemo(
    () => [
      {
        value: "uso",
        label: register.typeUso,
        description: register.typeUsoDescription,
      },
      {
        value: "ucr",
        label: register.typeUcr,
        description: register.typeUcrDescription,
      },
    ],
    [
      register.typeUcr,
      register.typeUcrDescription,
      register.typeUso,
      register.typeUsoDescription,
    ],
  );

  const countryOptions: readonly ComboboxOption[] = useMemo(
    () => getCountryOptions(locale),
    [locale],
  );

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

    router.replace(getDefaultAppRouteForUserType(session.user?.type));
  }, [
    hydrated,
    isAuthenticated,
    router,
    session.accessToken,
    session.refreshToken,
    session.user?.type,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecaptchaError(null);

    const submittedEmail = values.email.trim().toLowerCase();
    const submittedPhone = values.phone.trim();

    try {
      const recaptchaToken = await executeRecaptcha("register");
      const payload = await dispatch(
        submitRegister({ locale, recaptchaToken }),
      ).unwrap();
      setCompletion({
        ...payload,
        email: submittedEmail,
        phone: submittedPhone,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "RECAPTCHA_UNAVAILABLE"
      ) {
        setRecaptchaError(registerFlow.recaptchaError);
      }
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

  if (completion) {
    return (
      <section className={sharedStyles.wrapper}>
        <div className={sharedStyles.card}>
          <div className={sharedStyles.cardHeader}>
            <h1>{registerFlow.successTitle}</h1>
            <p>{registerFlow.successDescription}</p>
          </div>

          <Alert variant="success" icon="verified">
            <AlertTitle>{registerFlow.restrictionTitle}</AlertTitle>
            <AlertDescription>
              {completion.restriction_state.is_restricted
                ? completion.restriction_state.missing_verifications
                    .map((entry) =>
                      entry === "email"
                        ? restrictionFlow.missingEmail
                        : restrictionFlow.missingPhone,
                    )
                    .join(", ")
                : register.successDescription}
            </AlertDescription>
          </Alert>

          <div className={sharedStyles.stack}>
            <div className={sharedStyles.metaCard}>
              <div className={sharedStyles.metaGrid}>
                <div className={sharedStyles.metaRow}>
                  <span className={sharedStyles.metaLabel}>{register.emailLabel}</span>
                  <span className={sharedStyles.metaValue}>{completion.email}</span>
                </div>
                {completion.phone ? (
                  <div className={sharedStyles.metaRow}>
                    <span className={sharedStyles.metaLabel}>
                      {registerFlow.phoneLabel}
                    </span>
                    <span className={sharedStyles.metaValue}>{completion.phone}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <ul className={sharedStyles.supportList}>
              <li className={sharedStyles.supportItem}>
                <strong>{registerFlow.successEmail}</strong>
                <span>{registerFlow.restrictionTitle}</span>
              </li>
              {completion.phone_verification ? (
                <li className={sharedStyles.supportItem}>
                  <strong>{registerFlow.successPhone}</strong>
                  <span>
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(completion.phone_verification.expires_at))}
                  </span>
                </li>
              ) : null}
            </ul>

            <div className={sharedStyles.actionRow}>
              <Link className={sharedStyles.footerLink} href="/auth/login">
                {registerFlow.loginNow}
              </Link>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setCompletion(null);
                  dispatch(resetRegisterState());
                }}
              >
                {registerFlow.createAnother}
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={sharedStyles.wrapper}>
      <div className={sharedStyles.card}>
        <div className={sharedStyles.cardHeader}>
          <h1>{register.title}</h1>
          <p>{register.description}</p>
        </div>

        {feedback ? (
          <Alert
            className={sharedStyles.feedback}
            variant={feedback.variant}
            icon="error"
          >
            <AlertTitle>{feedback.title}</AlertTitle>
            <AlertDescription>{feedback.description}</AlertDescription>
          </Alert>
        ) : null}

        {recaptchaError ? (
          <Alert className={sharedStyles.feedback} variant="warning" icon="warning">
            <AlertTitle>reCAPTCHA</AlertTitle>
            <AlertDescription>{recaptchaError}</AlertDescription>
          </Alert>
        ) : null}

        <form className={sharedStyles.form} onSubmit={handleSubmit} noValidate>
          <div className={sharedStyles.fieldGrid}>
            <Field
              className={sharedStyles.fieldFull}
              data-invalid={errors.first_name ? "" : undefined}
            >
              <FieldLabel htmlFor="first_name" required>
                {register.firstNameLabel}
              </FieldLabel>
              <Input
                id="first_name"
                value={values.first_name}
                placeholder={register.firstNamePlaceholder}
                aria-invalid={errors.first_name ? "true" : undefined}
                onChange={(event) => {
                  dispatch(
                    setRegisterField({
                      field: "first_name",
                      value: event.target.value,
                    }),
                  );
                }}
              />
              {errors.first_name ? (
                <FieldDescription>{errors.first_name}</FieldDescription>
              ) : null}
            </Field>

            <Field
              className={sharedStyles.fieldFull}
              data-invalid={errors.last_name ? "" : undefined}
            >
              <FieldLabel htmlFor="last_name" required>
                {register.lastNameLabel}
              </FieldLabel>
              <Input
                id="last_name"
                value={values.last_name}
                placeholder={register.lastNamePlaceholder}
                aria-invalid={errors.last_name ? "true" : undefined}
                onChange={(event) => {
                  dispatch(
                    setRegisterField({
                      field: "last_name",
                      value: event.target.value,
                    }),
                  );
                }}
              />
              {errors.last_name ? (
                <FieldDescription>{errors.last_name}</FieldDescription>
              ) : null}
            </Field>
          </div>

          <div className={sharedStyles.fieldGrid}>
            <Field
              className={sharedStyles.fieldFull}
              data-invalid={errors.birthday ? "" : undefined}
            >
              <FieldLabel htmlFor="birthday" required>
                {register.birthdayLabel}
              </FieldLabel>
              <Input
                id="birthday"
                type="date"
                value={values.birthday}
                max={getTodayDateValue()}
                aria-invalid={errors.birthday ? "true" : undefined}
                onChange={(event) => {
                  dispatch(
                    setRegisterField({
                      field: "birthday",
                      value: event.target.value,
                    }),
                  );
                }}
              />
              {errors.birthday ? (
                <FieldDescription>{errors.birthday}</FieldDescription>
              ) : null}
            </Field>

            <Field
              className={sharedStyles.fieldFull}
              data-invalid={errors.country ? "" : undefined}
            >
              <FieldLabel htmlFor="country" required>
                {register.countryLabel}
              </FieldLabel>
              <Combobox
                id="country"
                items={countryOptions}
                value={values.country}
                placeholder={register.countryPlaceholder}
                emptyMessage={register.noCountryResults}
                aria-invalid={errors.country ? "true" : undefined}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    dispatch(
                      setRegisterField({
                        field: "country",
                        value,
                      }),
                    );
                  }
                }}
              />
              {errors.country ? (
                <FieldDescription>{errors.country}</FieldDescription>
              ) : null}
            </Field>
          </div>

          <Field
            className={sharedStyles.fieldFull}
            data-invalid={errors.email ? "" : undefined}
          >
            <FieldLabel htmlFor="register_email" required>
              {register.emailLabel}
            </FieldLabel>
            <Input
              id="register_email"
              type="email"
              value={values.email}
              placeholder={register.emailPlaceholder}
              aria-invalid={errors.email ? "true" : undefined}
              onChange={(event) => {
                dispatch(
                  setRegisterField({
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
            className={sharedStyles.fieldFull}
            data-invalid={errors.phone ? "" : undefined}
          >
            <FieldLabel htmlFor="register_phone">
              {registerFlow.phoneLabel}
            </FieldLabel>
            <Input
              id="register_phone"
              type="tel"
              value={values.phone}
              placeholder={registerFlow.phonePlaceholder}
              aria-invalid={errors.phone ? "true" : undefined}
              onChange={(event) => {
                dispatch(
                  setRegisterField({
                    field: "phone",
                    value: event.target.value,
                  }),
                );
              }}
            />
            <FieldDescription>
              {errors.phone ?? registerFlow.phoneHint}
            </FieldDescription>
          </Field>

          <Field
            className={sharedStyles.fieldFull}
            data-invalid={errors.password ? "" : undefined}
          >
            <FieldLabel htmlFor="register_password" required>
              {register.passwordLabel}
            </FieldLabel>
            <PasswordInput
              id="register_password"
              value={values.password}
              placeholder={register.passwordPlaceholder}
              aria-invalid={errors.password ? "true" : undefined}
              showPasswordLabel={register.showPasswordLabel}
              hidePasswordLabel={register.hidePasswordLabel}
              onChange={(event) => {
                dispatch(
                  setRegisterField({
                    field: "password",
                    value: event.target.value,
                  }),
                );
              }}
            />
            <FieldDescription>
              {errors.password ?? register.passwordHint}
            </FieldDescription>
          </Field>

          <Field
            className={sharedStyles.fieldFull}
            data-invalid={errors.type ? "" : undefined}
          >
            <FieldLabel htmlFor="register_type" required>
              {register.typeLabel}
            </FieldLabel>
            <Combobox
              id="register_type"
              items={userTypeOptions}
              value={values.type}
              placeholder={register.typePlaceholder}
              emptyMessage={register.noTypeResults}
              aria-invalid={errors.type ? "true" : undefined}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  dispatch(
                    setRegisterField({
                      field: "type",
                      value,
                    }),
                  );
                }
              }}
            />
            <FieldDescription>
              {errors.type ?? register.typeDescription}
            </FieldDescription>
          </Field>

          <Alert className={sharedStyles.supportAlert} icon="warning" variant="default">
            <AlertDescription>{recaptchaDescription}</AlertDescription>
          </Alert>

          <Button
            className={sharedStyles.submitButton}
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
          >
            {isSubmitting ? register.submitting : register.submit}
          </Button>
        </form>

        <div className={sharedStyles.footer}>
          <p className={sharedStyles.footerText}>{register.termsAgreement}</p>
        </div>
      </div>
    </section>
  );
}
