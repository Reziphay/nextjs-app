// Mirrors `User`, `UserType`, and auth response contracts from `nodejs-app`.

export const userTypes = ["uso", "ucr", "admin"] as const;

export const registerUserTypes = ["uso", "ucr"] as const;

export type UserType = (typeof userTypes)[number];

export type RegisterUserType = (typeof registerUserTypes)[number];
export type MissingVerification = "email" | "phone";

export type RestrictionState = {
  code: "verification_incomplete" | null;
  is_fully_verified: boolean;
  is_restricted: boolean;
  missing_verifications: MissingVerification[];
  blocked_actions: string[];
};

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
  phone?: string | null;
  password: string;
  type: RegisterUserType;
  recaptcha_token: string;
};

export type RegisterFormValues = Omit<RegisterRequestBody, "recaptcha_token"> & {
  phone: string;
};

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
  recaptcha_token: string;
};

export type LoginFormValues = Omit<LoginRequestBody, "recaptcha_token">;

export type AuthenticatedUser = Pick<
  User,
  | "id"
  | "email"
  | "type"
  | "first_name"
  | "last_name"
  | "email_verified"
  | "phone_verified"
  | "phone"
  | "avatar_url"
> & {
  two_factor_enabled: boolean;
};

// Full profile returned by GET /auth/me
export type UserProfile = UserIdentityFields &
  UserProfileFields &
  UserAvatarFields &
  UserVerificationFields & {
    phone: string | null;
    type: UserType;
    two_factor_enabled: boolean;
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

export type AuthMeResponseData = {
  user: AuthenticatedUser;
  restriction_state: RestrictionState;
};

export type PhoneVerificationChallenge = {
  challenge_id: string;
  expires_at: string;
};

export type RegisterResponseData = {
  restriction_state: RestrictionState;
  phone_verification?: PhoneVerificationChallenge;
};

export type LoginTwoFactorChallengeResponseData = {
  requires_two_factor: true;
  challenge_id: string;
  challenge_expires_at: string;
};

export type LoginSessionResponseData = AuthTokens & {
  requires_two_factor: false;
  avatar_url?: string | null;
  restriction_state: RestrictionState;
};

export type LoginResponseData =
  | LoginTwoFactorChallengeResponseData
  | LoginSessionResponseData;

export type AuthSessionPayload = {
  user: AuthenticatedUser;
  access_token: string;
  refresh_token: string;
  restriction_state: RestrictionState;
};

export type ApiSuccessResponse<TData = never> = {
  success: boolean;
  status: number;
  message: string;
  data?: TData;
};

export type TwoFactorEnrollmentResponseData = {
  secret: string;
  otp_auth_url: string;
  expires_at: string;
};

export type StepUpPurpose =
  | "delete_account"
  | "email_change"
  | "phone_change"
  | "delete_brand";

export function isRegisterUserType(
  value: string,
): value is RegisterUserType {
  return registerUserTypes.includes(value as RegisterUserType);
}
