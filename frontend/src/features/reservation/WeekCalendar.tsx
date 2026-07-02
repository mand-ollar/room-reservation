import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { ReservationPublicResponse, ReservationStatus } from "@/api/types";
import { useAppLocale } from "@/lib/locale";

import {
  addWeeks,
  formatHourLabel,
  formatTimezoneOffset,
  formatTimeRange,
  formatWeekRange,
  getEventSegmentsForWeek,
  getWeekDays,
  getWeekStart,
  HOURS_PER_DAY,
  isSameDay,
  MINUTES_PER_DAY,
  reservationOverlapsWeek,
  type CalendarEventSegment,
} from "./calendarUtils";
import { useSpaceReservations } from "./useSpaceReservations";

type WeekCalendarProps = {
  spaceId: string | null;
  currentUserName: string | null;
};

const DEFAULT_SCROLL_HOUR = 8;

const statusClassName: Record<ReservationStatus, string> = {
  PENDING: "week-calendar__event--pending",
  APPROVED: "week-calendar__event--approved",
  REJECTED: "week-calendar__event--rejected",
  CANCELLED: "week-calendar__event--cancelled",
};

export function WeekCalendar({ spaceId, currentUserName }: WeekCalendarProps) {
  const { t, i18n } = useTranslation();
  const locale: string = useAppLocale();
  const { reservations, isLoading, errorKey } = useSpaceReservations(spaceId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledInitiallyRef = useRef<boolean>(false);

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [now, setNow] = useState<Date>(() => new Date());

  const weekDays: Date[] = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const today: Date = useMemo(() => {
    const current: Date = new Date();
    current.setHours(0, 0, 0, 0);
    return current;
  }, []);

  const weekLabel: string = useMemo(
    () => formatWeekRange(weekStart, i18n.language),
    [weekStart, i18n.language],
  );

  const timezoneLabel: string = useMemo(() => formatTimezoneOffset(), []);

  const dayHeaderFormatter: Intl.DateTimeFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language === "en" ? "en-US" : "ko-KR", {
        weekday: "short",
      }),
    [i18n.language],
  );

  const visibleReservations: ReservationPublicResponse[] = useMemo(
    () =>
      reservations.filter((reservation: ReservationPublicResponse) =>
        reservationOverlapsWeek(
          reservation.start_at,
          reservation.end_at,
          weekStart,
        ),
      ),
    [reservations, weekStart],
  );

  const eventSegments: CalendarEventSegment[] = useMemo(() => {
    return visibleReservations.flatMap(
      (reservation: ReservationPublicResponse, index: number) => {
        const isOwn: boolean =
          currentUserName !== null && reservation.user_name === currentUserName;

        return getEventSegmentsForWeek(
          reservation,
          weekDays,
          isOwn,
          String(index),
        );
      },
    );
  }, [visibleReservations, weekDays, currentUserName]);

  const todayIndex: number = useMemo(
    () => weekDays.findIndex((day: Date) => isSameDay(day, today)),
    [weekDays, today],
  );

  const nowLinePercent: number | null = useMemo(() => {
    if (todayIndex < 0) {
      return null;
    }

    const minutes: number = now.getHours() * 60 + now.getMinutes();
    return (minutes / MINUTES_PER_DAY) * 100;
  }, [now, todayIndex]);

  useEffect(() => {
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (hasScrolledInitiallyRef.current) {
      return;
    }

    const container: HTMLDivElement | null = scrollRef.current;
    if (!container) {
      return;
    }

    const calendarRoot: Element | null = container.closest(".week-calendar");
    const styles: CSSStyleDeclaration = getComputedStyle(
      calendarRoot ?? container,
    );
    const hourHeight: number = Number.parseFloat(
      styles.getPropertyValue("--calendar-hour-height"),
    );
    const resolvedHourHeight: number = Number.isFinite(hourHeight)
      ? hourHeight
      : 48;

    container.scrollTop = DEFAULT_SCROLL_HOUR * resolvedHourHeight;
    hasScrolledInitiallyRef.current = true;
  }, []);

  const goToPreviousWeek = (): void => {
    setWeekStart((current: Date) => addWeeks(current, -1));
  };

  const goToNextWeek = (): void => {
    setWeekStart((current: Date) => addWeeks(current, 1));
  };

  const goToToday = (): void => {
    setWeekStart(getWeekStart(new Date()));
  };

  const showInitialLoad: boolean =
    spaceId !== null && isLoading && reservations.length === 0;

  return (
    <div className="week-calendar">
      <header className="week-calendar__toolbar">
        <div className="week-calendar__nav">
          <button
            type="button"
            className="week-calendar__today-button"
            onClick={goToToday}
          >
            {t("reservation.schedule.today")}
          </button>
          <button
            type="button"
            className="week-calendar__nav-button"
            onClick={goToPreviousWeek}
            aria-label={t("reservation.schedule.prevWeek")}
          >
            ‹
          </button>
          <button
            type="button"
            className="week-calendar__nav-button"
            onClick={goToNextWeek}
            aria-label={t("reservation.schedule.nextWeek")}
          >
            ›
          </button>
        </div>
        <p className="week-calendar__range">{weekLabel}</p>
      </header>

      {errorKey ? (
        <p className="week-calendar__inline-error" role="alert">
          {t("reservation.schedule.errors.loadReservations")}
        </p>
      ) : null}

      <div className="week-calendar__frame">
        <div className="week-calendar__day-headers">
          <div className="week-calendar__gutter-spacer">
            <span className="week-calendar__timezone">{timezoneLabel}</span>
          </div>

          {weekDays.map((day: Date) => {
            const isToday: boolean = isSameDay(day, today);
            const dayNumber: string = String(day.getDate());

            return (
              <div
                key={day.toISOString()}
                className={`week-calendar__day-header${isToday ? " week-calendar__day-header--today" : ""}`}
              >
                <span className="week-calendar__day-name">
                  {dayHeaderFormatter.format(day)}
                </span>
                <span className="week-calendar__day-date">{dayNumber}</span>
              </div>
            );
          })}
        </div>

        <div ref={scrollRef} className="week-calendar__scroll">
          <div className="week-calendar__grid-body">
            <div className="week-calendar__grid-lines" aria-hidden="true" />

            <div className="week-calendar__time-gutter" aria-hidden="true">
              {Array.from({ length: HOURS_PER_DAY }, (_value: unknown, hour: number) => (
                <span
                  key={hour}
                  className="week-calendar__time-label"
                  style={{ top: `${(hour / HOURS_PER_DAY) * 100}%` }}
                >
                  {hour === 0 ? "" : formatHourLabel(hour, i18n.language)}
                </span>
              ))}
            </div>

            <div
              className={`week-calendar__day-columns${showInitialLoad ? " week-calendar__day-columns--loading" : ""}`}
            >
              {weekDays.map((day: Date, dayIndex: number) => {
                const isToday: boolean = isSameDay(day, today);
                const daySegments: CalendarEventSegment[] = eventSegments.filter(
                  (segment: CalendarEventSegment) => segment.dayIndex === dayIndex,
                );

                return (
                  <div
                    key={day.toISOString()}
                    className={`week-calendar__day-column${isToday ? " week-calendar__day-column--today" : ""}`}
                  >
                    {isToday && nowLinePercent !== null ? (
                      <div
                        className="week-calendar__now-line"
                        style={{ top: `${nowLinePercent}%` }}
                      />
                    ) : null}

                    {daySegments.map((segment: CalendarEventSegment) => {
                      const status: ReservationStatus = segment.reservation.status;
                      const statusClass: string = statusClassName[status];
                      const ownClass: string = segment.isOwn
                        ? " week-calendar__event--own"
                        : "";

                      return (
                        <div
                          key={segment.key}
                          className={`week-calendar__event ${statusClass}${ownClass}`}
                          style={{
                            top: `${segment.topPercent}%`,
                            height: `${segment.heightPercent}%`,
                          }}
                          title={`${segment.reservation.user_name} · ${formatTimeRange(segment.reservation.start_at, segment.reservation.end_at, locale)}`}
                        >
                          <span className="week-calendar__event-name">
                            {segment.reservation.user_name}
                          </span>
                          <span className="week-calendar__event-time">
                            {formatTimeRange(
                              segment.reservation.start_at,
                              segment.reservation.end_at,
                              locale,
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
