import { apiFetch } from "./client";
import type {
  ReservationPublicResponse,
  ReservationResponse,
  ReservationStatus,
} from "./types";

export type CreateReservationBody = {
  space_id: string;
  start_at: string;
  end_at: string;
  memo?: string | null;
};

export type UpdateReservationBody = {
  start_at: string;
  end_at: string;
  memo?: string | null;
};

export async function fetchReservationsBySpace(
  spaceId: string,
  status?: ReservationStatus,
): Promise<ReservationPublicResponse[]> {
  const query: string = status ? `?status=${status}` : "";
  return apiFetch<ReservationPublicResponse[]>(
    `/reservations/${spaceId}${query}`,
  );
}

export async function fetchAdminReservations(
  accessToken: string,
  filters?: {
    spaceId?: string;
    status?: ReservationStatus;
  },
): Promise<ReservationResponse[]> {
  const params: URLSearchParams = new URLSearchParams();

  if (filters?.spaceId) {
    params.set("space_id", filters.spaceId);
  }

  if (filters?.status) {
    params.set("status", filters.status);
  }

  const query: string = params.size > 0 ? `?${params.toString()}` : "";

  return apiFetch<ReservationResponse[]>(`/admin/reservations${query}`, {
    accessToken,
  });
}

export async function fetchMyReservations(
  accessToken: string,
): Promise<ReservationResponse[]> {
  return apiFetch<ReservationResponse[]>("/reservations/me", { accessToken });
}

export async function createReservation(
  accessToken: string,
  body: CreateReservationBody,
): Promise<ReservationResponse> {
  return apiFetch<ReservationResponse>("/reservations", {
    method: "POST",
    accessToken,
    body: JSON.stringify(body),
  });
}

export async function updateReservation(
  accessToken: string,
  reservationId: string,
  body: UpdateReservationBody,
): Promise<ReservationResponse> {
  return apiFetch<ReservationResponse>(`/reservations/${reservationId}`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify(body),
  });
}

export async function cancelReservation(
  accessToken: string,
  reservationId: string,
): Promise<ReservationResponse> {
  return apiFetch<ReservationResponse>(
    `/reservations/${reservationId}/cancel`,
    {
      method: "POST",
      accessToken,
    },
  );
}
