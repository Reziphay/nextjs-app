"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { makeStore, type AppStore } from "@/store";
import { setStoreRef } from "@/store/store-ref";
import {
  hydrateAuthSession,
  refreshAuthToken,
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
    async function fetchMe(accessToken: string) {
      const client = createApiClient({ accessToken });
      const response = await client.get<ApiSuccessResponse<{ user: AuthenticatedUser }>>("/auth/me", {
        headers: { "Cache-Control": "no-cache" },
      });
      return response.data?.data?.user ?? null;
    }

    async function restoreSession() {
      const accessToken = getStoredAccessToken();
      const refreshToken = getStoredRefreshToken();

      if (!accessToken || !refreshToken) {
        dispatch(hydrateAuthSession(null));
        return;
      }

      // Try with stored access token
      try {
        const user = await fetchMe(accessToken);

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
        // Access token may be expired — try refresh below
      }

      // Access token expired: attempt refresh
      try {
        // Temporarily hydrate with stored tokens so the thunk can read refreshToken
        dispatch(
          hydrateAuthSession({
            user: null,
            accessToken,
            refreshToken,
            status: "anonymous",
          }),
        );

        const tokens = await dispatch(refreshAuthToken()).unwrap();
        const user = await fetchMe(tokens.access_token);

        if (user?.id && user?.email) {
          dispatch(
            hydrateAuthSession({
              user,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              status: "authenticated",
            }),
          );
          return;
        }
      } catch {
        // Refresh also failed
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
  const [store] = useState<AppStore>(() => {
    const s = makeStore();
    setStoreRef(s);
    return s;
  });

  return (
    <Provider store={store}>
      <AuthStoreSync />
      {children}
    </Provider>
  );
}
