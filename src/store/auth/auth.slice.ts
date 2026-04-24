import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getMessages, type Locale } from "@/i18n/config";
import {
  normalizeBackendErrorMessage,
  translateBackendErrorMessage,
} from "@/lib/backend-errors";
import { checkApiHealth, createApiClient } from "@/lib/api";
import { writeAuthCookies } from "@/lib/auth-cookies";
import { getAuthFlowMessages } from "@/lib/auth-flow-messages";
import type {
  ApiSuccessResponse,
  AuthMeResponseData,
  AuthSessionPayload,
  AuthTokens,
  AuthenticatedUser,
  LoginFormValues,
  LoginResponseData,
  RegisterFormValues,
  RegisterResponseData,
  RegisterUserType,
  RestrictionState,
} from "@/types";
import { isRegisterUserType } from "@/types";
import type { RootState } from "@/store";

const authLoginEndpoint = "/auth/login";
const authLoginTwoFactorEndpoint = "/auth/login/2fa";
const authMeEndpoint = "/auth/me";
const authRefreshEndpoint = "/auth/refresh";
const authRegisterEndpoint = "/auth/register";
const invalidApiResponseError = "INVALID_AUTH_API_RESPONSE";
const minimumRegisterAge = 13;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+\d{7,15}$/;
const registerPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,72}$/;
const twoFactorCodePattern = /^\d{6}$/;
const loginFieldNames = ["email", "password"] as const;
const registerFieldNames = [
  "first_name",
  "last_name",
  "birthday",
  "country",
  "email",
  "phone",
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
type BackendErrorMessages = ReturnType<typeof getMessages>["backendErrors"];
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

type LoginChallengeState = {
  challengeId: string;
  expiresAt: string;
} | null;

type LoginSuccessResult =
  | {
      kind: "authenticated";
      session: AuthSessionPayload;
    }
  | {
      kind: "two_factor_required";
      challengeId: string;
      challengeExpiresAt: string;
    };

export type PersistedAuthSession = {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  restrictionState: RestrictionState | null;
  status: "anonymous" | "authenticated";
};

type AuthState = {
  login: FormState<LoginFormValues, LoginFieldName> & {
    challenge: LoginChallengeState;
  };
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
    phone: "",
    password: "",
    type: "",
  };
}

function createInitialSessionState(): AuthState["session"] {
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    restrictionState: null,
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
    challenge: null,
  },
  register: {
    values: createInitialRegisterValues(),
    errors: {},
    feedback: null,
    status: "idle",
  },
  session: createInitialSessionState(),
};

function mapApiFieldErrors<TField extends string>(
  errors: ApiFieldError[] | undefined,
  allowedFields: readonly TField[],
  backendErrorMessages: BackendErrorMessages,
) {
  const nextErrors: Partial<Record<TField, string>> = {};

  for (const entry of errors ?? []) {
    if (!entry.field || !entry.message) {
      continue;
    }

    if (allowedFields.includes(entry.field as TField)) {
      nextErrors[entry.field as TField] =
        translateBackendErrorMessage(entry.message, backendErrorMessages) ??
        entry.message;
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
    phone: values.phone.trim(),
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

  if (values.phone && !phonePattern.test(values.phone)) {
    errors.phone = "INVALID_PHONE_FORMAT";
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

async function requestAuthenticatedSession(
  accessToken: string,
  locale?: Locale,
): Promise<AuthSessionPayload> {
  const meClient = createApiClient({ accessToken, locale });
  const response = await meClient.request<ApiSuccessResponse<AuthMeResponseData>>({
    url: authMeEndpoint,
    method: "GET",
  });
  const data = response.data?.data;

  if (!data?.user?.id || !data.user.email || !data.restriction_state) {
    throw new Error(invalidApiResponseError);
  }

  return {
    user: data.user,
    access_token: accessToken,
    refresh_token: "",
    restriction_state: data.restriction_state,
  };
}

async function getLoginErrorResult(
  error: unknown,
  messages: LoginMessages,
  backendErrorMessages: BackendErrorMessages,
  locale: Locale,
): Promise<ThunkReject<LoginFieldName>> {
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
    const apiMessage = normalizeBackendErrorMessage(error.response?.data?.message);
    const resolvedApiMessage = translateBackendErrorMessage(
      apiMessage,
      backendErrorMessages,
    );
    const fieldErrors = mapApiFieldErrors(
      error.response?.data?.errors,
      loginFieldNames,
      backendErrorMessages,
    );

    if (!status) {
      const isBackendAvailable = await checkApiHealth(locale);

      return {
        feedback: {
          title: messages.errorTitle,
          description: isBackendAvailable
            ? messages.networkErrorDescription
            : messages.maintenanceDescription,
          variant: "destructive",
        },
      };
    }

    if (status === 400 && Object.keys(fieldErrors).length > 0) {
      return {
        feedback: {
          title: messages.errorTitle,
          description: resolvedApiMessage ?? messages.validationErrorDescription,
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
          resolvedApiMessage ??
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

async function getRegisterErrorResult(
  error: unknown,
  messages: RegisterMessages,
  backendErrorMessages: BackendErrorMessages,
  locale: Locale,
): Promise<ThunkReject<RegisterFieldName>> {
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
    const apiMessage = normalizeBackendErrorMessage(error.response?.data?.message);
    const resolvedApiMessage = translateBackendErrorMessage(
      apiMessage,
      backendErrorMessages,
    );
    const fieldErrors = mapApiFieldErrors(
      error.response?.data?.errors,
      registerFieldNames,
      backendErrorMessages,
    );

    if (!status) {
      const isBackendAvailable = await checkApiHealth(locale);

      return {
        feedback: {
          title: messages.errorTitle,
          description: isBackendAvailable
            ? messages.networkErrorDescription
            : messages.maintenanceDescription,
          variant: "destructive",
        },
      };
    }

    if (status === 400 && Object.keys(fieldErrors).length > 0) {
      return {
        feedback: {
          title: messages.errorTitle,
          description: resolvedApiMessage ?? messages.validationErrorDescription,
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
          resolvedApiMessage ??
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
  LoginSuccessResult,
  { locale: Locale; recaptchaToken: string },
  { state: RootState; rejectValue: ThunkReject<LoginFieldName> }
>("auth/submitLogin", async ({ locale, recaptchaToken }, thunkApi) => {
  const localeMessages = getMessages(locale);
  const messages = localeMessages.auth.login;
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
    const loginResponse = await client.request<ApiSuccessResponse<LoginResponseData>>({
      url: authLoginEndpoint,
      method: "POST",
      data: {
        ...values,
        recaptcha_token: recaptchaToken,
      },
    });
    const contentType = String(loginResponse.headers["content-type"] ?? "");
    const payload = loginResponse.data?.data;

    if (contentType.includes("text/html") || !payload) {
      throw new Error(invalidApiResponseError);
    }

    if (payload.requires_two_factor) {
      return {
        kind: "two_factor_required",
        challengeId: payload.challenge_id,
        challengeExpiresAt: payload.challenge_expires_at,
      };
    }

    if (!payload.access_token || !payload.refresh_token) {
      throw new Error(invalidApiResponseError);
    }

    const session = await requestAuthenticatedSession(payload.access_token, locale);
    writeAuthCookies(payload.access_token, payload.refresh_token);

    return {
      kind: "authenticated",
      session: {
        ...session,
        refresh_token: payload.refresh_token,
        restriction_state:
          session.restriction_state ?? payload.restriction_state,
      },
    };
  } catch (error) {
    return thunkApi.rejectWithValue(
      await getLoginErrorResult(
        error,
        messages,
        localeMessages.backendErrors,
        locale,
      ),
    );
  }
});

export const submitLoginTwoFactor = createAsyncThunk<
  AuthSessionPayload,
  { locale: Locale; challengeId: string; code: string },
  { rejectValue: ThunkReject<never> }
>("auth/submitLoginTwoFactor", async ({ locale, challengeId, code }, thunkApi) => {
  const localeMessages = getMessages(locale);
  const messages = localeMessages.auth.login;

  if (!twoFactorCodePattern.test(code)) {
    return thunkApi.rejectWithValue({
      feedback: {
        title: messages.errorTitle,
        description:
          translateBackendErrorMessage(
            "auth.invalid_two_factor_code",
            localeMessages.backendErrors,
          ) ?? messages.validationErrorDescription,
        variant: "destructive",
      },
    });
  }

  try {
    const client = createApiClient({ locale });
    const response = await client.request<ApiSuccessResponse<AuthTokens>>({
      url: authLoginTwoFactorEndpoint,
      method: "POST",
      data: {
        challenge_id: challengeId,
        code,
      },
    });
    const contentType = String(response.headers["content-type"] ?? "");
    const tokens = response.data?.data;

    if (
      contentType.includes("text/html") ||
      !tokens?.access_token ||
      !tokens.refresh_token
    ) {
      throw new Error(invalidApiResponseError);
    }

    const session = await requestAuthenticatedSession(tokens.access_token, locale);
    writeAuthCookies(tokens.access_token, tokens.refresh_token);

    return {
      ...session,
      refresh_token: tokens.refresh_token,
    };
  } catch (error) {
    return thunkApi.rejectWithValue(
      await getLoginErrorResult(
        error,
        messages,
        localeMessages.backendErrors,
        locale,
      ),
    );
  }
});

export const submitRegister = createAsyncThunk<
  RegisterResponseData,
  { locale: Locale; recaptchaToken: string },
  { state: RootState; rejectValue: ThunkReject<RegisterFieldName> }
>("auth/submitRegister", async ({ locale, recaptchaToken }, thunkApi) => {
  const localeMessages = getMessages(locale);
  const messages = localeMessages.auth.register;
  const values = normalizeRegisterValues(thunkApi.getState().auth.register.values);
  const fieldErrors = validateRegisterForm(values, messages);

  if (fieldErrors.phone === "INVALID_PHONE_FORMAT") {
    fieldErrors.phone = getAuthFlowMessages(locale).register.phoneInvalidMessage;
  }

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
        phone: values.phone || null,
        password: values.password,
        type: values.type as RegisterUserType,
        recaptcha_token: recaptchaToken,
      },
    });
    const contentType = String(response.headers["content-type"] ?? "");
    const data = response.data?.data;

    if (
      contentType.includes("text/html") ||
      response.data?.success !== true ||
      !data?.restriction_state
    ) {
      throw new Error(invalidApiResponseError);
    }

    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(
      await getRegisterErrorResult(
        error,
        messages,
        localeMessages.backendErrors,
        locale,
      ),
    );
  }
});

type RefreshAuthResponseData = AuthTokens & {
  restriction_state?: RestrictionState;
};

export const refreshAuthToken = createAsyncThunk<
  RefreshAuthResponseData,
  void,
  { state: RootState }
>("auth/refreshToken", async (_, thunkApi) => {
  const { refreshToken } = thunkApi.getState().auth.session;

  if (!refreshToken) {
    return thunkApi.rejectWithValue(null);
  }

  try {
    const client = createApiClient();
    const response = await client.request<
      ApiSuccessResponse<RefreshAuthResponseData>
    >({
      url: authRefreshEndpoint,
      method: "POST",
      data: { refresh_token: refreshToken },
    });
    const tokens = response.data?.data;

    if (!tokens?.access_token || !tokens?.refresh_token) {
      return thunkApi.rejectWithValue(null);
    }

    writeAuthCookies(tokens.access_token, tokens.refresh_token);

    return tokens;
  } catch {
    return thunkApi.rejectWithValue(null);
  }
});

export const fetchAuthenticatedSession = createAsyncThunk<
  AuthMeResponseData,
  { locale?: Locale } | void,
  { state: RootState }
>("auth/fetchAuthenticatedSession", async (input, thunkApi) => {
  const { accessToken } = thunkApi.getState().auth.session;

  if (!accessToken) {
    return thunkApi.rejectWithValue(null);
  }

  try {
    const response = await createApiClient({
      accessToken,
      locale: input?.locale,
    }).request<ApiSuccessResponse<AuthMeResponseData>>({
      url: authMeEndpoint,
      method: "GET",
    });
    const data = response.data?.data;

    if (!data?.user?.id || !data.user.email || !data.restriction_state) {
      return thunkApi.rejectWithValue(null);
    }

    return data;
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
      state.login.challenge = null;
      if (state.login.status !== "loading") {
        state.login.status = "idle";
      }
    },
    clearLoginChallenge(state) {
      state.login.challenge = null;
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
        challenge: null,
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
    syncAuthenticatedUser(
      state,
      action: PayloadAction<Partial<AuthenticatedUser>>,
    ) {
      if (!state.session.user) {
        return;
      }

      state.session.user = {
        ...state.session.user,
        ...action.payload,
      };
    },
    signOut(state) {
      state.session = { ...createInitialSessionState(), hydrated: true };
      state.login.challenge = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitLogin.pending, (state) => {
        state.login.status = "loading";
        state.login.feedback = null;
        state.login.errors = {};
        state.login.challenge = null;
      })
      .addCase(submitLogin.fulfilled, (state, action) => {
        state.login.status = "succeeded";
        state.login.feedback = null;
        state.login.errors = {};

        if (action.payload.kind === "two_factor_required") {
          state.login.challenge = {
            challengeId: action.payload.challengeId,
            expiresAt: action.payload.challengeExpiresAt,
          };
          state.login.values.password = "";
          return;
        }

        state.login.values = createInitialLoginValues();
        state.login.challenge = null;
        state.session = {
          user: action.payload.session.user,
          accessToken: action.payload.session.access_token,
          refreshToken: action.payload.session.refresh_token,
          restrictionState: action.payload.session.restriction_state,
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
      .addCase(submitLoginTwoFactor.pending, (state) => {
        state.login.status = "loading";
        state.login.feedback = null;
      })
      .addCase(submitLoginTwoFactor.fulfilled, (state, action) => {
        state.login.status = "succeeded";
        state.login.feedback = null;
        state.login.errors = {};
        state.login.challenge = null;
        state.login.values = createInitialLoginValues();
        state.session = {
          user: action.payload.user,
          accessToken: action.payload.access_token,
          refreshToken: action.payload.refresh_token,
          restrictionState: action.payload.restriction_state,
          status: "authenticated",
          hydrated: true,
        };
      })
      .addCase(submitLoginTwoFactor.rejected, (state, action) => {
        state.login.status = "failed";
        state.login.feedback =
          action.payload?.feedback ?? {
            title: "Login failed",
            description: "Something went wrong while logging in.",
            variant: "destructive",
          };
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
        state.session.restrictionState =
          action.payload.restriction_state ?? state.session.restrictionState;
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.session = { ...createInitialSessionState(), hydrated: true };
      })
      .addCase(fetchAuthenticatedSession.fulfilled, (state, action) => {
        state.session.user = action.payload.user;
        state.session.restrictionState = action.payload.restriction_state;
        state.session.status = "authenticated";
        state.session.hydrated = true;
      });
  },
});

export const {
  clearLoginChallenge,
  hydrateAuthSession,
  resetLoginState,
  resetRegisterState,
  setLoginField,
  setRegisterField,
  signOut,
  syncAuthenticatedUser,
} = authSlice.actions;

export const selectAuthSession = (state: RootState) => state.auth.session;
export const selectAuthHydrated = (state: RootState) =>
  state.auth.session.hydrated;
export const selectLoginState = (state: RootState) => state.auth.login;
export const selectRegisterState = (state: RootState) => state.auth.register;
export const selectRestrictionState = (state: RootState) =>
  state.auth.session.restrictionState;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.session.status === "authenticated";

export default authSlice.reducer;
