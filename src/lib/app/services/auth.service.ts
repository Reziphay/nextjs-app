import { api, tokenStore } from '../api/client';
import { E } from '../api/endpoints';
import type {
  OtpPurpose,
  OtpRequestResponse,
  OtpVerifyResult,
  AuthSession,
} from '../models/auth';
import {
  normalizeAuthSession,
  normalizeUserResponse,
} from '../models/auth';
import type { User, AppRole } from '../models/user';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function persistSessionOrThrow(payload: unknown, message: string): AuthSession {
  const session = normalizeAuthSession(payload);

  if (!session) {
    throw new Error(message);
  }

  tokenStore.save(session.accessToken, session.refreshToken);
  return session;
}

function extractUserOrThrow(payload: unknown, message: string): User {
  const user = normalizeUserResponse(payload);

  if (!user) {
    throw new Error(message);
  }

  return user;
}

export const authService = {
  async requestOtp(phone: string, purpose: OtpPurpose): Promise<OtpRequestResponse> {
    return api.post<OtpRequestResponse>(E.requestPhoneOtp, { phone, purpose });
  },

  async verifyOtp(
    phone: string,
    code: string,
    purpose: OtpPurpose = 'AUTHENTICATE',
  ): Promise<OtpVerifyResult> {
    const result = await api.post<unknown>(E.verifyPhoneOtp, { phone, code, purpose });
    const session = normalizeAuthSession(result);

    if (session) {
      tokenStore.save(session.accessToken, session.refreshToken);
      return {
        type: 'authenticated',
        session,
      };
    }

    const registrationToken =
      isRecord(result) && typeof result.registrationToken === 'string'
        ? result.registrationToken
        : null;

    if (!registrationToken) {
      throw new Error('Invalid OTP verification response');
    }

    return {
      type: 'registration_pending',
      pending: {
        phone,
        registrationToken,
      },
    };
  },

  async completeRegistration(
    registrationToken: string,
    fullName: string,
    email: string,
    role: AppRole,
  ): Promise<AuthSession> {
    const result = await api.post<unknown>(E.completeRegistration, {
      registrationToken,
      fullName,
      email,
      role,
    });

    return persistSessionOrThrow(result, 'Invalid registration response');
  },

  async validateSession(): Promise<User | null> {
    if (!tokenStore.hasTokens()) return null;
    try {
      const result = await api.get<unknown>(E.authMe);
      return normalizeUserResponse(result);
    } catch {
      return null;
    }
  },

  async getMe(): Promise<User> {
    const result = await api.get<unknown>(E.userMe);
    return extractUserOrThrow(result, 'Invalid profile response');
  },

  async updateProfile(fullName?: string): Promise<User> {
    const result = await api.patch<unknown>(E.userMe, { fullName });
    return extractUserOrThrow(result, 'Invalid profile update response');
  },

  async uploadAvatar(file: File): Promise<User> {
    const form = new FormData();
    form.append('file', file);
    const result = await api.upload<unknown>(E.userMeAvatar, form, 'POST');
    return extractUserOrThrow(result, 'Invalid avatar upload response');
  },

  async activateUso(): Promise<AuthSession> {
    const result = await api.post<unknown>(E.activateUso);
    return persistSessionOrThrow(result, 'Invalid role activation response');
  },

  async switchRole(role: AppRole): Promise<AuthSession> {
    const result = await api.post<unknown>(E.switchRole, { role });
    return persistSessionOrThrow(result, 'Invalid role switch response');
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
