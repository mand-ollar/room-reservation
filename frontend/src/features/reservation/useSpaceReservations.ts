import { useEffect, useState } from "react";

import { fetchReservationsBySpace } from "@/api/reservations";
import { ApiError } from "@/api/client";
import type { ReservationPublicResponse } from "@/api/types";

type UseSpaceReservationsResult = {
  reservations: ReservationPublicResponse[];
  isLoading: boolean;
  errorKey: "loadReservations" | null;
};

export function useSpaceReservations(
  spaceId: string | null,
): UseSpaceReservationsResult {
  const [reservations, setReservations] = useState<ReservationPublicResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorKey, setErrorKey] = useState<"loadReservations" | null>(null);

  useEffect(() => {
    if (!spaceId) {
      setReservations([]);
      setIsLoading(false);
      setErrorKey(null);
      return;
    }

    let active: boolean = true;

    setIsLoading(true);
    setErrorKey(null);

    void fetchReservationsBySpace(spaceId)
      .then((data: ReservationPublicResponse[]) => {
        if (!active) {
          return;
        }
        setReservations(data);
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

  return { reservations, isLoading, errorKey };
}
