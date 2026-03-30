"use client";

import Link from "next/link";
import { useEffect, useMemo, type FormEvent } from "react";
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
  type ComboboxOption,
} from "@/components/atoms";
import { useLocale } from "@/components/providers/locale-provider";
import { getCountryOptions } from "@/lib/countries";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectIsAuthenticated,
  selectRegisterState,
  setRegisterField,
  submitRegister,
} from "@/store/auth";
import sharedStyles from "../auth-panel.module.css";

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

export function AuthRegisterPanel() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { locale, messages } = useLocale();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { errors, feedback, status, values } = useAppSelector(selectRegisterState);
  const register = messages.auth.register;
  const isSubmitting = status === "loading";

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
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await dispatch(submitRegister({ locale })).unwrap();
      router.replace("/auth/login");
    } catch {
      return;
    }
  }

  if (isAuthenticated) {
    return null;
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
                autoComplete="given-name"
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
                autoComplete="family-name"
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
              autoComplete="bday"
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
              autoComplete="email"
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
            data-invalid={errors.password ? "" : undefined}
          >
            <FieldLabel htmlFor="register_password" required>
              {register.passwordLabel}
            </FieldLabel>
            <Input
              id="register_password"
              type="password"
              value={values.password}
              placeholder={register.passwordPlaceholder}
              autoComplete="new-password"
              aria-invalid={errors.password ? "true" : undefined}
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
          <p className={sharedStyles.footerText}>
            {register.haveAccount}
            <Link className={sharedStyles.footerLink} href="/auth/login">
              {register.signIn}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
