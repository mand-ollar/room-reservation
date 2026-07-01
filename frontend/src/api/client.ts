import type { ApiErrorDetail } from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, body: string) {
    const detail: string = parseDetail(body);
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

const parseDetail = (body: string): string => {
  try {
    const parsed: unknown = JSON.parse(body);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "detail" in parsed
    ) {
      const { detail } = parsed as ApiErrorDetail;
      if (typeof detail === "string") {
        return detail;
      }
      if (Array.isArray(detail)) {
        return detail.map((item) => item.msg).join(", ");
      }
    }
  } catch {
    // fall through to raw body
  }
  return body || "Unknown error";
};

type ApiFetchOptions = RequestInit & {
  accessToken?: string;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { accessToken, headers, ...rest } = options;
  const apiUrl: string = import.meta.env.VITE_API_URL;

  const authHeaders: Record<string, string> = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};

  const response: Response = await fetch(`${apiUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function checkHealth(): Promise<boolean> {
  try {
    await apiFetch<{ status: "ok" }>("/health");
    return true;
  } catch {
    return false;
  }
}
