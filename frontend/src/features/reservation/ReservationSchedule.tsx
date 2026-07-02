import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ReservationPublicResponse } from "@/api/types";
import { useAuth } from "@/lib/auth/useAuth";

import {
  EventDialog,
  type EventDialogState,
} from "./EventDialog";
import type { SlotTimeRange, CalendarDraftPreview } from "./calendarUtils";
import {
  findMyReservation,
  getOwnRejectedPublicReservations,
  useMyReservations,
} from "./useMyReservations";
import {
  findAdminSpaceReservation,
  invalidateAdminSpaceReservations,
  useAdminSpaceReservations,
} from "./useAdminSpaceReservations";
import { invalidateSpaceReservations } from "./useSpaceReservations";
import { WeekCalendar } from "./WeekCalendar";

type ReservationScheduleMode = "public" | "admin";

type ReservationScheduleProps = {
  spaceId: string | null;
  currentUserName: string | null;
  mode?: ReservationScheduleMode;
};

export function ReservationSchedule({
  spaceId,
  currentUserName,
  mode = "public",
}: ReservationScheduleProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdminMode: boolean = mode === "admin";
  const { myReservations, refetch: refetchMyReservations } = useMyReservations(
    !isAdminMode && user !== null,
  );
  const {
    reservations: adminReservations,
    isLoading: isAdminReservationsLoading,
    errorKey: adminReservationsErrorKey,
    refetch: refetchAdminReservations,
  } = useAdminSpaceReservations(isAdminMode ? spaceId : null);
  const [dialogState, setDialogState] = useState<EventDialogState | null>(null);
  const [draftRange, setDraftRange] = useState<SlotTimeRange | null>(null);

  const ownRejectedReservations = useMemo(() => {
    if (isAdminMode || !spaceId || !user) {
      return [];
    }

    return getOwnRejectedPublicReservations(
      myReservations,
      spaceId,
      user.name,
    );
  }, [isAdminMode, myReservations, spaceId, user]);

  const calendarDraft: CalendarDraftPreview | null = useMemo(() => {
    if (!draftRange) {
      return null;
    }

    const excludeReservation: ReservationPublicResponse | null =
      dialogState !== null && dialogState.mode !== "create"
        ? dialogState.reservation
        : null;

    return {
      startAt: draftRange.startAt,
      endAt: draftRange.endAt,
      userName: currentUserName,
      excludeReservation,
    };
  }, [draftRange, dialogState, currentUserName]);

  useEffect(() => {
    if (isAdminMode || !dialogState || dialogState.mode === "create" || !spaceId) {
      return;
    }

    if (!dialogState.isOwn || dialogState.reservationId) {
      return;
    }

    const myReservation = findMyReservation(
      myReservations,
      dialogState.reservation,
      spaceId,
    );

    if (myReservation) {
      setDialogState({
        mode: "view",
        reservation: dialogState.reservation,
        reservationId: myReservation.id,
        isOwn: true,
        memo: myReservation.memo ?? null,
      });
    }
  }, [dialogState, isAdminMode, myReservations, spaceId]);

  const handleSlotSelect = (range: SlotTimeRange): void => {
    setDialogState({
      mode: "create",
      startAt: range.startAt,
      endAt: range.endAt,
    });
  };

  const handleEventSelect = (reservation: ReservationPublicResponse): void => {
    if (!spaceId) {
      return;
    }

    if (isAdminMode) {
      const adminReservation = findAdminSpaceReservation(
        adminReservations,
        reservation,
      );

      setDialogState({
        mode: "view",
        reservation,
        reservationId: adminReservation?.reservationId ?? null,
        isOwn: true,
        memo: adminReservation?.memo ?? reservation.memo ?? null,
      });
      return;
    }

    const isOwn: boolean =
      currentUserName !== null && reservation.user_name === currentUserName;
    const myReservation = isOwn
      ? findMyReservation(myReservations, reservation, spaceId)
      : undefined;

    setDialogState({
      mode: "view",
      reservation,
      reservationId: myReservation?.id ?? null,
      isOwn,
      memo: myReservation?.memo ?? reservation.memo ?? null,
    });
  };

  const handleMutated = (): void => {
    if (spaceId) {
      invalidateSpaceReservations(spaceId);
      if (isAdminMode) {
        invalidateAdminSpaceReservations(spaceId);
      }
    }

    if (isAdminMode) {
      refetchAdminReservations();
      return;
    }

    refetchMyReservations();
  };

  const externalReservations = isAdminMode
    ? {
        reservations: adminReservations,
        isLoading: isAdminReservationsLoading,
        errorKey: adminReservationsErrorKey,
      }
    : undefined;

  return (
    <div className="reservation-schedule">
      {!spaceId ? (
        <div className="reservation-schedule__overlay">
          <p className="reservation-layout__placeholder-text">
            {t("reservation.schedule.selectSpace")}
          </p>
        </div>
      ) : null}

      <WeekCalendar
        spaceId={spaceId}
        currentUserName={currentUserName}
        draftPreview={calendarDraft}
        ownRejectedReservations={ownRejectedReservations}
        externalReservations={externalReservations}
        highlightAllAsOwn={isAdminMode}
        onSlotSelect={
          spaceId && !isAdminMode && user !== null
            ? handleSlotSelect
            : undefined
        }
        onEventSelect={spaceId ? handleEventSelect : undefined}
      />

      {spaceId ? (
        <EventDialog
          spaceId={spaceId}
          state={dialogState}
          isLoggedIn={isAdminMode || user !== null}
          isAdminMode={isAdminMode}
          onClose={() => {
            setDialogState(null);
            setDraftRange(null);
          }}
          onMutated={handleMutated}
          onDraftChange={setDraftRange}
        />
      ) : null}
    </div>
  );
}
