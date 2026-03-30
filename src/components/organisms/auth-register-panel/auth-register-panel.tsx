"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { useMemo, useReducer, type FormEvent } from "react";
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
import type { Messages } from "@/i18n/config";
import { createApiClient } from "@/lib/api";
import { getCountryOptions } from "@/lib/countries";
import {
  isRegisterUserType,
  type RegisterFormValues,
  type RegisterRequestBody,
  type RegisterUserType,
} from "@/types";
import sharedStyles from "../auth-panel.module.css";

type RegisterMessages = Messages["auth"]["register"];

type RegisterFormState = Omit<RegisterFormValues, "type"> & {
  type: RegisterUserType | "";
};

type RegisterFieldName = keyof RegisterFormState;

type RegisterFieldErrors = Partial<Record<RegisterFieldName, string>>;

type RegisterFeedback = {
  description: string;
  title: string;
  variant: "destructive";
} | null;

type RegisterState = {
  errors: RegisterFieldErrors;
  feedback: RegisterFeedback;
  isSubmitting: boolean;
  values: RegisterFormState;
};

type RegisterAction =
  | {
      field: RegisterFieldName;
      type: "field_changed";
      value: RegisterFormState[RegisterFieldName];
    }
  | {
      errors: RegisterFieldErrors;
      feedback: Exclude<RegisterFeedback, null>;
      type: "validation_failed";
    }
  | {
      type: "submit_started";
    }
  | {
      feedback: Exclude<RegisterFeedback, null>;
      type: "submit_failed";
    };

const registerEndpoint = "/auth/register";
const invalidRegisterResponseError = "INVALID_REGISTER_RESPONSE";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialFormState: RegisterFormState = {
  first_name: "",
  last_name: "",
  birthday: "",
  country: "",
  email: "",
  password: "",
  type: "",
};

const initialRegisterState: RegisterState = {
  errors: {},
  feedback: null,
  isSubmitting: false,
  values: initialFormState,
};

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeRegisterState(
  values: RegisterFormState,
): RegisterFormState {
  return {
    ...values,
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    birthday: values.birthday.trim(),
    country: values.country.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
  };
}

function registerReducer(
  state: RegisterState,
  action: RegisterAction,
): RegisterState {
  switch (action.type) {
    case "field_changed": {
      const nextErrors = { ...state.errors };
      delete nextErrors[action.field];

      return {
        ...state,
        errors: nextErrors,
        feedback: null,
        values: {
          ...state.values,
          [action.field]: action.value,
        },
      };
    }

    case "validation_failed":
      return {
        ...state,
        errors: action.errors,
        feedback: action.feedback,
        isSubmitting: false,
      };

    case "submit_started":
      return {
        ...state,
        feedback: null,
        isSubmitting: true,
      };

    case "submit_failed":
      return {
        ...state,
        feedback: action.feedback,
        isSubmitting: false,
      };

    default:
      return state;
  }
}

function normalizeErrorMessage(
  message: string | string[] | undefined,
) {
  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return message;
}

function getRegisterErrorFeedback(
  error: unknown,
  register: RegisterMessages,
): Exclude<RegisterFeedback, null> {
  if (
    error instanceof Error &&
    error.message === invalidRegisterResponseError
  ) {
    return {
      title: register.errorTitle,
      description: register.configurationErrorDescription,
      variant: "destructive",
    };
  }

  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const status = error.response?.status;
    const apiMessage = normalizeErrorMessage(error.response?.data?.message);

    if (!status) {
      return {
        title: register.errorTitle,
        description: register.networkErrorDescription,
        variant: "destructive",
      };
    }

    const descriptionByStatus: Record<number, string> = {
      400: register.badRequestDescription,
      401: register.unauthorizedDescription,
      403: register.forbiddenDescription,
      404: register.notFoundDescription,
      409: register.conflictDescription,
      422: register.unprocessableEntityDescription,
      429: register.rateLimitedDescription,
    };

    return {
      title: register.errorTitle,
      description:
        apiMessage ??
        descriptionByStatus[status] ??
        (status >= 500
          ? register.serverErrorDescription
          : register.errorDescription),
      variant: "destructive",
    };
  }

  return {
    title: register.errorTitle,
    description: register.errorDescription,
    variant: "destructive",
  };
}

export function AuthRegisterPanel() {
  const { locale, messages } = useLocale();
  const router = useRouter();
  const register = messages.auth.register;
  const [state, dispatch] = useReducer(registerReducer, initialRegisterState);
  const { errors: fieldErrors, feedback, isSubmitting, values: formValues } =
    state;

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

  const countryValues = useMemo(
    () => new Set(countryOptions.map((country) => country.value)),
    [countryOptions],
  );

  function setFieldValue<Key extends RegisterFieldName>(
    field: Key,
    value: RegisterFormState[Key],
  ) {
    dispatch({
      type: "field_changed",
      field,
      value,
    });
  }

  function validate(values: RegisterFormState): RegisterFieldErrors {
    const errors: RegisterFieldErrors = {};

    if (!values.first_name) {
      errors.first_name = register.requiredMessage;
    }

    if (!values.last_name) {
      errors.last_name = register.requiredMessage;
    }

    if (!values.birthday) {
      errors.birthday = register.birthdayRequiredMessage;
    }

    if (!values.country) {
      errors.country = register.requiredMessage;
    } else if (!countryValues.has(values.country)) {
      errors.country = register.requiredMessage;
    }

    if (!values.email) {
      errors.email = register.requiredMessage;
    } else if (!emailPattern.test(values.email)) {
      errors.email = register.emailInvalidMessage;
    }

    if (!values.password) {
      errors.password = register.requiredMessage;
    } else if (values.password.length < 8) {
      errors.password = register.passwordInvalidMessage;
    }

    if (!values.type) {
      errors.type = register.typeRequiredMessage;
    } else if (!isRegisterUserType(values.type)) {
      errors.type = register.typeRequiredMessage;
    }

    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedValues = normalizeRegisterState(formValues);
    const nextErrors = validate(normalizedValues);

    if (Object.keys(nextErrors).length > 0) {
      dispatch({
        type: "validation_failed",
        errors: nextErrors,
        feedback: {
          title: register.errorTitle,
          description: register.validationErrorDescription,
          variant: "destructive",
        },
      });
      return;
    }

    dispatch({ type: "submit_started" });

    try {
      const client = createApiClient({ locale });
      const response = await client.request({
        url: registerEndpoint,
        method: "POST",
        data: {
          first_name: normalizedValues.first_name,
          last_name: normalizedValues.last_name,
          birthday: normalizedValues.birthday,
          country: normalizedValues.country,
          email: normalizedValues.email,
          password: normalizedValues.password,
          type: normalizedValues.type as RegisterUserType,
        } satisfies RegisterRequestBody,
      });

      const contentType = String(response.headers["content-type"] ?? "");

      if (contentType.includes("text/html")) {
        throw new Error(invalidRegisterResponseError);
      }

      router.replace("/auth/login");
    } catch (error) {
      dispatch({
        type: "submit_failed",
        feedback: getRegisterErrorFeedback(error, register),
      });
    }
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
              data-invalid={fieldErrors.first_name ? "" : undefined}
            >
              <FieldLabel htmlFor="first_name" required>
                {register.firstNameLabel}
              </FieldLabel>
              <Input
                id="first_name"
                value={formValues.first_name}
                placeholder={register.firstNamePlaceholder}
                autoComplete="given-name"
                aria-invalid={fieldErrors.first_name ? "true" : undefined}
                onChange={(event) => {
                  setFieldValue("first_name", event.target.value);
                }}
              />
              {fieldErrors.first_name ? (
                <FieldDescription>{fieldErrors.first_name}</FieldDescription>
              ) : null}
            </Field>

            <Field
              className={sharedStyles.fieldFull}
              data-invalid={fieldErrors.last_name ? "" : undefined}
            >
              <FieldLabel htmlFor="last_name" required>
                {register.lastNameLabel}
              </FieldLabel>
              <Input
                id="last_name"
                value={formValues.last_name}
                placeholder={register.lastNamePlaceholder}
                autoComplete="family-name"
                aria-invalid={fieldErrors.last_name ? "true" : undefined}
                onChange={(event) => {
                  setFieldValue("last_name", event.target.value);
                }}
              />
              {fieldErrors.last_name ? (
                <FieldDescription>{fieldErrors.last_name}</FieldDescription>
              ) : null}
            </Field>
          </div>

          <Field
            className={sharedStyles.fieldFull}
            data-invalid={fieldErrors.birthday ? "" : undefined}
          >
            <FieldLabel htmlFor="birthday" required>
              {register.birthdayLabel}
            </FieldLabel>
            <Input
              id="birthday"
              type="date"
              value={formValues.birthday}
              max={getTodayDateValue()}
              autoComplete="bday"
              aria-invalid={fieldErrors.birthday ? "true" : undefined}
              onChange={(event) => {
                setFieldValue("birthday", event.target.value);
              }}
            />
            {fieldErrors.birthday ? (
              <FieldDescription>{fieldErrors.birthday}</FieldDescription>
            ) : null}
          </Field>

          <Field
            className={sharedStyles.fieldFull}
            data-invalid={fieldErrors.country ? "" : undefined}
          >
            <FieldLabel htmlFor="country" required>
              {register.countryLabel}
            </FieldLabel>
            <Combobox
              id="country"
              items={countryOptions}
              value={formValues.country}
              placeholder={register.countryPlaceholder}
              emptyMessage={register.noCountryResults}
              aria-invalid={fieldErrors.country ? "true" : undefined}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  setFieldValue("country", value);
                }
              }}
            />
            {fieldErrors.country ? (
              <FieldDescription>{fieldErrors.country}</FieldDescription>
            ) : null}
          </Field>

          <Field
            className={sharedStyles.fieldFull}
            data-invalid={fieldErrors.email ? "" : undefined}
          >
            <FieldLabel htmlFor="register_email" required>
              {register.emailLabel}
            </FieldLabel>
            <Input
              id="register_email"
              type="email"
              value={formValues.email}
              placeholder={register.emailPlaceholder}
              autoComplete="email"
              aria-invalid={fieldErrors.email ? "true" : undefined}
              onChange={(event) => {
                setFieldValue("email", event.target.value);
              }}
            />
            {fieldErrors.email ? (
              <FieldDescription>{fieldErrors.email}</FieldDescription>
            ) : null}
          </Field>

          <Field
            className={sharedStyles.fieldFull}
            data-invalid={fieldErrors.password ? "" : undefined}
          >
            <FieldLabel htmlFor="register_password" required>
              {register.passwordLabel}
            </FieldLabel>
            <Input
              id="register_password"
              type="password"
              value={formValues.password}
              placeholder={register.passwordPlaceholder}
              autoComplete="new-password"
              aria-invalid={fieldErrors.password ? "true" : undefined}
              onChange={(event) => {
                setFieldValue("password", event.target.value);
              }}
            />
            <FieldDescription>
              {fieldErrors.password ?? register.passwordHint}
            </FieldDescription>
          </Field>

          <Field
            className={sharedStyles.fieldFull}
            data-invalid={fieldErrors.type ? "" : undefined}
          >
            <FieldLabel htmlFor="register_type" required>
              {register.typeLabel}
            </FieldLabel>
            <Combobox
              id="register_type"
              items={userTypeOptions}
              value={formValues.type}
              placeholder={register.typePlaceholder}
              emptyMessage={register.noTypeResults}
              aria-invalid={fieldErrors.type ? "true" : undefined}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  setFieldValue("type", value as RegisterFormState["type"]);
                }
              }}
            />
            <FieldDescription>
              {fieldErrors.type ?? register.typeDescription}
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
