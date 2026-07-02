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
  useMyReservations,
} from "./useMyReservations";
import { invalidateSpaceReservations } from "./useSpaceReservations";
import { WeekCalendar } from "./WeekCalendar";

type ReservationScheduleProps = {
  spaceId: string | null;
  currentUserName: string | null;
};

export function ReservationSchedule({
  spaceId,
  currentUserName,
}: ReservationScheduleProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { myReservations, refetch: refetchMyReservations } = useMyReservations(
    user !== null,
  );
  const [dialogState, setDialogState] = useState<EventDialogState | null>(null);
  const [draftRange, setDraftRange] = useState<SlotTimeRange | null>(null);

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
    if (!dialogState || dialogState.mode === "create" || !spaceId) {
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
  }, [dialogState, myReservations, spaceId]);

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
    }
    refetchMyReservations();
  };

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
        onSlotSelect={spaceId ? handleSlotSelect : undefined}
        onEventSelect={spaceId ? handleEventSelect : undefined}
      />

      {spaceId ? (
        <EventDialog
          spaceId={spaceId}
          state={dialogState}
          isLoggedIn={user !== null}
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
