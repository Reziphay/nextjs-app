// Mirrors `User`, `UserType`, and auth response contracts from `nodejs-app`.

export const userTypes = ["uso", "ucr", "admin"] as const;

export const registerUserTypes = ["uso", "ucr"] as const;

export type UserType = (typeof userTypes)[number];

export type RegisterUserType = (typeof registerUserTypes)[number];

type UserProfileFields = {
  first_name: string;
  last_name: string;
  birthday: Date;
  country: string;
  email: string;
};

type UserIdentityFields = {
  id: string;
};

type UserAvatarFields = {
  avatar_url?: string | null;
};

type UserVerificationFields = {
  phone_verified: boolean;
  email_verified: boolean;
};

export type User = UserIdentityFields &
  UserProfileFields &
  UserAvatarFields &
  UserVerificationFields & {
    phone: string | null;
    hashed_password: string;
    type: UserType;
    created_at: Date;
    updated_at: Date;
  };

export type Users = User[];

export type RegisterRequestBody = Omit<UserProfileFields, "birthday"> & {
  birthday: string;
  password: string;
  type: RegisterUserType;
};

export type RegisterFormValues = RegisterRequestBody;

export type AccountProfileDraft = Omit<UserProfileFields, "birthday"> & {
  birthday: string;
  // Full E.164 phone number, e.g. "+9941234567". Empty string means no phone.
  phone: string;
};

export type UpdateMyAccountRequestBody = Omit<AccountProfileDraft, "phone"> & {
  phone: string | null;
};

export type LoginRequestBody = {
  email: string;
  password: string;
};

export type LoginFormValues = LoginRequestBody;

export type AuthenticatedUser = Pick<
  User,
  | "id"
  | "email"
  | "type"
  | "first_name"
  | "last_name"
  | "email_verified"
  | "avatar_url"
>;

// Full profile returned by GET /auth/me
export type UserProfile = UserIdentityFields &
  UserProfileFields &
  UserAvatarFields &
  UserVerificationFields & {
    phone: string | null;
    type: UserType;
    created_at: string;
    updated_at: string;
  };

export type PublicUserProfile = Pick<
  User,
  | "id"
  | "first_name"
  | "last_name"
  | "email"
  | "type"
  | "avatar_url"
> & {
  created_at: string;
  updated_at: string;
};

export type AccountUserProfile = UserProfile | PublicUserProfile;

export type RegisteredUser = Pick<
  User,
  "first_name" | "last_name" | "email" | "type" | "email_verified" | "created_at"
>;

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

export type LoginResponseData = {
  user: AuthenticatedUser;
} & AuthTokens;

export type RegisterResponseData = {
  user?: RegisteredUser;
};

export type ApiSuccessResponse<TData = never> = {
  success: boolean;
  status: number;
  message: string;
  data?: TData;
};

export function isRegisterUserType(
  value: string,
): value is RegisterUserType {
  return registerUserTypes.includes(value as RegisterUserType);
}
