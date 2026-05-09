export const AUTH_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  user: "user",
} as const;

export type AuthTokenResponse = {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  user?: unknown;
};

export function normalizeAuthTokens(data: AuthTokenResponse | null | undefined) {
  return {
    accessToken: data?.accessToken ?? data?.access_token ?? "",
    refreshToken: data?.refreshToken ?? data?.refresh_token ?? "",
  };
}

function storage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getAccessToken() {
  return storage()?.getItem(AUTH_KEYS.accessToken) ?? null;
}

export function getRefreshToken() {
  return storage()?.getItem(AUTH_KEYS.refreshToken) ?? null;
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}

export function saveAuthTokens(accessToken: string, refreshToken: string) {
  const store = storage();
  if (!store) return;
  store.setItem(AUTH_KEYS.accessToken, accessToken);
  store.setItem(AUTH_KEYS.refreshToken, refreshToken);
}

export function saveAuthSession(data: AuthTokenResponse) {
  const { accessToken, refreshToken } = normalizeAuthTokens(data);
  if (!accessToken || !refreshToken) {
    throw new Error("Authentication response did not include a complete session.");
  }

  saveAuthTokens(accessToken, refreshToken);
  if (data.user !== undefined) {
    storage()?.setItem(AUTH_KEYS.user, JSON.stringify(data.user));
  }
}

export function clearAuthSession() {
  const store = storage();
  if (!store) return;
  store.removeItem(AUTH_KEYS.accessToken);
  store.removeItem(AUTH_KEYS.refreshToken);
  store.removeItem(AUTH_KEYS.user);
}

export function redirectToLogin() {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}
