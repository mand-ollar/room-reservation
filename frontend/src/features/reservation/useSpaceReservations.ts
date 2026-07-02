import { useEffect, useState } from "react";

import { fetchReservationsBySpace } from "@/api/reservations";
import { ApiError } from "@/api/client";
import type { ReservationPublicResponse } from "@/api/types";

const reservationsBySpaceId: Map<string, ReservationPublicResponse[]> =
  new Map<string, ReservationPublicResponse[]>();

type UseSpaceReservationsResult = {
  reservations: ReservationPublicResponse[];
  isLoading: boolean;
  errorKey: "loadReservations" | null;
};

export function useSpaceReservations(
  spaceId: string | null,
): UseSpaceReservationsResult {
  const [reservations, setReservations] = useState<ReservationPublicResponse[]>(
    () => (spaceId ? (reservationsBySpaceId.get(spaceId) ?? []) : []),
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    () => (spaceId ? !reservationsBySpaceId.has(spaceId) : false),
  );
  const [errorKey, setErrorKey] = useState<"loadReservations" | null>(null);

  useEffect(() => {
    if (!spaceId) {
      return;
    }

    const cached: ReservationPublicResponse[] | undefined =
      reservationsBySpaceId.get(spaceId);

    if (cached) {
      setReservations(cached);
      setIsLoading(false);
      setErrorKey(null);
    } else {
      setIsLoading(true);
      setErrorKey(null);
    }

    let active: boolean = true;

    void fetchReservationsBySpace(spaceId)
      .then((data: ReservationPublicResponse[]) => {
        if (!active) {
          return;
        }
        reservationsBySpaceId.set(spaceId, data);
        setReservations(data);
        setErrorKey(null);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        if (error instanceof ApiError) {
          setErrorKey("loadReservations");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [spaceId]);

  if (!spaceId) {
    return {
      reservations: [],
      isLoading: false,
      errorKey: null,
    };
  }

  return { reservations, isLoading, errorKey };
}
