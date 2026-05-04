const ACCESS = "sarthi_access";
const REFRESH = "sarthi_refresh";
const USER = "sarthi_user";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS, access);
  localStorage.setItem(REFRESH, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem(USER);
}

export function setStoredUser(json: string): void {
  localStorage.setItem(USER, json);
}

export function getStoredUserJson(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER);
}
