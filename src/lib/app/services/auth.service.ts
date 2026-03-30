import { api, tokenStore } from '../api/client';
import { E } from '../api/endpoints';
import type {
  OtpPurpose,
  OtpRequestResponse,
  OtpVerifyResult,
  AuthSession,
} from '../models/auth';
import type { User } from '../models/user';
import type { AppRole } from '../models/user';

export const authService = {
  async requestOtp(phone: string, purpose: OtpPurpose): Promise<OtpRequestResponse> {
    return api.post<OtpRequestResponse>(E.requestPhoneOtp, { phone, purpose });
  },

  async verifyOtp(phone: string, code: string): Promise<OtpVerifyResult> {
    const result = await api.post<{
      authenticated?: boolean;
      accessToken?: string;
      refreshToken?: string;
      user?: User;
      registrationToken?: string;
    }>(E.verifyPhoneOtp, { phone, code });

    if (result.accessToken && result.refreshToken && result.user) {
      tokenStore.save(result.accessToken, result.refreshToken);
      return {
        type: 'authenticated',
        session: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        } satisfies AuthSession,
      };
    }

    return {
      type: 'registration_pending',
      pending: {
        phone,
        registrationToken: result.registrationToken!,
      },
    };
  },

  async completeRegistration(
    registrationToken: string,
    fullName: string,
    email: string,
    role: AppRole,
  ): Promise<AuthSession> {
    const result = await api.post<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>(E.completeRegistration, { registrationToken, fullName, email, role });

    tokenStore.save(result.accessToken, result.refreshToken);
    return result;
  },

  async validateSession(): Promise<User | null> {
    if (!tokenStore.hasTokens()) return null;
    try {
      return await api.get<User>(E.authMe);
    } catch {
      return null;
    }
  },

  async getMe(): Promise<User> {
    return api.get<User>(E.userMe);
  },

  async updateProfile(fullName?: string): Promise<User> {
    return api.patch<User>(E.userMe, { fullName });
  },

  async uploadAvatar(file: File): Promise<User> {
    const form = new FormData();
    form.append('file', file);
    return api.upload<User>(E.userMeAvatar, form, 'POST');
  },

  async activateUso(): Promise<AuthSession> {
    const result = await api.post<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>(E.activateUso);
    tokenStore.save(result.accessToken, result.refreshToken);
    return result;
  },

  async switchRole(role: AppRole): Promise<AuthSession> {
    const result = await api.post<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>(E.switchRole, { role });
    tokenStore.save(result.accessToken, result.refreshToken);
    return result;
  },

  async logout(): Promise<void> {
    try {
      await api.post(E.logout);
    } catch {
      // ignore
    } finally {
      tokenStore.clear();
    }
  },
};
