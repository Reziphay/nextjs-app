"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { makeStore, type AppStore } from "@/store";
import { setStoreRef } from "@/store/store-ref";
import {
  fetchAuthenticatedSession,
  hydrateAuthSession,
  refreshAuthToken,
  selectAuthHydrated,
  selectAuthSession,
} from "@/store/auth";
import {
  clearAuthCookies,
  getStoredAccessToken,
  getStoredRefreshToken,
  writeAuthCookies,
} from "@/lib/auth-cookies";

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

      dispatch(
        hydrateAuthSession({
          user: null,
          accessToken,
          refreshToken,
          restrictionState: null,
          status: "anonymous",
        }),
      );

      try {
        await dispatch(fetchAuthenticatedSession()).unwrap();
        return;
      } catch {
        // Access token may be expired; try refresh below.
      }

      try {
        await dispatch(refreshAuthToken()).unwrap();
        await dispatch(fetchAuthenticatedSession()).unwrap();
        return;
      } catch {
        // Refresh also failed.
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
      <ThemeProvider>
        <AuthStoreSync />
        {children}
      </ThemeProvider>
    </Provider>
  );
}
