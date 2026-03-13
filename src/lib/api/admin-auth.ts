import { ApiError, fetchJson } from "@/lib/api/http";
import { type AdminSession } from "@/lib/auth/admin-auth";
import { publicEnv, serverEnv } from "@/lib/config/env";
import { type AdminLoginInput } from "@/lib/validation/admin-auth";

type AdminLoginSuccess = {
  ok: true;
  session: AdminSession;
};

type AdminLoginFailure = {
  ok: false;
  status: number;
  error: string;
};

type AdminLoginResult = AdminLoginSuccess | AdminLoginFailure;

type RemoteAdminLoginPayload = {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  email?: string;
  user?: {
    email?: string;
  };
  session?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
    email?: string;
    user?: {
      email?: string;
    };
  };
};

const MOCK_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function createMockSession(email: string): AdminSession {
  const now = Date.now();

  return {
    mode: "mock",
    email,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + MOCK_SESSION_TTL_MS).toISOString(),
  };
}

function normalizeRemoteSession(
  payload: RemoteAdminLoginPayload,
  fallbackEmail: string,
): AdminSession | null {
  const source = payload.session ?? payload;
  const accessToken = source.accessToken;

  if (!accessToken) {
    return null;
  }

  return {
    mode: "remote",
    email: source.email ?? source.user?.email ?? fallbackEmail,
    accessToken,
    refreshToken: source.refreshToken,
    expiresAt: source.expiresAt,
    issuedAt: new Date().toISOString(),
  };
}

export async function loginAdmin(
  credentials: AdminLoginInput,
): Promise<AdminLoginResult> {
  if (serverEnv.ADMIN_AUTH_MODE === "mock") {
    if (
      credentials.email !== serverEnv.ADMIN_LOGIN_EMAIL ||
      credentials.password !== serverEnv.ADMIN_LOGIN_PASSWORD
    ) {
      return {
        ok: false,
        status: 401,
        error: "Credentials do not match the configured admin account.",
      };
    }

    return {
      ok: true,
      session: createMockSession(credentials.email),
    };
  }

  try {
    const payload = await fetchJson<RemoteAdminLoginPayload>(
      `${publicEnv.NEXT_PUBLIC_API_BASE_URL}${serverEnv.ADMIN_AUTH_LOGIN_PATH}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      },
    );

    const session = normalizeRemoteSession(payload, credentials.email);

    if (!session) {
      return {
        ok: false,
        status: 502,
        error: "Remote admin auth response is missing an access token.",
      };
    }

    return {
      ok: true,
      session,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        status: error.status,
        error:
          error.status === 401
            ? "Credentials were rejected by the admin auth service."
            : "Admin auth request failed.",
      };
    }

    return {
      ok: false,
      status: 500,
      error: "Admin auth request failed.",
    };
  }
}

export async function logoutAdmin(session: AdminSession | null) {
  if (serverEnv.ADMIN_AUTH_MODE !== "remote" || !session?.accessToken) {
    return;
  }

  try {
    await fetch(`${publicEnv.NEXT_PUBLIC_API_BASE_URL}${serverEnv.ADMIN_AUTH_LOGOUT_PATH}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  } catch {}
}
