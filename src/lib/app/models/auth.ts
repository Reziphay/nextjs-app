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
  user: import('./user').User;
};

export type RegistrationPending = {
  phone: string;
  registrationToken: string;
};

export type OtpVerifyResult =
  | { type: 'authenticated'; session: AuthSession }
  | { type: 'registration_pending'; pending: RegistrationPending };
