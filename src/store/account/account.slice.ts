import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getMessages, type Locale } from "@/i18n/config";
import { findCountryByValue, normalizeCountryValue } from "@/lib/countries";
import { createApiClient } from "@/lib/api";
import type {
  AccountProfileDraft,
  ApiSuccessResponse,
  UpdateMyAccountRequestBody,
  UserProfile,
} from "@/types";
import type { RootState } from "@/store";
import { syncAuthenticatedUser } from "@/store/auth";

const updateMyAccountEndpoint = "/users/me";
const invalidApiResponseError = "INVALID_ACCOUNT_API_RESPONSE";
const minimumAccountAge = 13;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9()+\-\s]{7,20}$/;
const accountFieldNames = [
  "first_name",
  "last_name",
  "birthday",
  "country",
  "email",
  "phone",
] as const;

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";
type ProfileMessages = ReturnType<typeof getMessages>["profile"];
type AccountFieldName = keyof AccountProfileDraft;
type AccountFieldErrors = Partial<Record<AccountFieldName, string>>;
type ApiFieldError = {
  field?: string;
  message?: string;
};
type ApiErrorResponse = {
  message?: string | string[];
  errors?: ApiFieldError[];
};
type AccountFeedback = {
  title: string;
  description: string;
  variant: "default" | "destructive";
  icon: string;
} | null;
type ThunkReject = {
  feedback: Exclude<AccountFeedback, null>;
  fieldErrors?: AccountFieldErrors;
};

type AccountState = {
  profile: UserProfile | null;
  draft: AccountProfileDraft;
  errors: AccountFieldErrors;
  feedback: AccountFeedback;
  status: RequestStatus;
  isEditing: boolean;
  canEdit: boolean;
};

function isEmailFieldLocked(profile: UserProfile | null) {
  return Boolean(profile?.email_verified);
}

function isPhoneFieldLocked(profile: UserProfile | null) {
  return Boolean(profile?.phone_verified && profile?.phone);
}

function createEmptyDraft(): AccountProfileDraft {
  return {
    first_name: "",
    last_name: "",
    birthday: "",
    country: "",
    email: "",
    phone: "",
  };
}

function createDraftFromProfile(profile: UserProfile | null): AccountProfileDraft {
  if (!profile) {
    return createEmptyDraft();
  }

  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    birthday: String(profile.birthday).slice(0, 10),
    country: normalizeCountryValue(profile.country),
    email: profile.email,
    phone: profile.phone ?? "",
  };
}

const initialState: AccountState = {
  profile: null,
  draft: createEmptyDraft(),
  errors: {},
  feedback: null,
  status: "idle",
  isEditing: false,
  canEdit: false,
};

function normalizeMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return message;
}

function normalizeDraft(values: AccountProfileDraft): AccountProfileDraft {
  return {
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    birthday: values.birthday.trim(),
    country: values.country.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
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

function validateAccountDraft(
  values: AccountProfileDraft,
  messages: ProfileMessages,
): AccountFieldErrors {
  const errors: AccountFieldErrors = {};

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
  } else if (!isAtLeastMinimumAge(values.birthday, minimumAccountAge)) {
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
    errors.phone = messages.phoneInvalidMessage;
  }

  return errors;
}

function mapApiFieldErrors(errors: ApiFieldError[] | undefined) {
  const nextErrors: AccountFieldErrors = {};

  for (const entry of errors ?? []) {
    if (!entry.field || !entry.message) {
      continue;
    }

    if (accountFieldNames.includes(entry.field as AccountFieldName)) {
      nextErrors[entry.field as AccountFieldName] = entry.message;
    }
  }

  return nextErrors;
}

function resolveAccountApiMessage(
  apiMessage: string | undefined,
  messages: ProfileMessages,
) {
  if (!apiMessage) {
    return undefined;
  }

  const mappedMessages: Record<string, string> = {
    "errors.validation_error": messages.validationErrorDescription,
    "errors.missing_token": messages.unauthorizedDescription,
    "errors.invalid_token": messages.unauthorizedDescription,
    "user.not_found": messages.notFoundDescription,
    "user.email_change_not_allowed": messages.emailLockedDescription,
    "user.phone_change_not_allowed": messages.phoneLockedDescription,
    "user.email_already_in_use": messages.conflictDescription,
    "user.phone_already_in_use": messages.conflictDescription,
  };

  if (mappedMessages[apiMessage]) {
    return mappedMessages[apiMessage];
  }

  return apiMessage.includes(".") ? undefined : apiMessage;
}

function getAccountErrorResult(
  error: unknown,
  messages: ProfileMessages,
): ThunkReject {
  if (error instanceof Error && error.message === invalidApiResponseError) {
    return {
      feedback: {
        title: messages.updateErrorTitle,
        description: messages.configurationErrorDescription,
        variant: "destructive",
        icon: "error",
      },
    };
  }

  if (isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    const apiMessage = normalizeMessage(error.response?.data?.message);
    const resolvedApiMessage = resolveAccountApiMessage(apiMessage, messages);
    const fieldErrors = mapApiFieldErrors(error.response?.data?.errors);

    if (apiMessage === "user.email_change_not_allowed") {
      fieldErrors.email = messages.emailLockedDescription;
    }

    if (apiMessage === "user.phone_change_not_allowed") {
      fieldErrors.phone = messages.phoneLockedDescription;
    }

    if (!status) {
      return {
        feedback: {
          title: messages.updateErrorTitle,
          description: messages.networkErrorDescription,
          variant: "destructive",
          icon: "wifi_off",
        },
      };
    }

    if (status === 400 && Object.keys(fieldErrors).length > 0) {
      return {
        feedback: {
          title: messages.updateErrorTitle,
          description: resolvedApiMessage ?? messages.validationErrorDescription,
          variant: "destructive",
          icon: "error",
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
        title: messages.updateErrorTitle,
        description:
          resolvedApiMessage ??
          descriptionByStatus[status] ??
          (status >= 500
            ? messages.serverErrorDescription
            : messages.updateErrorDescription),
        variant: "destructive",
        icon: "error",
      },
      fieldErrors:
        Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    };
  }

  return {
    feedback: {
      title: messages.updateErrorTitle,
      description: messages.updateErrorDescription,
      variant: "destructive",
      icon: "error",
    },
  };
}

export const submitAccountUpdate = createAsyncThunk<
  {
    user: UserProfile;
    feedback: Exclude<AccountFeedback, null>;
  },
  { locale: Locale },
  { state: RootState; rejectValue: ThunkReject }
>("account/submitUpdate", async ({ locale }, thunkApi) => {
  const messages = getMessages(locale).profile;
  const state = thunkApi.getState();
  const accessToken = state.auth.session.accessToken;
  const profile = state.account.profile;
  const values = normalizeDraft(state.account.draft);
  const fieldErrors = validateAccountDraft(values, messages);

  if (Object.keys(fieldErrors).length > 0) {
    return thunkApi.rejectWithValue({
      feedback: {
        title: messages.updateErrorTitle,
        description: messages.validationErrorDescription,
        variant: "destructive",
        icon: "error",
      },
      fieldErrors,
    });
  }

  if (!accessToken) {
    return thunkApi.rejectWithValue({
      feedback: {
        title: messages.updateErrorTitle,
        description: messages.unauthorizedDescription,
        variant: "destructive",
        icon: "lock",
      },
    });
  }

  try {
    const isEmailLocked = isEmailFieldLocked(profile);
    const isPhoneLocked = isPhoneFieldLocked(profile);
    const resolvedEmail = isEmailLocked ? (profile?.email ?? values.email) : values.email;
    const resolvedPhone = isPhoneLocked ? (profile?.phone ?? null) : values.phone || null;
    const resolvedCountryPrefix = isPhoneLocked
      ? (profile?.country_prefix ?? null)
      : resolvedPhone
        ? (findCountryByValue(values.country)?.prefix ?? null)
        : null;
    const payload: UpdateMyAccountRequestBody = {
      first_name: values.first_name,
      last_name: values.last_name,
      birthday: values.birthday,
      country: values.country,
      country_prefix: resolvedCountryPrefix,
      email: resolvedEmail,
      phone: resolvedPhone,
    };
    const client = createApiClient({ accessToken, locale });
    const response = await client.patch<ApiSuccessResponse<{ user: UserProfile }>>(
      updateMyAccountEndpoint,
      payload,
    );
    const contentType = String(response.headers["content-type"] ?? "");
    const user = response.data?.data?.user;

    if (contentType.includes("text/html") || response.data?.success !== true || !user?.id) {
      throw new Error(invalidApiResponseError);
    }

    thunkApi.dispatch(
      syncAuthenticatedUser({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        email_verified: user.email_verified,
      }),
    );

    return {
      user,
      feedback: {
        title: messages.updateSuccessTitle,
        description: messages.updateSuccessDescription,
        variant: "default",
        icon: "check_circle",
      },
    };
  } catch (error) {
    return thunkApi.rejectWithValue(getAccountErrorResult(error, messages));
  }
});

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    hydrateAccountProfile(
      state,
      action: PayloadAction<{
        profile: UserProfile;
        canEdit: boolean;
      }>,
    ) {
      state.profile = action.payload.profile;
      state.draft = createDraftFromProfile(action.payload.profile);
      state.canEdit = action.payload.canEdit;
      state.errors = {};
      state.feedback = null;
      state.status = "idle";
      state.isEditing = false;
    },
    startEditingAccount(state) {
      if (!state.canEdit || !state.profile) {
        return;
      }

      state.isEditing = true;
      state.feedback = null;
      state.errors = {};
      state.status = "idle";
      state.draft = createDraftFromProfile(state.profile);
    },
    cancelEditingAccount(state) {
      state.isEditing = false;
      state.feedback = null;
      state.errors = {};
      state.status = "idle";
      state.draft = createDraftFromProfile(state.profile);
    },
    setAccountDraftField(
      state,
      action: PayloadAction<{
        field: AccountFieldName;
        value: AccountProfileDraft[AccountFieldName];
      }>,
    ) {
      state.draft = {
        ...state.draft,
        [action.payload.field]: action.payload.value,
      };
      delete state.errors[action.payload.field];
      state.feedback = null;
      if (state.status !== "loading") {
        state.status = "idle";
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitAccountUpdate.pending, (state) => {
        state.status = "loading";
        state.feedback = null;
        state.errors = {};
      })
      .addCase(submitAccountUpdate.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload.user;
        state.draft = createDraftFromProfile(action.payload.user);
        state.errors = {};
        state.isEditing = false;
        state.feedback = action.payload.feedback;
      })
      .addCase(submitAccountUpdate.rejected, (state, action) => {
        state.status = "failed";
        state.feedback =
          action.payload?.feedback ?? {
            title: "Profile update failed",
            description: "Something went wrong while saving your account changes.",
            variant: "destructive",
            icon: "error",
          };
        state.errors = action.payload?.fieldErrors ?? {};
      });
  },
});

export const {
  cancelEditingAccount,
  hydrateAccountProfile,
  setAccountDraftField,
  startEditingAccount,
} = accountSlice.actions;

export const selectAccountState = (state: RootState) => state.account;

export default accountSlice.reducer;
