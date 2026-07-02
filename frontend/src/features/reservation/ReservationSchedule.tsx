import { useTranslation } from "react-i18next";

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

  if (!spaceId) {
    return (
      <div className="reservation-layout__placeholder">
        <p className="reservation-layout__placeholder-text">
          {t("reservation.schedule.selectSpace")}
        </p>
      </div>
    );
  }

  return (
    <div className="reservation-schedule">
      <WeekCalendar spaceId={spaceId} currentUserName={currentUserName} />
    </div>
  );
}
