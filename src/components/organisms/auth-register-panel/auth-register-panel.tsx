"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "lucide-react";
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
import { getCountryOptions } from "@/lib/countries";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAuthHydrated,
  selectAuthSession,
  selectIsAuthenticated,
  selectRegisterState,
  setRegisterField,
  submitRegister,
} from "@/store/auth";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import sharedStyles from "../auth-panel.module.css";

const minimumRegisterAge = 18;
const earliestBirthday = new Date(1900, 0, 1);

function formatBirthdayInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean);

  return parts.join("-");
}

function getMaximumBirthday() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minimumRegisterAge);
  date.setHours(0, 0, 0, 0);

  return date;
}

function formatBirthdayDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());

  return `${day}-${month}-${year}`;
}

function parseBirthdayDate(value: string) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);

  if (!match) {
    return undefined;
  }

  const [, day, month, year] = match;
  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  const date = new Date(yearNumber, monthNumber - 1, dayNumber);

  if (
    date.getFullYear() !== yearNumber ||
    date.getMonth() !== monthNumber - 1 ||
    date.getDate() !== dayNumber
  ) {
    return undefined;
  }

  return date;
}

export function AuthRegisterPanel() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { locale, messages } = useLocale();
  const hydrated = useAppSelector(selectAuthHydrated);
  const session = useAppSelector(selectAuthSession);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { errors, feedback, status, values } = useAppSelector(selectRegisterState);
  const register = messages.auth.register;
  const isSubmitting = status === "loading";
  const [isBirthdayPickerOpen, setBirthdayPickerOpen] = useState(false);
  const maximumBirthday = useMemo(() => getMaximumBirthday(), []);
  const selectedBirthday = useMemo(
    () => parseBirthdayDate(values.birthday),
    [values.birthday],
  );

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

    router.replace("/");
  }, [
    hydrated,
    isAuthenticated,
    router,
    session.accessToken,
    session.refreshToken,
  ]);

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
              <div className={sharedStyles.datePickerControl}>
                <Popover
                  open={isBirthdayPickerOpen}
                  onOpenChange={setBirthdayPickerOpen}
                >
                  <PopoverTrigger
                    render={
                      <Input
                        id="birthday"
                        className={sharedStyles.datePickerInput}
                        inputMode="numeric"
                        pattern="[0-9]{2}-[0-9]{2}-[0-9]{4}"
                        placeholder="dd-mm-yyyy"
                        value={values.birthday}
                        aria-invalid={errors.birthday ? "true" : undefined}
                        autoComplete="bday"
                        onFocus={() => {
                          setBirthdayPickerOpen(true);
                        }}
                        onChange={(event) => {
                          dispatch(
                            setRegisterField({
                              field: "birthday",
                              value: formatBirthdayInput(event.target.value),
                            }),
                          );
                        }}
                      />
                    }
                  />
                  <CalendarIcon
                    className={sharedStyles.datePickerIcon}
                    aria-hidden="true"
                  />
                  <PopoverContent
                    className={sharedStyles.datePickerPopover}
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={selectedBirthday}
                      defaultMonth={selectedBirthday ?? maximumBirthday}
                      startMonth={earliestBirthday}
                      endMonth={maximumBirthday}
                      disabled={(date) =>
                        date > maximumBirthday || date < earliestBirthday
                      }
                      onSelect={(date) => {
                        if (!date) {
                          return;
                        }

                        dispatch(
                          setRegisterField({
                            field: "birthday",
                            value: formatBirthdayDate(date),
                          }),
                        );
                        setBirthdayPickerOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
