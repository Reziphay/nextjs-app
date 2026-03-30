// Mirrors the core shape of `User` and `UserType` from `nodejs-app/prisma/schema.prisma`.

export const userTypes = ["uso", "ucr", "admin"] as const;

export const registerUserTypes = ["uso", "ucr"] as const;

export type UserType = (typeof userTypes)[number];

export type RegisterUserType = (typeof registerUserTypes)[number];

type UserProfileFields = {
  first_name: string;
  last_name: string;
  birthday: Date;
  country: string;
  country_prefix: string;
  email: string;
};

type UserVerificationFields = {
  phone_verified: boolean;
  email_verified: boolean;
};

export type User = UserProfileFields &
  UserVerificationFields & {
    phone: string | null;
    hashed_password: string;
    type: UserType;
  };

export type Users = User[];

export type RegisterRequestBody = Omit<
  UserProfileFields,
  "birthday" | "country_prefix"
> & {
  birthday: string;
  password: string;
  type: RegisterUserType;
};

export type RegisterFormValues = RegisterRequestBody;

export function isRegisterUserType(
  value: string,
): value is RegisterUserType {
  return registerUserTypes.includes(value as RegisterUserType);
}
