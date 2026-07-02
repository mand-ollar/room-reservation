export const ACCESS_TOKEN_STORAGE_KEY = "room-reservation-access-token";
export const REFRESH_TOKEN_STORAGE_KEY = "room-reservation-refresh-token";

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

export function getStoredTokens(): StoredTokens | null {
  const accessToken: string | null = localStorage.getItem(
    ACCESS_TOKEN_STORAGE_KEY,
  );
  const refreshToken: string | null = localStorage.getItem(
    REFRESH_TOKEN_STORAGE_KEY,
  );

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export function setStoredTokens(tokens: StoredTokens): void {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
}

export function clearStoredTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}
