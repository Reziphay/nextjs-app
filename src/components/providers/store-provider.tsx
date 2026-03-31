"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { makeStore, type AppStore } from "@/store";
import {
  hydrateAuthSession,
  selectAuthHydrated,
  selectAuthSession,
} from "@/store/auth";
import { createApiClient } from "@/lib/api";
import {
  clearAuthCookies,
  getStoredAccessToken,
  getStoredRefreshToken,
  writeAuthCookies,
} from "@/lib/auth-cookies";
import type { ApiSuccessResponse, AuthenticatedUser } from "@/types";

type StoreProviderProps = {
  children: ReactNode;
};

function AuthStoreSync() {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector(selectAuthHydrated);
  const session = useAppSelector(selectAuthSession);

  useEffect(() => {
    async function restoreSession() {
      const accessToken = getStoredAccessToken();
      const refreshToken = getStoredRefreshToken();

      if (!accessToken || !refreshToken) {
        dispatch(hydrateAuthSession(null));
        return;
      }

      try {
        const client = createApiClient({ accessToken });
        const response = await client.get<ApiSuccessResponse<{ user: AuthenticatedUser }>>("/auth/me", {
          headers: { "Cache-Control": "no-cache" },
        });
        const user = response.data?.data?.user;

        if (user?.id && user?.email) {
          dispatch(
            hydrateAuthSession({
              user,
              accessToken,
              refreshToken,
              status: "authenticated",
            }),
          );
          return;
        }
      } catch {
        // Token expired or invalid
      }

      clearAuthCookies();
      dispatch(hydrateAuthSession(null));
    }

    restoreSession();
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (session.status === "authenticated" && session.accessToken && session.refreshToken) {
      writeAuthCookies(session.accessToken, session.refreshToken);
    } else {
      clearAuthCookies();
    }
  }, [hydrated, session]);

  return null;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState<AppStore>(makeStore);

  return (
    <Provider store={store}>
      <AuthStoreSync />
      {children}
    </Provider>
  );
}
