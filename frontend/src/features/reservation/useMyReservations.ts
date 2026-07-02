import { useCallback, useEffect, useState } from "react";

import { fetchMyReservations } from "@/api/reservations";
import { ApiError } from "@/api/client";
import type {
  ReservationPublicResponse,
  ReservationResponse,
} from "@/api/types";
import { getStoredTokens } from "@/lib/auth/storage";

export function findMyReservation(
  myReservations: ReservationResponse[],
  publicReservation: ReservationPublicResponse,
  spaceId: string,
): ReservationResponse | undefined {
  return myReservations.find(
    (reservation: ReservationResponse) =>
      reservation.space_id === spaceId &&
      reservation.start_at === publicReservation.start_at &&
      reservation.end_at === publicReservation.end_at,
  );
}

type UseMyReservationsResult = {
  myReservations: ReservationResponse[];
  isLoading: boolean;
  refetch: () => void;
};

export function useMyReservations(enabled: boolean): UseMyReservationsResult {
  const [myReservations, setMyReservations] = useState<ReservationResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(enabled);

  const refetch = useCallback((): void => {
    const tokens = getStoredTokens();
    if (!enabled || !tokens) {
      setMyReservations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    void fetchMyReservations(tokens.accessToken)
      .then((data: ReservationResponse[]) => {
        setMyReservations(data);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          setMyReservations([]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [enabled]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { myReservations, isLoading, refetch };
}
