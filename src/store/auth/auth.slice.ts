import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getMessages, type Locale } from "@/i18n/config";
import { createApiClient } from "@/lib/api";
import {
  isRegisterUserType,
  type ApiSuccessResponse,
  type AuthTokens,
  type AuthenticatedUser,
  type LoginFormValues,
  type LoginResponseData,
  type RegisterFormValues,
  type RegisterResponseData,
  type RegisterUserType,
} from "@/types";
import type { RootState } from "@/store";

const authLoginEndpoint = "/auth/login";
const authMeEndpoint = "/auth/me";
const authRefreshEndpoint = "/auth/refresh";
const authRegisterEndpoint = "/auth/register";
const invalidApiResponseError = "INVALID_AUTH_API_RESPONSE";
const minimumRegisterAge = 13;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const registerPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,72}$/;
const loginFieldNames = ["email", "password"] as const;
const registerFieldNames = [
  "first_name",
  "last_name",
  "birthday",
  "country",
  "email",
  "password",
  "type",
] as const;

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";

type AuthFeedback = {
  title: string;
  description: string;
  variant: "destructive";
} | null;

type LoginMessages = ReturnType<typeof getMessages>["auth"]["login"];
type RegisterMessages = ReturnType<typeof getMessages>["auth"]["register"];
type LoginFieldName = keyof LoginFormValues;
type RegisterFormDraft = Omit<RegisterFormValues, "type"> & {
  type: RegisterUserType | "";
};
type RegisterFieldName = keyof RegisterFormDraft;
type LoginFieldErrors = Partial<Record<LoginFieldName, string>>;
type RegisterFieldErrors = Partial<Record<RegisterFieldName, string>>;
type ApiFieldError = {
  field?: string;
  message?: string;
};
type ApiErrorResponse = {
  message?: string | string[];
  errors?: ApiFieldError[];
};
type ThunkReject<TField extends string> = {
  feedback: Exclude<AuthFeedback, null>;
  fieldErrors?: Partial<Record<TField, string>>;
};
type FormState<TValues, TField extends string> = {
  values: TValues;
  errors: Partial<Record<TField, string>>;
  feedback: AuthFeedback;
  status: RequestStatus;
};

export type PersistedAuthSession = {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: "anonymous" | "authenticated";
};

type AuthState = {
  login: FormState<LoginFormValues, LoginFieldName>;
  register: FormState<RegisterFormDraft, RegisterFieldName>;
  session: PersistedAuthSession & {
    hydrated: boolean;
  };
};

function createInitialLoginValues(): LoginFormValues {
  return {
    email: "",
    password: "",
  };
}

function createInitialRegisterValues(): RegisterFormDraft {
  return {
    first_name: "",
    last_name: "",
    birthday: "",
    country: "",
    email: "",
    password: "",
    type: "",
  };
}

function createInitialSessionState(): AuthState["session"] {
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    status: "anonymous",
    hydrated: false,
  };
}

const initialState: AuthState = {
  login: {
    values: createInitialLoginValues(),
    errors: {},
    feedback: null,
    status: "idle",
  },
  register: {
    values: createInitialRegisterValues(),
    errors: {},
    feedback: null,
    status: "idle",
  },
  session: createInitialSessionState(),
};

function normalizeErrorMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return message;
}

function mapApiFieldErrors<TField extends string>(
  errors: ApiFieldError[] | undefined,
  allowedFields: readonly TField[],
) {
  const nextErrors: Partial<Record<TField, string>> = {};

  for (const entry of errors ?? []) {
    if (!entry.field || !entry.message) {
      continue;
    }

    if (allowedFields.includes(entry.field as TField)) {
      nextErrors[entry.field as TField] = entry.message;
    }
  }

  return nextErrors;
}

function normalizeLoginValues(values: LoginFormValues): LoginFormValues {
  return {
    email: values.email.trim().toLowerCase(),
    password: values.password,
  };
}

function normalizeRegisterValues(values: RegisterFormDraft): RegisterFormDraft {
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

function isAtLeastMinimumAge(dateValue: string, minimumAge: number) {
  const timestamp = new Date(dateValue).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  const now = Date.now();
  const age = (now - timestamp) / (1000 * 60 * 60 * 24 * 365.25);

  return age >= minimumAge;
}

function validateLoginForm(
  values: LoginFormValues,
  messages: LoginMessages,
): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  if (!values.email) {
    errors.email = messages.requiredMessage;
  } else if (!emailPattern.test(values.email)) {
    errors.email = messages.emailInvalidMessage;
  }

  if (!values.password) {
    errors.password = messages.passwordRequiredMessage;
  }

  return errors;
}

function validateRegisterForm(
  values: RegisterFormDraft,
  messages: RegisterMessages,
): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};

  if (!values.first_name) {
    errors.first_name = messages.requiredMessage;
  } else if (values.first_name.length < 2) {
    errors.first_name = messages.firstNameInvalidMessage;
  }

  if (!values.last_name) {
    errors.last_name = messages.requiredMessage;
  } else if (values.last_name.length < 2) {
    errors.last_name = messages.lastNameInvalidMessage;
  }

  if (!values.birthday) {
    errors.birthday = messages.birthdayRequiredMessage;
  } else if (!isAtLeastMinimumAge(values.birthday, minimumRegisterAge)) {
    errors.birthday = messages.birthdayAgeMessage;
  }

  if (!values.country) {
    errors.country = messages.requiredMessage;
  }

  if (!values.email) {
    errors.email = messages.requiredMessage;
  } else if (!emailPattern.test(values.email)) {
    errors.email = messages.emailInvalidMessage;
  }

  if (!values.password) {
    errors.password = messages.requiredMessage;
  } else if (!registerPasswordPattern.test(values.password)) {
    errors.password = messages.passwordInvalidMessage;
  }

  if (!values.type || !isRegisterUserType(values.type)) {
    errors.type = messages.typeRequiredMessage;
  }

  return errors;
}

function getLoginErrorResult(
  error: unknown,
  messages: LoginMessages,
): ThunkReject<LoginFieldName> {
  if (error instanceof Error && error.message === invalidApiResponseError) {
    return {
      feedback: {
        title: messages.errorTitle,
        description: messages.configurationErrorDescription,
        variant: "destructive",
      },
    };
  }

  if (isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    const apiMessage = normalizeErrorMessage(error.response?.data?.message);
    const fieldErrors = mapApiFieldErrors(
      error.response?.data?.errors,
      loginFieldNames,
    );

    if (!status) {
      return {
        feedback: {
          title: messages.errorTitle,
          description: messages.networkErrorDescription,
          variant: "destructive",
        },
      };
    }

    if (status === 400 && Object.keys(fieldErrors).length > 0) {
      return {
        feedback: {
          title: messages.errorTitle,
          description: apiMessage ?? messages.validationErrorDescription,
          variant: "destructive",
        },
        fieldErrors,
      };
    }

    const descriptionByStatus: Record<number, string> = {
      400: messages.badRequestDescription,
      401: messages.unauthorizedDescription,
      403: messages.forbiddenDescription,
      404: messages.notFoundDescription,
      429: messages.rateLimitedDescription,
    };

    return {
      feedback: {
        title: messages.errorTitle,
        description:
          apiMessage ??
          descriptionByStatus[status] ??
          (status >= 500
            ? messages.serverErrorDescription
            : messages.errorDescription),
        variant: "destructive",
      },
    };
  }

  return {
    feedback: {
      title: messages.errorTitle,
      description: messages.errorDescription,
      variant: "destructive",
    },
  };
}

function getRegisterErrorResult(
  error: unknown,
  messages: RegisterMessages,
): ThunkReject<RegisterFieldName> {
  if (error instanceof Error && error.message === invalidApiResponseError) {
    return {
      feedback: {
        title: messages.errorTitle,
        description: messages.configurationErrorDescription,
        variant: "destructive",
      },
    };
  }

  if (isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    const apiMessage = normalizeErrorMessage(error.response?.data?.message);
    const fieldErrors = mapApiFieldErrors(
      error.response?.data?.errors,
      registerFieldNames,
    );

    if (!status) {
      return {
        feedback: {
          title: messages.errorTitle,
          description: messages.networkErrorDescription,
          variant: "destructive",
        },
      };
    }

    if (status === 400 && Object.keys(fieldErrors).length > 0) {
      return {
        feedback: {
          title: messages.errorTitle,
          description: apiMessage ?? messages.validationErrorDescription,
          variant: "destructive",
        },
        fieldErrors,
      };
    }

    const descriptionByStatus: Record<number, string> = {
      400: messages.badRequestDescription,
      401: messages.unauthorizedDescription,
      403: messages.forbiddenDescription,
      404: messages.notFoundDescription,
      409: messages.conflictDescription,
      422: messages.unprocessableEntityDescription,
      429: messages.rateLimitedDescription,
    };

    return {
      feedback: {
        title: messages.errorTitle,
        description:
          apiMessage ??
          descriptionByStatus[status] ??
          (status >= 500
            ? messages.serverErrorDescription
            : messages.errorDescription),
        variant: "destructive",
      },
      fieldErrors:
        Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }

  return {
    feedback: {
      title: messages.errorTitle,
      description: messages.errorDescription,
      variant: "destructive",
    },
  };
}

export const submitLogin = createAsyncThunk<
  LoginResponseData,
  { locale: Locale },
  { state: RootState; rejectValue: ThunkReject<LoginFieldName> }
>("auth/submitLogin", async ({ locale }, thunkApi) => {
  const messages = getMessages(locale).auth.login;
  const values = normalizeLoginValues(thunkApi.getState().auth.login.values);
  const fieldErrors = validateLoginForm(values, messages);

  if (Object.keys(fieldErrors).length > 0) {
    return thunkApi.rejectWithValue({
      feedback: {
        title: messages.errorTitle,
        description: messages.validationErrorDescription,
        variant: "destructive",
      },
      fieldErrors,
    });
  }

  try {
    const client = createApiClient({ locale });
    const loginResponse = await client.request<ApiSuccessResponse<AuthTokens>>({
      url: authLoginEndpoint,
      method: "POST",
      data: values,
    });
    const contentType = String(loginResponse.headers["content-type"] ?? "");
    const tokens = loginResponse.data?.data;

    if (
      contentType.includes("text/html") ||
      !tokens?.access_token ||
      !tokens?.refresh_token
    ) {
      throw new Error(invalidApiResponseError);
    }

    const meClient = createApiClient({ accessToken: tokens.access_token });
    const meResponse = await meClient.request<ApiSuccessResponse<{ user: AuthenticatedUser }>>({
      url: authMeEndpoint,
      method: "GET",
      headers: { "Cache-Control": "no-cache" },
    });
    const user = meResponse.data?.data?.user;

    if (!user?.id || !user?.email) {
      throw new Error(invalidApiResponseError);
    }

    return {
      user,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  } catch (error) {
    return thunkApi.rejectWithValue(getLoginErrorResult(error, messages));
  }
});

export const submitRegister = createAsyncThunk<
  void,
  { locale: Locale },
  { state: RootState; rejectValue: ThunkReject<RegisterFieldName> }
>("auth/submitRegister", async ({ locale }, thunkApi) => {
  const messages = getMessages(locale).auth.register;
  const values = normalizeRegisterValues(thunkApi.getState().auth.register.values);
  const fieldErrors = validateRegisterForm(values, messages);

  if (Object.keys(fieldErrors).length > 0) {
    return thunkApi.rejectWithValue({
      feedback: {
        title: messages.errorTitle,
        description: messages.validationErrorDescription,
        variant: "destructive",
      },
      fieldErrors,
    });
  }

  try {
    const client = createApiClient({ locale });
    const response = await client.request<
      ApiSuccessResponse<RegisterResponseData>
    >({
      url: authRegisterEndpoint,
      method: "POST",
      data: {
        first_name: values.first_name,
        last_name: values.last_name,
        birthday: values.birthday,
        country: values.country,
        email: values.email,
        password: values.password,
        type: values.type as RegisterUserType,
      },
    });
    const contentType = String(response.headers["content-type"] ?? "");

    if (contentType.includes("text/html") || response.data?.success !== true) {
      throw new Error(invalidApiResponseError);
    }
  } catch (error) {
    return thunkApi.rejectWithValue(getRegisterErrorResult(error, messages));
  }
});

export const refreshAuthToken = createAsyncThunk<
  AuthTokens,
  void,
  { state: RootState }
>("auth/refreshToken", async (_, thunkApi) => {
  const { refreshToken } = thunkApi.getState().auth.session;

  if (!refreshToken) {
    return thunkApi.rejectWithValue(null);
  }

  try {
    const client = createApiClient();
    const response = await client.request<ApiSuccessResponse<AuthTokens>>({
      url: authRefreshEndpoint,
      method: "POST",
      data: { refresh_token: refreshToken },
    });
    const tokens = response.data?.data;

    if (!tokens?.access_token || !tokens?.refresh_token) {
      return thunkApi.rejectWithValue(null);
    }

    return tokens;
  } catch {
    return thunkApi.rejectWithValue(null);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoginField(
      state,
      action: PayloadAction<{ field: LoginFieldName; value: string }>,
    ) {
      state.login.values[action.payload.field] = action.payload.value;
      delete state.login.errors[action.payload.field];
      state.login.feedback = null;
      if (state.login.status !== "loading") {
        state.login.status = "idle";
      }
    },
    setRegisterField(
      state,
      action: PayloadAction<{
        field: RegisterFieldName;
        value: RegisterFormDraft[RegisterFieldName];
      }>,
    ) {
      state.register.values = {
        ...state.register.values,
        [action.payload.field]: action.payload.value,
      } as RegisterFormDraft;
      delete state.register.errors[action.payload.field];
      state.register.feedback = null;
      if (state.register.status !== "loading") {
        state.register.status = "idle";
      }
    },
    resetLoginState(state) {
      state.login = {
        values: createInitialLoginValues(),
        errors: {},
        feedback: null,
        status: "idle",
      };
    },
    resetRegisterState(state) {
      state.register = {
        values: createInitialRegisterValues(),
        errors: {},
        feedback: null,
        status: "idle",
      };
    },
    hydrateAuthSession(
      state,
      action: PayloadAction<PersistedAuthSession | null>,
    ) {
      state.session = {
        ...(action.payload ?? createInitialSessionState()),
        hydrated: true,
      };
    },
    signOut(state) {
      state.session = { ...createInitialSessionState(), hydrated: true };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitLogin.pending, (state) => {
        state.login.status = "loading";
        state.login.feedback = null;
        state.login.errors = {};
      })
      .addCase(submitLogin.fulfilled, (state, action) => {
        state.login.status = "succeeded";
        state.login.feedback = null;
        state.login.errors = {};
        state.login.values = createInitialLoginValues();
        state.session = {
          user: action.payload.user,
          accessToken: action.payload.access_token,
          refreshToken: action.payload.refresh_token,
          status: "authenticated",
          hydrated: true,
        };
      })
      .addCase(submitLogin.rejected, (state, action) => {
        state.login.status = "failed";
        state.login.feedback =
          action.payload?.feedback ?? {
            title: "Login failed",
            description: "Something went wrong while logging in.",
            variant: "destructive",
          };
        state.login.errors = action.payload?.fieldErrors ?? {};
      })
      .addCase(submitRegister.pending, (state) => {
        state.register.status = "loading";
        state.register.feedback = null;
        state.register.errors = {};
      })
      .addCase(submitRegister.fulfilled, (state) => {
        state.register.status = "succeeded";
        state.register.feedback = null;
        state.register.errors = {};
        state.register.values = createInitialRegisterValues();
      })
      .addCase(submitRegister.rejected, (state, action) => {
        state.register.status = "failed";
        state.register.feedback =
          action.payload?.feedback ?? {
            title: "Registration failed",
            description: "Something went wrong while registering.",
            variant: "destructive",
          };
        state.register.errors = action.payload?.fieldErrors ?? {};
      })
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.session.accessToken = action.payload.access_token;
        state.session.refreshToken = action.payload.refresh_token;
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.session = { ...createInitialSessionState(), hydrated: true };
      });
  },
});

export const {
  hydrateAuthSession,
  resetLoginState,
  resetRegisterState,
  setLoginField,
  setRegisterField,
  signOut,
} = authSlice.actions;

export const selectAuthSession = (state: RootState) => state.auth.session;
export const selectAuthHydrated = (state: RootState) => state.auth.session.hydrated;
export const selectLoginState = (state: RootState) => state.auth.login;
export const selectRegisterState = (state: RootState) => state.auth.register;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.session.status === "authenticated";

export default authSlice.reducer;
