import { useCallback, useEffect, useState } from "react";

import {
  fetchAdminReservations,
  fetchReservationsBySpace,
} from "@/api/reservations";
import { ApiError } from "@/api/client";
import type {
  ReservationPublicResponse,
  ReservationResponse,
} from "@/api/types";
import { getStoredAdminTokens } from "@/lib/auth/adminStorage";

export type AdminSpaceReservation = ReservationPublicResponse & {
  reservationId: string;
};

const adminReservationsBySpaceId: Map<string, AdminSpaceReservation[]> = new Map<
  string,
  AdminSpaceReservation[]
>();

const invalidationListeners: Set<() => void> = new Set<() => void>();

export function invalidateAdminSpaceReservations(spaceId: string): void {
  adminReservationsBySpaceId.delete(spaceId);
  invalidationListeners.forEach((listener: () => void) => {
    listener();
  });
}

function reservationMatchKey(
  reservation: Pick<
    ReservationPublicResponse,
    "start_at" | "end_at" | "status"
  >,
): string {
  return `${reservation.start_at}|${reservation.end_at}|${reservation.status}`;
}

function mergeAdminSpaceReservations(
  publicReservations: ReservationPublicResponse[],
  adminReservations: ReservationResponse[],
): AdminSpaceReservation[] {
  const adminByKey: Map<string, ReservationResponse> = new Map<
    string,
    ReservationResponse
  >();

  for (const reservation of adminReservations) {
    adminByKey.set(reservationMatchKey(reservation), reservation);
  }

  return publicReservations.flatMap(
    (publicReservation: ReservationPublicResponse) => {
      const adminReservation: ReservationResponse | undefined = adminByKey.get(
        reservationMatchKey(publicReservation),
      );

      if (!adminReservation) {
        return [];
      }

      return [
        {
          ...publicReservation,
          memo: publicReservation.memo ?? adminReservation.memo ?? null,
          reservationId: adminReservation.id,
        },
      ];
    },
  );
}

type UseAdminSpaceReservationsResult = {
  reservations: AdminSpaceReservation[];
  isLoading: boolean;
  errorKey: "loadReservations" | null;
  refetch: () => void;
};

export function useAdminSpaceReservations(
  spaceId: string | null,
): UseAdminSpaceReservationsResult {
  const [reservations, setReservations] = useState<AdminSpaceReservation[]>(
    () => (spaceId ? (adminReservationsBySpaceId.get(spaceId) ?? []) : []),
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    () => (spaceId ? !adminReservationsBySpaceId.has(spaceId) : false),
  );
  const [errorKey, setErrorKey] = useState<"loadReservations" | null>(null);
  const [fetchVersion, setFetchVersion] = useState<number>(0);

  const refetch = useCallback((): void => {
    if (spaceId) {
      adminReservationsBySpaceId.delete(spaceId);
    }
    setFetchVersion((current: number) => current + 1);
  }, [spaceId]);

  useEffect(() => {
    invalidationListeners.add(refetch);
    return () => {
      invalidationListeners.delete(refetch);
    };
  }, [refetch]);

  useEffect(() => {
    if (!spaceId) {
      return;
    }

    const cached: AdminSpaceReservation[] | undefined =
      adminReservationsBySpaceId.get(spaceId);

    if (cached) {
      setReservations(cached);
      setIsLoading(false);
      setErrorKey(null);
    } else {
      setIsLoading(true);
      setErrorKey(null);
    }

    const tokens = getStoredAdminTokens();
    if (!tokens) {
      setReservations([]);
      setIsLoading(false);
      setErrorKey("loadReservations");
      return;
    }

    let active: boolean = true;

    void Promise.all([
      fetchReservationsBySpace(spaceId),
      fetchAdminReservations(tokens.accessToken, { spaceId }),
    ])
      .then(
        ([publicReservations, adminReservations]: [
          ReservationPublicResponse[],
          ReservationResponse[],
        ]) => {
          if (!active) {
            return;
          }

          const merged: AdminSpaceReservation[] = mergeAdminSpaceReservations(
            publicReservations,
            adminReservations,
          );
          adminReservationsBySpaceId.set(spaceId, merged);
          setReservations(merged);
          setErrorKey(null);
        },
      )
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
  }, [spaceId, fetchVersion]);

  if (!spaceId) {
    return {
      reservations: [],
      isLoading: false,
      errorKey: null,
      refetch: () => undefined,
    };
  }

  return { reservations, isLoading, errorKey, refetch };
}

export function findAdminSpaceReservation(
  reservations: AdminSpaceReservation[],
  publicReservation: ReservationPublicResponse,
): AdminSpaceReservation | undefined {
  return reservations.find(
    (reservation: AdminSpaceReservation) =>
      reservationMatchKey(reservation) === reservationMatchKey(publicReservation),
  );
}
