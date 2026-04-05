const ACCESS_TOKEN_KEY = "rzp_at";
const REFRESH_TOKEN_KEY = "rzp_rt";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") {
    return;
  }

  const secure = location.protocol === "https:";
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  let cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Strict; expires=${expires}`;

  if (secure) {
    cookie += "; Secure";
  }

  document.cookie = cookie;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0`;
}

export function writeAuthCookies(accessToken: string, refreshToken: string) {
  setCookie(ACCESS_TOKEN_KEY, accessToken, 1);   // 1 day — short-lived
  setCookie(REFRESH_TOKEN_KEY, refreshToken, 30); // 30 days — long-lived
}

export function getStoredAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function clearAuthCookies() {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
}

export function isStoredAccessTokenExpired(): boolean {
  const token = getStoredAccessToken();
  if (!token) return true;
  try {
    const [, b64] = token.split(".");
    const payload = JSON.parse(atob(b64.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp !== "number" || Date.now() / 1000 >= payload.exp;
  } catch {
    return true;
  }
}
