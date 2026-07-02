import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchBuildings, fetchAllSpaces } from "@/api/buildings";
import { ApiError } from "@/api/client";
import {
  fetchAdminReservations,
  fetchReservationsBySpace,
} from "@/api/reservations";
import type {
  BuildingResponse,
  Locale,
  ReservationPublicResponse,
  ReservationResponse,
  ReservationStatus,
  SpaceResponse,
} from "@/api/types";
import { getStoredAdminTokens } from "@/lib/auth/adminStorage";
import { getLocalizedName, useAppLocale } from "@/lib/locale";

export type ApprovalRow = {
  id: string;
  spaceId: string;
  userName: string;
  locationLabel: string;
  startAt: string;
  endAt: string;
  memo: string | null;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalListMode = "pending" | "history";

type ApprovalListErrorKey = "load" | null;

type UseApprovalListResult = {
  rows: ApprovalRow[];
  isLoading: boolean;
  errorKey: ApprovalListErrorKey;
  refetch: () => void;
};

function reservationMatchKey(
  reservation: Pick<
    ReservationPublicResponse,
    "start_at" | "end_at" | "status"
  >,
): string {
  return `${reservation.start_at}|${reservation.end_at}|${reservation.status}`;
}

function buildLocationLabel(
  space: SpaceResponse | undefined,
  building: BuildingResponse | undefined,
  locale: Locale,
  floorLabel: string,
  unknownLocation: string,
): string {
  if (!space) {
    return unknownLocation;
  }

  const spaceName: string = getLocalizedName(space.names, locale);
  const buildingName: string = building
    ? getLocalizedName(building.names, locale)
    : unknownLocation;

  return `${buildingName} · ${floorLabel} · ${spaceName}`;
}

async function loadApprovalRows(
  mode: ApprovalListMode,
  locale: Locale,
  floorLabelFor: (floor: number) => string,
  unknownLocation: string,
  unknownUser: string,
): Promise<ApprovalRow[]> {
  const tokens = getStoredAdminTokens();
  if (!tokens) {
    throw new ApiError(401, "Missing admin session");
  }

  const [adminReservations, buildings, spaces] = await Promise.all([
    mode === "pending"
      ? fetchAdminReservations(tokens.accessToken, { status: "PENDING" })
      : fetchAdminReservations(tokens.accessToken),
    fetchBuildings(),
    fetchAllSpaces(),
  ]);

  const filteredReservations: ReservationResponse[] =
    mode === "pending"
      ? adminReservations.filter(
          (reservation: ReservationResponse) =>
            reservation.status === "PENDING",
        )
      : adminReservations.filter(
          (reservation: ReservationResponse) =>
            reservation.status !== "PENDING",
        );

  const buildingById: Map<string, BuildingResponse> = new Map(
    buildings.map((building: BuildingResponse) => [building.id, building]),
  );
  const spaceById: Map<string, SpaceResponse> = new Map(
    spaces.map((space: SpaceResponse) => [space.id, space]),
  );

  const uniqueSpaceIds: string[] = [
    ...new Set(
      filteredReservations.map(
        (reservation: ReservationResponse) => reservation.space_id,
      ),
    ),
  ];

  const publicReservationsBySpace: Map<
    string,
    Map<string, ReservationPublicResponse>
  > = new Map();

  await Promise.all(
    uniqueSpaceIds.map(async (spaceId: string) => {
      const publicReservations: ReservationPublicResponse[] =
        await fetchReservationsBySpace(
          spaceId,
          mode === "pending" ? "PENDING" : undefined,
        );
      const byKey: Map<string, ReservationPublicResponse> = new Map(
        publicReservations.map((reservation: ReservationPublicResponse) => [
          reservationMatchKey(reservation),
          reservation,
        ]),
      );
      publicReservationsBySpace.set(spaceId, byKey);
    }),
  );

  const rows: ApprovalRow[] = filteredReservations.map(
    (reservation: ReservationResponse) => {
      const space: SpaceResponse | undefined = spaceById.get(
        reservation.space_id,
      );
      const building: BuildingResponse | undefined = space
        ? buildingById.get(space.building_id)
        : undefined;
      const publicReservation: ReservationPublicResponse | undefined =
        publicReservationsBySpace
          .get(reservation.space_id)
          ?.get(reservationMatchKey(reservation));

      return {
        id: reservation.id,
        spaceId: reservation.space_id,
        userName: publicReservation?.user_name ?? unknownUser,
        locationLabel: buildLocationLabel(
          space,
          building,
          locale,
          space ? floorLabelFor(space.floor) : unknownLocation,
          unknownLocation,
        ),
        startAt: reservation.start_at,
        endAt: reservation.end_at,
        memo: reservation.memo ?? publicReservation?.memo ?? null,
        status: reservation.status,
        createdAt: reservation.created_at,
        updatedAt: reservation.updated_at,
      };
    },
  );

  if (mode === "pending") {
    rows.sort(
      (left: ApprovalRow, right: ApprovalRow) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  } else {
    rows.sort(
      (left: ApprovalRow, right: ApprovalRow) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    );
  }

  return rows;
}

export function useApprovalList(mode: ApprovalListMode): UseApprovalListResult {
  const { t } = useTranslation();
  const locale = useAppLocale();
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorKey, setErrorKey] = useState<ApprovalListErrorKey>(null);
  const [fetchVersion, setFetchVersion] = useState<number>(0);

  const refetch = useCallback((): void => {
    setFetchVersion((current: number) => current + 1);
  }, []);

  useEffect(() => {
    let active: boolean = true;

    setIsLoading(true);
    setErrorKey(null);

    void loadApprovalRows(
      mode,
      locale,
      (floor: number) => t("reservation.location.floorLabel", { floor }),
      t("admin.approvals.unknownLocation"),
      t("admin.approvals.unknownUser"),
    )
      .then((nextRows: ApprovalRow[]) => {
        if (!active) {
          return;
        }
        setRows(nextRows);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        if (error instanceof ApiError) {
          setErrorKey("load");
        }
        setRows([]);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetchVersion, locale, mode, t]);

  return { rows, isLoading, errorKey, refetch };
}

/** @deprecated Use ApprovalRow */
export type PendingApprovalRow = ApprovalRow;

/** @deprecated Use useApprovalList("pending") */
export function usePendingApprovals(): UseApprovalListResult {
  return useApprovalList("pending");
}
