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

  return (
    <div className="reservation-schedule">
      {!spaceId ? (
        <div className="reservation-schedule__overlay">
          <p className="reservation-layout__placeholder-text">
            {t("reservation.schedule.selectSpace")}
          </p>
        </div>
      ) : null}

      <WeekCalendar spaceId={spaceId} currentUserName={currentUserName} />
    </div>
  );
}
