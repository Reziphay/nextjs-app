import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getMessages, type Locale } from "@/i18n/config";
import {
  normalizeBackendErrorMessage,
  translateBackendErrorMessage,
} from "@/lib/backend-errors";
import { normalizeCountryValue } from "@/lib/countries";
import { createApiClient } from "@/lib/api";
import type {
  AccountProfileDraft,
  ApiSuccessResponse,
  UpdateMyAccountRequestBody,
  UserProfile,
} from "@/types";
import type { AppDispatch, RootState } from "@/store";
import { syncAuthenticatedUser } from "@/store/auth";

const updateMyAccountEndpoint = "/users/me";
const uploadAccountAvatarEndpoint = "/users/me/avatar";
const removeAccountAvatarEndpoint = "/users/me/avatar";
const invalidApiResponseError = "INVALID_ACCOUNT_API_RESPONSE";
const minimumAccountAge = 18;
const maximumAvatarFileSizeBytes = 5 * 1024 * 1024;
const allowedAvatarMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Full E.164 format: optional '+' followed by 7–15 digits.
// The user types (or the field prefills) the complete international number.
const phonePattern = /^\+\d{7,15}$/;
const accountFieldNames = [
  "first_name",
  "last_name",
  "birthday",
  "country",
  "email",
  "phone",
  "instagram_url",
  "facebook_url",
  "youtube_url",
  "whatsapp_url",
  "linkedin_url",
  "x_url",
  "website_url",
] as const;

type RequestStatus = "idle" | "loading" | "succeeded" | "failed";
type ProfileMessages = ReturnType<typeof getMessages>["profile"];
type BackendErrorMessages = ReturnType<typeof getMessages>["backendErrors"];
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
  variant: "success" | "destructive";
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
  avatarUploadStatus: RequestStatus;
  avatarPreviewUrl: string | null;
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
    instagram_url: "",
    facebook_url: "",
    youtube_url: "",
    whatsapp_url: "",
    linkedin_url: "",
    x_url: "",
    website_url: "",
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
    instagram_url: profile.instagram_url ?? "",
    facebook_url: profile.facebook_url ?? "",
    youtube_url: profile.youtube_url ?? "",
    whatsapp_url: profile.whatsapp_url ?? "",
    linkedin_url: profile.linkedin_url ?? "",
    x_url: profile.x_url ?? "",
    website_url: profile.website_url ?? "",
  };
}

const initialState: AccountState = {
  profile: null,
  draft: createEmptyDraft(),
  errors: {},
  feedback: null,
  status: "idle",
  avatarUploadStatus: "idle",
  avatarPreviewUrl: null,
  isEditing: false,
  canEdit: false,
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("INVALID_ACCOUNT_FILE_READER_RESULT"));
    };

    reader.onerror = () => {
      reject(new Error("INVALID_ACCOUNT_FILE_READER_RESULT"));
    };

    reader.readAsDataURL(file);
  });
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

function mapApiFieldErrors(
  errors: ApiFieldError[] | undefined,
  backendErrorMessages: BackendErrorMessages,
) {
  const nextErrors: AccountFieldErrors = {};

  for (const entry of errors ?? []) {
    if (!entry.field || !entry.message) {
      continue;
    }

    if (accountFieldNames.includes(entry.field as AccountFieldName)) {
      nextErrors[entry.field as AccountFieldName] =
        translateBackendErrorMessage(entry.message, backendErrorMessages) ??
        entry.message;
    }
  }

  return nextErrors;
}

function resolveAccountApiMessage(
  apiMessage: string | undefined,
  messages: ProfileMessages,
  backendErrorMessages: BackendErrorMessages,
) {
  if (!apiMessage) {
    return undefined;
  }

  const translatedMessage = translateBackendErrorMessage(
    apiMessage,
    backendErrorMessages,
  );

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

  return translatedMessage;
}

function getAccountErrorResult(
  error: unknown,
  messages: ProfileMessages,
  backendErrorMessages: BackendErrorMessages,
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
    const apiMessage = normalizeBackendErrorMessage(error.response?.data?.message);
    const resolvedApiMessage = resolveAccountApiMessage(
      apiMessage,
      messages,
      backendErrorMessages,
    );
    const fieldErrors = mapApiFieldErrors(
      error.response?.data?.errors,
      backendErrorMessages,
    );

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

function getAvatarErrorResult(
  error: unknown,
  messages: ProfileMessages,
  backendErrorMessages: BackendErrorMessages,
): Exclude<AccountFeedback, null> {
  if (error instanceof Error) {
    if (error.message === invalidApiResponseError) {
      return {
        title: messages.photoUpdateErrorTitle,
        description: messages.photoConfigurationErrorDescription,
        variant: "destructive",
        icon: "error",
      };
    }

    if (error.message === "INVALID_ACCOUNT_FILE_READER_RESULT") {
      return {
        title: messages.photoUpdateErrorTitle,
        description: messages.photoUpdateErrorDescription,
        variant: "destructive",
        icon: "error",
      };
    }
  }

  if (isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    const apiMessage = normalizeBackendErrorMessage(error.response?.data?.message);

    if (!status) {
      return {
        title: messages.photoUpdateErrorTitle,
        description: messages.networkErrorDescription,
        variant: "destructive",
        icon: "wifi_off",
      };
    }

    const descriptionByMessage: Record<string, string> = {
      "errors.validation_error": messages.validationErrorDescription,
      "errors.missing_token": messages.photoUnauthorizedDescription,
      "errors.invalid_token": messages.photoUnauthorizedDescription,
      "user.not_found": messages.photoNotFoundDescription,
      "media.invalid_file_type": messages.photoInvalidTypeDescription,
      "media.file_too_large": messages.photoTooLargeDescription,
    };

    const descriptionByStatus: Record<number, string> = {
      400: messages.badRequestDescription,
      401: messages.photoUnauthorizedDescription,
      403: messages.photoForbiddenDescription,
      404: messages.photoNotFoundDescription,
      409: messages.photoConflictDescription,
      413: messages.photoTooLargeDescription,
      429: messages.photoRateLimitedDescription,
    };

    return {
      title: messages.photoUpdateErrorTitle,
      description:
        descriptionByMessage[apiMessage ?? ""] ??
        translateBackendErrorMessage(apiMessage, backendErrorMessages) ??
        descriptionByStatus[status] ??
        (status >= 500
          ? messages.photoServerErrorDescription
          : messages.photoUpdateErrorDescription),
      variant: "destructive",
      icon: "error",
    };
  }

  return {
    title: messages.photoUpdateErrorTitle,
    description: messages.photoUpdateErrorDescription,
    variant: "destructive",
    icon: "error",
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
  const localeMessages = getMessages(locale);
  const messages = localeMessages.profile;
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
    // phone is already full E.164 in the draft (e.g. "+9941234567").
    // If the field is locked we fall back to the profile value so the user
    // cannot accidentally clear a verified number.
    const resolvedEmail = isEmailLocked ? (profile?.email ?? values.email) : values.email;
    const resolvedPhone = isPhoneLocked
      ? (profile?.phone ?? null)
      : values.phone || null;
    const payload: UpdateMyAccountRequestBody = {
      first_name: values.first_name,
      last_name: values.last_name,
      birthday: values.birthday,
      country: values.country,
      email: resolvedEmail,
      phone: resolvedPhone,
      instagram_url: values.instagram_url.trim() || null,
      facebook_url: values.facebook_url.trim() || null,
      youtube_url: values.youtube_url.trim() || null,
      whatsapp_url: values.whatsapp_url.trim() || null,
      linkedin_url: values.linkedin_url.trim() || null,
      x_url: values.x_url.trim() || null,
      website_url: values.website_url.trim() || null,
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

    const nextUser: UserProfile = {
      ...user,
      avatar_url: user.avatar_url ?? profile?.avatar_url ?? null,
    };

    thunkApi.dispatch(
      syncAuthenticatedUser({
        first_name: nextUser.first_name,
        last_name: nextUser.last_name,
        email: nextUser.email,
        email_verified: nextUser.email_verified,
        avatar_url: nextUser.avatar_url ?? null,
      }),
    );

    return {
      user: nextUser,
      feedback: {
        title: messages.updateSuccessTitle,
        description: messages.updateSuccessDescription,
        variant: "success",
        icon: "check_circle",
      },
    };
  } catch (error) {
    return thunkApi.rejectWithValue(
      getAccountErrorResult(error, messages, localeMessages.backendErrors),
    );
  }
});

type UploadAccountAvatarParams = {
  file: File;
  locale: Locale;
};

export function uploadAccountAvatar({
  file,
  locale,
}: UploadAccountAvatarParams) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const localeMessages = getMessages(locale);
    const messages = localeMessages.profile;
    const state = getState();
    const accessToken = state.auth.session.accessToken;
    const profile = state.account.profile;

    if (!accessToken || !profile) {
      dispatch(
        accountSlice.actions.avatarUploadFailed({
          feedback: {
            title: messages.photoUpdateErrorTitle,
            description: messages.photoUnauthorizedDescription,
            variant: "destructive",
            icon: "lock",
          },
        }),
      );
      return;
    }

    if (!allowedAvatarMimeTypes.has(file.type)) {
      dispatch(
        accountSlice.actions.avatarUploadFailed({
          feedback: {
            title: messages.photoUpdateErrorTitle,
            description: messages.photoInvalidTypeDescription,
            variant: "destructive",
            icon: "image",
          },
        }),
      );
      return;
    }

    if (file.size > maximumAvatarFileSizeBytes) {
      dispatch(
        accountSlice.actions.avatarUploadFailed({
          feedback: {
            title: messages.photoUpdateErrorTitle,
            description: messages.photoTooLargeDescription,
            variant: "destructive",
            icon: "warning",
          },
        }),
      );
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);

      dispatch(
        accountSlice.actions.avatarUploadStarted({
          previewUrl,
        }),
      );

      const client = createApiClient({ accessToken, locale });
      const formData = new FormData();
      formData.append("file", file);

      const response = await client.post<
        ApiSuccessResponse<{
          user?: Partial<UserProfile>;
          avatar_url?: string | null;
        }>
      >(uploadAccountAvatarEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const contentType = String(response.headers["content-type"] ?? "");
      const user = response.data?.data?.user;
      const avatarUrl =
        response.data?.data?.avatar_url ??
        user?.avatar_url ??
        null;

      if (
        contentType.includes("text/html") ||
        response.data?.success !== true ||
        !avatarUrl
      ) {
        throw new Error(invalidApiResponseError);
      }

      const nextUser: UserProfile = {
        ...profile,
        ...user,
        avatar_url: avatarUrl,
      };

      dispatch(
        syncAuthenticatedUser({
          first_name: nextUser.first_name,
          last_name: nextUser.last_name,
          email: nextUser.email,
          email_verified: nextUser.email_verified,
          avatar_url: nextUser.avatar_url ?? null,
        }),
      );

      dispatch(
        accountSlice.actions.avatarUploadSucceeded({
          user: nextUser,
          avatarUrl,
          feedback: {
            title: messages.photoUpdatedTitle,
            description: messages.photoUpdatedDescription,
            variant: "success",
            icon: "check_circle",
          },
        }),
      );
    } catch (error) {
      dispatch(
        accountSlice.actions.avatarUploadFailed({
          feedback: getAvatarErrorResult(
            error,
            messages,
            localeMessages.backendErrors,
          ),
        }),
      );
    }
  };
}

export function removeAccountAvatar({ locale }: { locale: Locale }) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const localeMessages = getMessages(locale);
    const messages = localeMessages.profile;
    const state = getState();
    const accessToken = state.auth.session.accessToken;
    const profile = state.account.profile;

    if (!accessToken || !profile) {
      dispatch(
        accountSlice.actions.avatarUploadFailed({
          feedback: {
            title: messages.photoUpdateErrorTitle,
            description: messages.photoUnauthorizedDescription,
            variant: "destructive",
            icon: "lock",
          },
        }),
      );
      return;
    }

    try {
      dispatch(accountSlice.actions.avatarRemovalStarted());

      const client = createApiClient({ accessToken, locale });
      const response = await client.delete<
        ApiSuccessResponse<{
          user?: UserProfile;
          avatar_url?: string | null;
        }>
      >(removeAccountAvatarEndpoint);

      const contentType = String(response.headers["content-type"] ?? "");
      const responseUser = response.data?.data?.user;

      if (
        contentType.includes("text/html") ||
        response.data?.success !== true ||
        (responseUser && !responseUser.id)
      ) {
        throw new Error(invalidApiResponseError);
      }

      const nextUser: UserProfile = responseUser
        ? {
            ...profile,
            ...responseUser,
            avatar_url: null,
          }
        : {
            ...profile,
            avatar_url: null,
          };

      dispatch(
        syncAuthenticatedUser({
          first_name: nextUser.first_name,
          last_name: nextUser.last_name,
          email: nextUser.email,
          email_verified: nextUser.email_verified,
          avatar_url: null,
        }),
      );

      dispatch(
        accountSlice.actions.avatarRemoved({
          user: nextUser,
          feedback: {
            title: messages.photoRemovedTitle,
            description: messages.photoRemovedDescription,
            variant: "success",
            icon: "check_circle",
          },
        }),
      );
    } catch (error) {
      dispatch(
        accountSlice.actions.avatarUploadFailed({
          feedback: getAvatarErrorResult(
            error,
            messages,
            localeMessages.backendErrors,
          ),
        }),
      );
    }
  };
}

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
      state.avatarUploadStatus = "idle";
      state.avatarPreviewUrl = null;
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
    avatarUploadStarted(
      state,
      action: PayloadAction<{
        previewUrl: string;
      }>,
    ) {
      state.avatarUploadStatus = "loading";
      state.avatarPreviewUrl = action.payload.previewUrl;
      state.feedback = null;
    },
    avatarRemovalStarted(state) {
      state.avatarUploadStatus = "loading";
      state.avatarPreviewUrl = null;
      state.feedback = null;
    },
    avatarUploadSucceeded(
      state,
      action: PayloadAction<{
        user: UserProfile;
        avatarUrl: string | null;
        feedback: Exclude<AccountFeedback, null>;
      }>,
    ) {
      state.avatarUploadStatus = "succeeded";
      state.avatarPreviewUrl = null;
      state.profile = {
        ...action.payload.user,
        avatar_url: action.payload.avatarUrl,
      };
      state.feedback = action.payload.feedback;
    },
    avatarRemoved(
      state,
      action: PayloadAction<{
        user: UserProfile;
        feedback: Exclude<AccountFeedback, null>;
      }>,
    ) {
      state.avatarUploadStatus = "succeeded";
      state.avatarPreviewUrl = null;
      state.profile = {
        ...action.payload.user,
        avatar_url: null,
      };
      state.feedback = action.payload.feedback;
    },
    avatarUploadFailed(
      state,
      action: PayloadAction<{
        feedback: Exclude<AccountFeedback, null>;
      }>,
    ) {
      state.avatarUploadStatus = "failed";
      state.avatarPreviewUrl = null;
      state.feedback = action.payload.feedback;
    },
    dismissAccountFeedback(state) {
      state.feedback = null;
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
  avatarRemoved,
  avatarRemovalStarted,
  avatarUploadFailed,
  avatarUploadStarted,
  avatarUploadSucceeded,
  cancelEditingAccount,
  dismissAccountFeedback,
  hydrateAccountProfile,
  setAccountDraftField,
  startEditingAccount,
} = accountSlice.actions;

export const selectAccountState = (state: RootState) => state.account;

export default accountSlice.reducer;
