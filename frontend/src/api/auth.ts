import { apiFetch } from "./client";
import type { TokenResponse, UserResponse } from "./types";

export type LoginPayload = {
  name: string;
  phone: string;
};

export type AdminLoginPayload = {
  password: string;
};

export type ChangeAdminPasswordPayload = {
  current_password: string;
  new_password: string;
};

export const MIN_ADMIN_PASSWORD_LENGTH = 8;

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

export async function changeAdminPassword(
  accessToken: string,
  payload: ChangeAdminPasswordPayload,
): Promise<void> {
  return apiFetch<void>("/auth/admin/password", {
    method: "PATCH",
    accessToken,
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
