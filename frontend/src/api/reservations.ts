import { apiFetch } from "./client";
import type { ReservationPublicResponse, ReservationStatus } from "./types";

export async function fetchReservationsBySpace(
  spaceId: string,
  status?: ReservationStatus,
): Promise<ReservationPublicResponse[]> {
  const query: string = status ? `?status=${status}` : "";
  return apiFetch<ReservationPublicResponse[]>(
    `/reservations/${spaceId}${query}`,
  );
}
