import type { AuthTokens, Meal, PublicUser } from "./types";
import {
  clearTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setTokens,
} from "./storage";

const baseUrl: string =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const rt = getStoredRefreshToken();
  if (!rt) return null;
  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = (await res.json()) as AuthTokens;
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function getValidAccessToken(): Promise<string | null> {
  const token = getStoredAccessToken();
  if (token) return token;
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

type FetchOptions = RequestInit & { skipAuth?: boolean };

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const headers = new Headers(options.headers);
  if (!options.skipAuth) {
    const token = await getValidAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && !options.skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(url, { ...options, headers });
    }
  }

  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const msg =
      body &&
      typeof body === "object" &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, body);
  }

  return body as T;
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
  return apiFetch("/auth/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });
}

export async function registerRequest(
  email: string,
  password: string,
): Promise<{ user: PublicUser; accessToken: string; refreshToken: string }> {
  return apiFetch("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutRequest(): Promise<void> {
  const rt = getStoredRefreshToken();
  try {
    await apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: rt ?? undefined }),
    });
  } catch {
    /* still clear locally */
  }
  clearTokens();
}

export async function fetchMe(): Promise<{ user: PublicUser }> {
  return apiFetch("/users/me");
}

export type MealsListResponse = {
  meals: Meal[];
  total: number;
  skip: number;
  limit: number;
};

export async function listMeals(
  params: Record<string, string | number | undefined> = {},
): Promise<MealsListResponse> {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const qs = q.toString();
  return apiFetch(`/meals${qs ? `?${qs}` : ""}`);
}

export async function createMeal(body: {
  title?: string;
  notes?: string;
  eatenAt: string;
  nutrition: Record<string, number | undefined>;
}): Promise<{ meal: Meal }> {
  return apiFetch("/meals", { method: "POST", body: JSON.stringify(body) });
}

export async function getMeal(id: string): Promise<{ meal: Meal }> {
  return apiFetch(`/meals/${id}`);
}

export async function updateMeal(
  id: string,
  body: Record<string, unknown>,
): Promise<{ meal: Meal }> {
  return apiFetch(`/meals/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteMeal(id: string): Promise<void> {
  return apiFetch(`/meals/${id}`, { method: "DELETE" });
}

export async function fetchSummaryOverview(): Promise<unknown> {
  return apiFetch("/summary");
}

export async function updateProfile(body: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}): Promise<{ user: PublicUser }> {
  return apiFetch("/users/me", { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteAccount(password: string): Promise<void> {
  return apiFetch("/users/me", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}

export async function fetchIntegrations(): Promise<{ integration: unknown }> {
  return apiFetch("/integrations");
}

export async function fetchAdminStats(
  sections?: string,
): Promise<Record<string, unknown>> {
  const q = sections ? `?sections=${encodeURIComponent(sections)}` : "";
  return apiFetch(`/admin/stats${q}`);
}

export async function fetchAdminMeals(
  params: Record<string, string | number | undefined> = {},
): Promise<MealsListResponse & { meals: Meal[] }> {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  return apiFetch(`/admin/meals?${q}`);
}

export async function fetchAdminUsers(
  skip = 0,
  limit = 20,
): Promise<{ users: PublicUser[]; total: number }> {
  return apiFetch(`/admin/users?skip=${skip}&limit=${limit}`);
}

export async function setUserRole(
  userId: string,
  role: "user" | "admin",
): Promise<{ user: PublicUser }> {
  return apiFetch(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function deleteAdminMeal(mealId: string): Promise<void> {
  return apiFetch(`/admin/meals/${mealId}`, { method: "DELETE" });
}

export { baseUrl };
