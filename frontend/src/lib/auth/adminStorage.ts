export const ADMIN_ACCESS_TOKEN_STORAGE_KEY =
  "room-reservation-admin-access-token";
export const ADMIN_REFRESH_TOKEN_STORAGE_KEY =
  "room-reservation-admin-refresh-token";

export type StoredAdminTokens = {
  accessToken: string;
  refreshToken: string;
};

export function getStoredAdminTokens(): StoredAdminTokens | null {
  const accessToken: string | null = localStorage.getItem(
    ADMIN_ACCESS_TOKEN_STORAGE_KEY,
  );
  const refreshToken: string | null = localStorage.getItem(
    ADMIN_REFRESH_TOKEN_STORAGE_KEY,
  );

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export function setStoredAdminTokens(tokens: StoredAdminTokens): void {
  localStorage.setItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
  localStorage.setItem(ADMIN_REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
}

export function clearStoredAdminTokens(): void {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_REFRESH_TOKEN_STORAGE_KEY);
}
