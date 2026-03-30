"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { makeStore, type AppStore } from "@/store";
import {
  hydrateAuthSession,
  selectAuthHydrated,
  selectAuthSession,
  type PersistedAuthSession,
} from "@/store/auth";

const authStorageKey = "reziphay-auth-session";

type StoreProviderProps = {
  children: ReactNode;
};

function readPersistedAuthSession(): PersistedAuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(authStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<PersistedAuthSession>;

    if (
      parsed.status !== "anonymous" &&
      parsed.status !== "authenticated"
    ) {
      return null;
    }

    return {
      user: parsed.user ?? null,
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      status: parsed.status,
    };
  } catch {
    return null;
  }
}

function writePersistedAuthSession(session: PersistedAuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  if (
    session.status !== "authenticated" ||
    !session.user ||
    !session.accessToken ||
    !session.refreshToken
  ) {
    window.localStorage.removeItem(authStorageKey);
    return;
  }

  window.localStorage.setItem(authStorageKey, JSON.stringify(session));
}

function AuthStoreSync() {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector(selectAuthHydrated);
  const session = useAppSelector(selectAuthSession);

  useEffect(() => {
    dispatch(hydrateAuthSession(readPersistedAuthSession()));
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    writePersistedAuthSession({
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      status: session.status,
    });
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
