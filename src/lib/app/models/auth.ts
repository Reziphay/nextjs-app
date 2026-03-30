import { normalizeUser, type User } from './user';

export type OtpPurpose = 'AUTHENTICATE' | 'LOGIN' | 'REGISTER' | 'VERIFY_PHONE';

export type OtpRequestResponse = {
  phone: string;
  debugCode?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSession = AuthTokens & {
  user: User;
};

export type RegistrationPending = {
  phone: string;
  registrationToken: string;
};

export type OtpVerifyResult =
  | { type: 'authenticated'; session: AuthSession }
  | { type: 'registration_pending'; pending: RegistrationPending };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeAuthTokens(payload: unknown): AuthTokens | null {
  if (!isRecord(payload)) return null;

  if (
    typeof payload.accessToken === 'string' &&
    typeof payload.refreshToken === 'string'
  ) {
    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
    };
  }

  if (
    isRecord(payload.tokens) &&
    typeof payload.tokens.accessToken === 'string' &&
    typeof payload.tokens.refreshToken === 'string'
  ) {
    return {
      accessToken: payload.tokens.accessToken,
      refreshToken: payload.tokens.refreshToken,
    };
  }

  return null;
}

export function normalizeAuthSession(payload: unknown): AuthSession | null {
  if (!isRecord(payload) || !('user' in payload)) return null;

  const user = normalizeUser(payload.user);
  const tokens = normalizeAuthTokens(payload);

  if (!user || !tokens) return null;

  return {
    ...tokens,
    user,
  };
}

export function normalizeUserResponse(payload: unknown): User | null {
  if (isRecord(payload) && 'user' in payload) {
    return normalizeUser(payload.user);
  }

  return normalizeUser(payload);
}
