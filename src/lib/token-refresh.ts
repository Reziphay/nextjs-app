import { refreshAuthToken, signOut } from "@/store/auth";
import { getStoreRef } from "@/store/store-ref";

/**
 * Singleton promise — if multiple 401s arrive concurrently they all
 * attach to the same in-flight refresh rather than firing N requests.
 */
let refreshPromise: Promise<string | null> | null = null;

export function performTokenRefresh(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = _doRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function _doRefresh(): Promise<string | null> {
  const store = getStoreRef();

  if (!store) {
    return null;
  }

  try {
    const tokens = await store.dispatch(refreshAuthToken()).unwrap();
    return tokens.access_token;
  } catch {
    store.dispatch(signOut());
    return null;
  }
}
