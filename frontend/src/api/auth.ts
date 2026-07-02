import { apiFetch } from "./client";
import type { TokenResponse, UserResponse } from "./types";

export type LoginPayload = {
  name: string;
  phone: string;
};

export type AdminLoginPayload = {
  password: string;
};

export async function loginUser(payload: LoginPayload): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginAdmin(
  payload: AdminLoginPayload,
): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/auth/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(
  accessToken: string,
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/auth/me", { accessToken });
}

export async function refreshAuthTokens(
  refreshToken: string,
): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}
